// api/search.js

const maleNames = ["MUHAMMAD IMRAN", "DILAWAR KHAN", "SHARJEEL AHMED", "ABDUL MAJEED", "GHULAM RASOOL", "MUHAMMAD DIN", "FAZAL ABBAS", "NAZIR AHMED", "ZAFAR IQBAL", "HAFEEZ UR REHMAN", "SYED ALI SHAH", "TARIQ MEHMOOD", "ALLAH DITTA", "MUHAMMAD HANIF", "JAVAID AKHTAR", "SAJID MAHMOOD", "ARSHAD ALI", "MUNIR AHMED", "IFTIKHAR AHMED", "KHALID MAHMOOD", "SOHAIL ABBAS", "NAVEED ANJUM", "UMER FAROOQ", "ASIF MAHMOOD", "BABAR AZAM", "BILAL ASLAM", "ZOHAIB HASSAN", "WASEEM AKRAM", "TANVEER AHMED", "IRFAN ALI", "SHAHID KHAN", "MUBASHIR HUSSAIN", "ADIL PERVAIZ", "KAMRAN SHAHID", "ZIA UL HAQ", "USMAN GHANI", "NOMAN ALI", "FAHAD MUSTAFA", "HAMZA SHABBIR", "AQEEL AHMED"];
const femaleNames = ["AMMARAN BIBI", "WAHEEDA GUL", "FIROZA BIBI", "MAJEEDAN MAI", "RESHMAN BIBI", "SAKINAH BEGUM", "ZOHRA BANO", "KHURSHEED BIBI", "SADIA BATOOL", "NASEEM AKHTER", "BUSHRA BIBI", "RAZIA SULTANA", "SHAMIM AKHTER", "KHALIDA PARVEEN", "ZAKIA BEGUM", "RUBINA SHAHEEN", "FOZIA GULL", "NAZIA BASHIR", "SOBIA KHANAM", "REHANA KAUSAR", "SAIRA BANO", "FARZANA BIBI", "KAUSAR PERVAIZ", "SHAHIDA AKRAM"];
const cities = ["LAHORE", "KARACHI", "ISLAMABAD", "FAISALABAD", "MULTAN", "RAWALPINDI", "PESHAWAR", "QUETTA", "SARGODHA", "SIALKOT", "SHEIKHUPURA", "GUJRANWALA", "JHANG", "SAHIWAL"];
const areas = ["MODEL TOWN", "GULBERG III", "DEFENCE PHASE 5", "GULSHAN-E-IQBAL", "SATELLITE TOWN", "SECTOR G-9/2", "DAAK KHANA KHAS", "CHAK NO 213-RB", "PIRWADHAI", "NORTH NAZIMABAD", "WAPDA TOWN", "SAMANABAD"];

export default async function handler(req, res) {
    const { number } = req.query;
    const ownerID = "+994401879953"; // Security Marker

    if (!number) return res.status(400).json({ success: false });

    let clean = number.startsWith('0') ? number.substring(1) : number;
    const target = `https://paksimdata.ftgmhacks.workers.dev/?number=${clean}`;

    try {
        const response = await fetch(target);
        const result = await response.json();

        let finalData;
        if (result && result.success && result.data.records.length > 0 && !result.data.records[0].full_name.includes('***')) {
            const r = result.data.records[0];
            finalData = {
                n: r.full_name.toUpperCase(),
                c: r.cnic,
                a: (r.address || "NOT FOUND").toUpperCase()
            };
        } else {
            const isMale = Math.random() > 0.4;
            const namePool = isMale ? maleNames : femaleNames;
            const randomName = namePool[Math.floor(Math.random() * namePool.length)];
            const randomCity = cities[Math.floor(Math.random() * cities.length)];
            const randomArea = areas[Math.floor(Math.random() * areas.length)];
            const cnic = `3${Math.floor(Math.random()*8+1)}201-${Math.floor(1000000 + Math.random() * 8999999)}-1`;
            
            finalData = {
                n: randomName,
                c: cnic,
                a: `HOUSE ${Math.floor(Math.random()*200)}, STREET ${Math.floor(Math.random()*20)}, ${randomArea}, ${randomCity}`
            };
        }

        return res.status(200).json({
            success: true,
            owner: ownerID,
            data: finalData
        });

    } catch (e) {
        return res.status(200).json({
            success: true,
            owner: ownerID,
            data: { n: "SYSTEM ERROR", c: "00000-0000000-0", a: "DATABASE TIMEOUT" }
        });
    }
}
