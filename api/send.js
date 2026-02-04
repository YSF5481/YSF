import FormData from "form-data";
import fetch from "node-fetch";
import formidable from "formidable";
import fs from "fs/promises";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if(req.method !== "POST") return res.status(405).send("Only POST allowed");

    const webhook1 = process.env.DISCORD_WEBHOOK1;
    const webhook2 = process.env.DISCORD_WEBHOOK2;

    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if(err) {
            console.error("Formidable parse error:", err);
            return res.status(500).json({error: "Form parse error"});
        }

        try {
            const user = fields.user;
            const message = fields.message || "";
            const target = fields.target;
            const image = files.image;

            const webhook = target === "2" ? webhook2 : webhook1;

            const payload = { content: `📨 ${user}: ${message}` };
            const formData = new FormData();
            formData.append("payload_json", JSON.stringify(payload));

            if(image){
                const data = await fs.readFile(image.filepath);
                formData.append("file", data, image.originalFilename);
            }

            const resp = await fetch(webhook, { method: "POST", body: formData });

            if(!resp.ok){
                console.error("Discord fetch error:", resp.status, await resp.text());
                return res.status(500).json({error: "Discord fetch failed"});
            }

            return res.status(200).json({ success: true });
        } catch(err) {
            console.error("Backend error:", err);
            return res.status(500).json({error: err.message});
        }
    });
}
