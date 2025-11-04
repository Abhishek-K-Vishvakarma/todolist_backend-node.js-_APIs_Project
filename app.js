import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import routes from "./routes_dir/routes.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "http://localhost:5174", 
      "https://todolist-frontend-react-vite-ui-pro.vercel.app",
    ],
    credentials: true,
  })
);
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log("MongoDB Connected!")).catch((err) => console.log("MongoDB Connection Error!", err));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename, "uploads");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", routes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on PORT: http://localhost:${PORT}`);
});
