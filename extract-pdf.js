// Vercel Serverless Function — extracción de texto PDF
// Recibe { pdf_base64: "..." } y devuelve { text, chars, pages }
const pdfParse = require('pdf-parse');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { pdf_base64 } = req.body;
    if (!pdf_base64) return res.status(400).json({ error: 'pdf_base64 requerido' });

    const buffer = Buffer.from(pdf_base64, 'base64');

    if (buffer.slice(0, 4).toString() !== '%PDF') {
      return res.status(400).json({ error: 'El archivo no es un PDF válido' });
    }

    const data = await pdfParse(buffer);
    const text = (data.text || '').trim();

    if (!text || text.length < 15) {
      return res.status(422).json({
        error: 'No se pudo extraer texto. El PDF puede ser una imagen escaneada. Por favor copia y pega el texto manualmente.'
      });
    }

    res.json({ text, chars: text.length, pages: data.numpages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
