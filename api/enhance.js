// api/enhance.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { image } = req.body;
    if (!image) {
        return res.status(400).json({ error: 'No image URL provided' });
    }

    try {
        const response = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                version: "36d7ff67c17669c5b4357c2735c8f6f52b6d49a2e199c5354babc8f60c0e17de",
                input: { image }
            })
        });

        const prediction = await response.json();
        res.status(200).json(prediction);
    } catch (error) {
        res.status(500).json({ error: 'Failed to process image', details: error.message });
    }
}
}
