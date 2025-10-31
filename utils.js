import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMails = async (email, otp) => {
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL,
      to: email,
      subject: "Your OTP for Email Verification",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Your OTP Code</h2>
          <p>Dear user,</p>
          <p>Your OTP for email verification is:</p>
          <h3 style="color: #007BFF;">${ otp }</h3>
          <p>This code will expire in 5 minutes.</p>
          <br/>
          <p>Best regards,<br/>ToDo List App</p>
        </div>
      `,
    });
    console.log("Mail sent successfully:", data);
  } catch (error) {
    console.error("Error sending mail:", error);
  }
};

export default sendMails;
