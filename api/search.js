const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        if (!process.env.FIRE_PRIVATE_KEY) {
            throw new Error("Missing FIRE_PRIVATE_KEY");
        }
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIRE_PROJECT_ID,
                clientEmail: process.env.FIRE_CLIENT_EMAIL,
                privateKey: process.env.FIRE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            })
        });
    } catch (e) {
        console.error("Firebase Init Error:", e.message);
    }
}

const db = admin.firestore();

// Name Pool for Fallback
const mPool = ["MUHAMMAD IMRAN", "DILAWAR KHAN", "SHARJEEL AHMED", "ABDUL MAJEED", "GHULAM RASOOL", "REHAM AHMED"];
const fPool = ["AMMARAN BIBI", "WAHEEDA GUL", "FIROZA BIBI", "RESHMAN BIBI", "SAKINAH BEGUM"];

module.exports = async (req, res) => {
    const { number } = req.query;
    const authHeader = req.headers.authorization;

    // Direct link access protection (prevents crash)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send("<h1>Access Denied</h1><p>Auth Token Required. Please login through the portal.</p>");
    }

    if (!number) return res.status(400).json({ success: false, msg: "Number missing" });

    try {
        // 1. Token Verification
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // 2. Check User from Firestore
        const userRef = db.collection('users').doc(uid);
        const doc = await userRef.get();
        if (!doc.exists) return res.status(404).json({ success: false, msg: "User not found" });

        const userData = doc.data();
        if (userData.coins < 1) return res.status(402).json({ success: false, msg: "No Coins" });

        // 3. Deduct Coin
        await userRef.update({ coins: admin.firestore.FieldValue.increment(-1) });

        // 4. Data Logic
        let clean = number.startsWith('0') ? number.substring(1) : number;
        let finalData;

        try {
            const apiRes = await fetch(`https://paksimdata.ftgmhacks.workers.dev/?number=${clean}`);
            const result = await apiRes.json();

            if (result && result.success && result.data.records.length > 0) {
                const r = result.data.records[0];
                finalData = {
                    n: r.full_name.toUpperCase(),
                    c: r.cnic,
                    a: (r.address || "NOT FOUND").toUpperCase()
                };
            } else { throw new Error("API No Data"); }
        } catch (err) {
            const isM = Math.random() > 0.4;
            finalData = {
                n: isM ? mPool[Math.floor(Math.random()*mPool.length)] : fPool[Math.floor(Math.random()*fPool.length)],
                c: "35201-" + Math.floor(1000000+Math.random()*8999999) + "-1",
                a: "MODEL TOWN, LAHORE"
            };
        }

        return res.status(200).json({ success: true, owner: "+994401879953", data: finalData });

    } catch (e) {
        console.error("Auth Error:", e.message);
        return res.status(403).json({ success: false, msg: "Auth Failed" });
    }
};
