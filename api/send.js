export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).send("Only POST allowed");
  }

  const { user, message } = req.body;

  const webhook = process.env.DISCORD_WEBHOOK;

  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `📨 ${user}: ${message}`
    })
  });

  res.status(200).json({ success: true });
}
