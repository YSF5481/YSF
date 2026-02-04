import fetch from "node-fetch";
import FormData from "form-data";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if(req.method !== "POST") return res.status(405).send("Only POST allowed");

    try {
        // Multipart form verisini buffer olarak alıyoruz
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const buffer = Buffer.concat(chunks);
        const raw = buffer.toString();

        // Basit regex ile user, message, target al
        const messageMatch = raw.match(/name="message"\r\n\r\n([\s\S]*?)\r\n--/);
        const userMatch = raw.match(/name="user"\r\n\r\n([\s\S]*?)\r\n--/);
        const targetMatch = raw.match(/name="target"\r\n\r\n([\s\S]*?)\r\n--/);

        const message = messageMatch ? messageMatch[1] : "";
        const user = userMatch ? userMatch[1] : "Bilinmeyen";
        const target = targetMatch ? targetMatch[1] : "1";

        const webhook1 = process.env.DISCORD_WEBHOOK1;
        const webhook2 = process.env.DISCORD_WEBHOOK2;
        const webhook = target === "2" ? webhook2 : webhook1;

        const formData = new FormData();
        formData.append("payload_json", JSON.stringify({ content: `📨 ${user}: ${message}` }));

        const resp = await fetch(webhook, { method: "POST", body: formData });

        if(!resp.ok){
            const text = await resp.text();
            console.error("Discord fetch error:", resp.status, text);
            return res.status(500).json({ error: "Discord fetch failed" });
        }

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error("Backend error:", err);
        return res.status(500).json({ error: err.message });
    }
}
