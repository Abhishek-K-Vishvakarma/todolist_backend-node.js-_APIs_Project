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
      process.env.FRONTENT_LOCALHOST_URL,
      process.env.SERVER_VERCEL_URL
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log("MongoDB Connected!")).catch((err) => console.log("MongoDB Connection Error!", err));

app.use("/api", routes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on PORT: http://localhost:${ PORT }`);
});
