module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageBase64, mediaType } = req.body;

  if (!imageBase64 || !mediaType) {
    return res.status(400).json({ error: "Faltan imageBase64 o mediaType" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: imageBase64 },
              },
              {
                type: "text",
                text: `Eres un psicólogo del arte con profunda sensibilidad poética. Analiza esta pintura como si fuera una ventana al alma de quien la creó en una sesión de paint & sip.

Observa con atención: los colores y su temperatura emocional, la calidad de los trazos, la composición, el uso del espacio, las luces y sombras, los objetos o formas representadas.

Genera un análisis íntimo y poético en exactamente 3 párrafos, sin títulos ni numeración:

1. Qué revelan los colores y trazos sobre el estado emocional actual
2. Qué dice la composición sobre la personalidad profunda
3. Un mensaje de cierre cálido e inspirador

Habla en segunda persona, tono poético y amable, sin tecnicismos. Máximo 220 palabras.`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Error de API" });
    }

    const texto = data.content?.find((b) => b.type === "text")?.text;
    return res.status(200).json({ analisis: texto });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
