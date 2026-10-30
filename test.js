import fetch from "node-fetch";
import { config } from "./config.js";

const prompt = "안녕하세요";

const url = `https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generateText`;

const run = async () => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": config.geminiApiKey },
    body: JSON.stringify({
      prompt: prompt,
      temperature: 0.7,
      maxOutputTokens: 256
    }),
  });
  if (!res.ok) throw new Error(`Gemini request failed with status: ${res.status}`);
  const data = await res.json();
  console.log(data);
};

run().catch(() => {
  console.error("Gemini request failed");
  process.exitCode = 1;
});
