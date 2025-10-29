const express = require("express");
const cors = require("cors");
const path = require("path");
const { getRates } = require("./back/backCambio");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

// Servir arquivos estáticos (CSS, JS, imagens)
app.use(express.static(path.join(__dirname)));

// Servir index.html na raiz
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// API de cotações
app.get("/api/rates", async (req, res) => {
  try {
    const data = await getRates();
    res.json(data);
  } catch (err) {
    console.error("❌ /api/rates error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
