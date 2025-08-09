export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: "No image provided" });
  }

  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "nightmareai/real-esrgan:latest",
        input: { image }
      })
    });

    const prediction = await response.json();

    // Poll until complete
    let status = prediction.status;
    while (status !== "succeeded" && status !== "failed") {
      await new Promise(r => setTimeout(r, 3000));
      const poll = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { "Authorization": `Token ${process.env.REPLICATE_API_KEY}` }
      });
      const pollData = await poll.json();
      status = pollData.status;
      if (status === "succeeded") {
        return res.status(200).json({ url: pollData.output[0] });
      } else if (status === "failed") {
        return res.status(500).json({ error: "Enhancement failed" });
      }
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
