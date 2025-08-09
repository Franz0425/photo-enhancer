export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'No image provided' });
  }

  try {
    // Step 1 — Start enhancement
    const startRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "36d7ff67c17669c5b4357c2735c8f6f52b6d49a2e199c5354babc8f60c0e17de",
        input: { image }
      })
    });

    const startData = await startRes.json();

    if (startRes.status !== 201) {
      return res.status(startRes.status).json(startData);
    }

    // Return the prediction ID so frontend can poll
    return res.status(200).json({
      id: startData.id,
      status: startData.status
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
