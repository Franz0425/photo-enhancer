export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST requests allowed" });
    }

    const { image } = req.body;
    if (!image) {
        return res.status(400).json({ error: "Image URL or Base64 required" });
    }

    try {
        const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
                "Authorization": `Token ${process.env.REPLICATE_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                version: "nightmareai/real-esrgan:latest", // 4K upscale
                input: { image }
            })
        });

        let prediction = await replicateResponse.json();

        // Poll until finished
        while (prediction.status !== "succeeded" && prediction.status !== "failed") {
            await new Promise(r => setTimeout(r, 3000));
            const poll = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
                headers: { "Authorization": `Token ${process.env.REPLICATE_API_KEY}` }
            });
            prediction = await poll.json();
        }

        if (prediction.status === "succeeded") {
            res.status(200).json({ output: prediction.output[0] });
        } else {
            res.status(500).json({ error: "Enhancement failed" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
}
