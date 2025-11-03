import jwt from "jsonwebtoken";
import User from "../schema_model/user.js"
export const verifyToken = async(req, res, next) => {
  try {
    let token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.split(" ")[1]);
    if (!token) {
      return res.status(401).json({
        message: "Not authenticated! Token missing.",
        status_code: 401,
      });
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return res.status(401).json({
      message:
        err.name === "TokenExpiredError"
          ? "Token expired! Please login again."
          : "Invalid or malformed token!",
      status_code: 401,
    });
  }
};
export const getUserProfile = (req, res) => {
  return res.status(200).json({
    message: "Profile fetched successfully!",
    user: req.user,
  });
};
