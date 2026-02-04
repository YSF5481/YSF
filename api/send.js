export default async function handler(req, res) {
    if(req.method !== "POST"){
        return res.status(405).send("Only POST allowed");
    }

    const { user, message, target } = req.body;

    const webhook1 = process.env.DISCORD_WEBHOOK1; // Senin Discord
    const webhook2 = process.env.DISCORD_WEBHOOK2; // Kuzenin Discord

    const webhook = target === "1" ? webhook1 : webhook2;

    try {
        await fetch(webhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: `📨 ${user}: ${message}` })
        });
        res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
}
