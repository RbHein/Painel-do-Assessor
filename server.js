const express = require("express");
const cors = require("cors");
const path = require("path");
const { getRates } = require("./back/backCambio");

const app = express();

// 🚨 IMPORTANTE: use sempre a variável de ambiente do Railway
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

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
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
