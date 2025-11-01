import { AddName, GetName, EditName, DeleteName, Signup, verifyEmail, 
  GetAllUsers, otpUpdate, LoginUser, DelUsersById, LogoutUser, EditUser,
  ForgotPassword, ResetPassword } from "../controllers/controller.js";
import { verifyToken, getUserProfile }  from "../middleware/auth.js"
import express from "express";
const routes = express.Router();

routes.post("/postname", verifyToken, AddName);
routes.post("/sign", Signup);
routes.post("/verify", verifyEmail);
routes.get("/getname", verifyToken, GetName);
routes.put("/editname/:id", verifyToken, EditName);  
routes.delete("/deletename/:id", verifyToken, DeleteName);
routes.get("/users", GetAllUsers);
routes.put("/resend/:id", otpUpdate);
routes.post("/login", LoginUser);
routes.delete("/deleteuser/:id", DelUsersById);
routes.post("/logout", LogoutUser);
routes.get("/profile", verifyToken, getUserProfile);
routes.put("/edituser/:id", verifyToken, EditUser);
routes.post("/forgot-password", ForgotPassword);
routes.post("/reset-password/:token", ResetPassword);

export default routes;