import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import routes from "./routes_dir/routes.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://todolist-frontend-react-vite-ui-pro.vercel.app"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected!"))
  .catch((err) => console.log("MongoDB Connection Error!", err));

app.use("/api", routes);
app.get("/", (req, res) => {
  res.send("ToDoList Backend API is running...");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on PORT: http://localhost:${ PORT }`);
});
