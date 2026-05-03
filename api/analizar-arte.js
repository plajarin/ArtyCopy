export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { imageBase64, mediaType } = req.body;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: imageBase64 }
            },
            {
              type: "text",
              text: `Eres ARTyFLOW, un analista de personalidad que lee el alma de las personas a través de su arte. 
              
Analiza esta pintura creada en una sesión de ArtyVinos y genera una lectura íntima y reveladora de la personalidad de quien la pintó. Observa los colores elegidos, la energía de los trazos, la composición, el uso del espacio, y qué eligió representar.

Responde SOLO con un JSON válido con esta estructura exacta:
{
  "titulo": "un título poético de 4-6 palabras que capture la esencia de la persona",
  "esencia": "un párrafo de 3-4 frases sobre su estado emocional y energía interior, en segunda persona, tono cálido y revelador",
  "caracter": "un párrafo de 3-4 frases sobre su personalidad profunda y cómo se relaciona con el mundo",
  "mensaje": "un mensaje inspirador y personal de 2-3 frases como cierre, que la persona quiera guardar",
  "palabras": ["3", "a", "5", "palabras", "clave"]
}`
            }
          ]
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Error de API");

    const raw = data.content.find(b => b.type === "text")?.text || "";
    const analysis = JSON.parse(raw.replace(/```json|```/g, "").trim());

    return res.status(200).json(analysis);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
