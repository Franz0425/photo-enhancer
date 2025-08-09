export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    // 1️⃣ Send image to Replicate API
    const startResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "8e768db6c5fbdccf8a5f1055bce38efef0ebd2f230c9e8b97c48d6b3cc9361b6", // Replace with your Replicate model version
        input: { image }
      }),
    });

    const startData = await startResponse.json();
    if (startData.error) {
      return res.status(500).json({ error: startData.error });
    }

    const predictionId = startData.id;

    // 2️⃣ Poll Replicate until done
    let status = startData.status;
    let output = null;
    let tries = 0;

    while (status !== "succeeded" && status !== "failed" && tries < 60) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // wait 5 sec
      tries++;

      const checkResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      const checkData = await checkResponse.json();
      status = checkData.status;
      output = checkData.output;
    }

    if (status === "failed") {
      return res.status(500).json({ error: "Enhancement failed." });
    }

    // 3️⃣ Return final image URL
    return res.status(200).json({ output: output[0] });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
