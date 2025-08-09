export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: "No image provided" });
  }

  // ✅ Load token from Vercel environment
  const replicateToken = process.env.REPLICATE_API_TOKEN;
  if (!replicateToken) {
    return res.status(500).json({ error: "Missing API token" });
  }

  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${replicateToken}`,
      },
      body: JSON.stringify({
        version: "7de2ea26c616d5bf2245ad0d5d5e5e13cbb14c244a2ec28c58a219d0f3b6ac5a", // Example model version
        input: { image: image }
      }),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "API request failed" });
  }
}
