import FormData from "form-data";
import fetch from "node-fetch";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if(req.method !== "POST") return res.status(405).send("Only POST allowed");

    const webhook1 = process.env.DISCORD_WEBHOOK1;
    const webhook2 = process.env.DISCORD_WEBHOOK2;

    const target = req.headers["target"] || req.query.target;

    const webhook = target === "2" ? webhook2 : webhook1;

    try {
        // multipart/form-data parsing
        const formidable = (await import("formidable")).default;
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            if(err) return res.status(500).json({error: err.message});

            const user = fields.user;
            const message = fields.message || "";
            const image = files.image;

            const payload = { content: `📨 ${user}: ${message}` };

            const formData = new FormData();
            formData.append("payload_json", JSON.stringify(payload));

            if(image){
                const fs = (await import("fs")).promises;
                const data = await fs.readFile(image.filepath);
                formData.append("file", data, image.originalFilename);
            }

            await fetch(webhook, { method: "POST", body: formData });
            res.status(200).json({ success: true });
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
}
