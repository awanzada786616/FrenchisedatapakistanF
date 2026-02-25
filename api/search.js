const admin = require('firebase-admin');

// Backend Name Pools (Unlimited combinations)
const mFirst = ["MUHAMMAD", "DILAWAR", "SHARJEEL", "ABDUL", "GHULAM", "MUSHTAQ", "AHMED", "ALI", "IMRAN", "ZOHAIB", "WASEEM", "TANVEER", "IRFAN", "SHAHID", "MUBASHIR", "ADIL", "KAMRAN", "USMAN", "NOMAN", "FAHAD", "HAMZA", "AQEEL", "BASHIR", "SAJID", "ARSHAD", "MUNIR", "IFTIKHAR", "KHALID", "SOHAIL", "NAVEED"];
const mLast = ["KHAN", "AHMED", "MEHMOOD", "SHAH", "JUTT", "GUJJAR", "BUTT", "HASSAN", "AKRAM", "ALI", "DIN", "ABBAS", "RAZA", "SADIQ", "MANSHA", "NABI", "FAISAL", "IQBAL", "ASLAM", "QURESHI"];
const fFirst = ["AMMARAN", "WAHEEDA", "FIROZA", "MAJEEDAN", "RESHMAN", "SAKINAH", "ZOHRA", "KHURSHEED", "SADIA", "NASEEM", "BUSHRA", "RAZIA", "SHAMIM", "KHALIDA", "ZAKIA", "RUBINA", "FOZIA", "NAZIA", "SOBIA", "REHANA", "SAIRA", "FARZANA", "KAUSAR", "SHAHIDA"];
const fLast = ["BIBI", "GUL", "MAI", "BEGUM", "AKHTER", "PARVEEN", "SHAHEEN", "KHANAM", "BANO", "BATOOL"];
const cities = ["LAHORE", "KARACHI", "ISLAMABAD", "FAISALABAD", "MULTAN", "RAWALPINDI", "PESHAWAR", "QUETTA", "SARGODHA", "SIALKOT"];

// Initialize Firebase Admin correctly
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIRE_PROJECT_ID,
                clientEmail: process.env.FIRE_CLIENT_EMAIL,
                // Newline handling for Vercel
                privateKey: process.env.FIRE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            })
        });
    } catch (e) {
        console.error("Firebase Init Error:", e);
    }
}

const db = admin.firestore();

export default async function handler(req, res) {
    const { number } = req.query;
    const authHeader = req.headers.authorization;
    const ownerID = "+994401879953";

    if (!number || !authHeader) {
        return res.status(401).json({ success: false, msg: "Auth Required" });
    }

    try {
        // 1. Token Check
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // 2. Profile Check
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();
        const userData = userDoc.data();

        if (!userData || userData.coins < 1) {
            return res.status(402).json({ success: false, msg: "No Coins Left" });
        }

        const today = new Date().toISOString().split('T')[0];
        if (userData.validTo && today > userData.validTo) {
            return res.status(403).json({ success: false, msg: "Account Expired" });
        }

        // 3. Deduct Coin
        await userRef.update({ coins: admin.firestore.FieldValue.increment(-1) });

        // 4. Data Logic
        let clean = number.startsWith('0') ? number.substring(1) : number;
        let finalData;

        try {
            const apiResponse = await fetch(`https://paksimdata.ftgmhacks.workers.dev/?number=${clean}`);
            const result = await apiResponse.json();

            if (result && result.success && result.data.records.length > 0 && !result.data.records[0].full_name.includes('***')) {
                const r = result.data.records[0];
                finalData = {
                    n: r.full_name.toUpperCase(),
                    c: r.cnic,
                    a: (r.address || "NOT FOUND").toUpperCase()
                };
            } else {
                throw new Error("No Real Data");
            }
        } catch (err) {
            // Fake Data Generation
            const isMale = Math.random() > 0.4;
            const name = isMale ? 
                `${mFirst[Math.floor(Math.random()*mFirst.length)]} ${mLast[Math.floor(Math.random()*mLast.length)]}` : 
                `${fFirst[Math.floor(Math.random()*fFirst.length)]} ${fLast[Math.floor(Math.random()*fLast.length)]}`;

            finalData = {
                n: name,
                c: `35${Math.floor(Math.random()*8+1)}0${Math.floor(Math.random()*8+1)}-${Math.floor(1000000+Math.random()*8999999)}-1`,
                a: `STREET ${Math.floor(Math.random()*25)}, MODEL TOWN, ${cities[Math.floor(Math.random()*cities.length)]}`
            };
        }

        return res.status(200).json({
            success: true,
            owner: ownerID,
            data: finalData
        });

    } catch (e) {
        console.error("Function Error:", e.message);
        return res.status(500).json({ success: false, msg: "Server Internal Error" });
    }
                }
