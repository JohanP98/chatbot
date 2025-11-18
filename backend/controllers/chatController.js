import systemPrompt from "../prompts/systemPrompt.js";
import dotenv from "dotenv";
dotenv.config();

const OLLAMA_URL = process.env.OLLAMA_URL;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma3";

export const handleChat = async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res
      .status(400)
      .json({ answer: "Debes enviar una pregunta válida." });
  }

  try {
    const prompt = `
${systemPrompt}

Pregunta del estudiante:
${message}
`;

    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false
      })
    });

    if (!response.ok) {
      console.error("Ollama devolvió un error HTTP:", response.status);
      return res.status(502).json({
        answer: "Hubo un problema al comunicarse con el modelo de IA."
      });
    }

    const data = await response.json();

    const answer =
      data.response ||
      data.output ||
      data.message ||
      (data.results && data.results[0] && data.results[0].response) ||
      "No se pudo obtener una respuesta del modelo.";

    res.json({ answer });
  } catch (error) {
    console.error("❌ Error en el backend:", error.message);
    res.status(500).json({
      answer:
        "Error al conectar con Ollama. Asegúrate de que esté ejecutándose correctamente."
    });
  }
};
