import Replicate from "replicate";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    // Make sure you set REPLICATE_API_TOKEN in your Vercel Project Settings → Environment Variables
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Example: Using "sczhou/codeformer" for face restoration & enhancement
    const output = await replicate.run(
      "sczhou/codeformer:1c9b45226e3e1c5ebf2b7a61d6f094f7a6bca3f067d57f1a0ed2c6e3cf1a7c16", 
      {
        input: {
          image: image,
          upscale: 2,      // 2x upscale
          face_upsample: true,
          codeformer_fidelity: 0.7
        }
      }
    );

    res.status(200).json({ url: output });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Enhancement failed" });
  }
}
