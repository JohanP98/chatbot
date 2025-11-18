import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRoutes from "./routes/chatRoutes.js";
import "./db.js";
import loginRoutes from "./routes/loginRoutes.js";


dotenv.config();

const app = express();

app.use(express.json());


const allowedOrigin = process.env.ALLOWED_ORIGIN || "http://localhost:5500";
app.use(
  cors({
    origin: allowedOrigin
  })
);

app.use("/api", chatRoutes);
app.use("/api", loginRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
  console.log(`Permitiendo CORS desde: ${allowedOrigin}`);
});


console.log("Debug ENV:");
console.log("PORT:", process.env.PORT);
console.log("OLLAMA_URL:", process.env.OLLAMA_URL);
console.log("OLLAMA_MODEL:", process.env.OLLAMA_MODEL);
console.log("ALLOWED_ORIGIN:", process.env.ALLOWED_ORIGIN);