import { AddName, GetName, EditName, DeleteName, Signup, verifyEmail, 
  GetAllUsers, otpUpdate, LoginUser, DelUsersById, LogoutUser, EditUser,
  ForgotPassword, ResetPassword } from "../controllers/controller.js";
import { verifyToken, getUserProfile }  from "../middleware/auth.js"
import express from "express";
const routes = express.Router();

routes.post("/postname", AddName);
routes.post("/sign", Signup);
routes.post("/verify", verifyEmail);
routes.get("/getname", GetName);
routes.put("/editname/:id", EditName);  
routes.delete("/deletename/:id", DeleteName);
routes.get("/users", GetAllUsers);
routes.put("/resend/:id", verifyToken, otpUpdate);
routes.post("/login", LoginUser);
routes.delete("/deleteuser/:id", DelUsersById);
routes.post("/logout", LogoutUser);
routes.get("/profile", verifyToken, getUserProfile);
routes.put("/edituser/:id", verifyToken, EditUser);
routes.post("/forgot-password", ForgotPassword);
routes.post("/reset-password/:token", ResetPassword);

export default routes;