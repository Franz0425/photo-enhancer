export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { image } = req.body;

    const startResponse = await fetch("https://api.replicate.com/v1/predictions", {
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

    let prediction = await startResponse.json();

    if (prediction.error) {
      return res.status(500).json({ error: prediction.error });
    }

    let statusMessage = "🕒 Waiting in queue...";
    console.log(statusMessage);

    // Poll until done
    while (prediction.status !== "succeeded" && prediction.status !== "failed") {
      await new Promise(r => setTimeout(r, 3000));

      const poll = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { "Authorization": `Token ${process.env.REPLICATE_API_KEY}` }
      });

      prediction = await poll.json();

      if (prediction.status === "starting") {
        statusMessage = "🚀 Enhancing photo...";
      } else if (prediction.status === "processing") {
        statusMessage = "✨ Almost done...";
      } else if (prediction.status === "succeeded") {
        statusMessage = "✅ Enhancement complete!";
      }
      console.log(statusMessage);
    }

    res.status(200).json(prediction);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
