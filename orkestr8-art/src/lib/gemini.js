import { GoogleGenAI } from "@google/genai";

// Uses the Gemini Developer API (API key) via the Google GenAI SDK.
// Docs: https://ai.google.dev/gemini-api/docs/image-generation
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function generateImage(prompt) {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("Missing GOOGLE_API_KEY env var");
  }

  const response = await ai.models.generateContent({
    // Image generation model (Nano Banana)
    model: "gemini-2.5-flash-image",
    contents: prompt,
  });

  const parts = response?.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p) => p?.inlineData?.data);
  const base64 = imagePart?.inlineData?.data;

  if (!base64) {
    // Helpful debugging info (often you'll get text parts with an explanation)
    const text = parts.map((p) => p?.text).filter(Boolean).join("\n");
    throw new Error(text || "No image generated");
  }

  const buffer = Buffer.from(base64, "base64");

  const cloudinary = require("cloudinary").v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: "image" }, (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      })
      .end(buffer);
  });
}
