import nodemailer from "nodemailer"
import dotenv from "dotenv";
dotenv.config();
const sendMails = (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,                // TLS port
    secure: false,
    // service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false,  // allow self-signed certificates
    },
  })
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Your otp for email verification",
    text: `This otp is : ${ otp } for ${ email }`
  }
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Error sending mail:", err);
    } else {
      console.log("Mail sent successfully:", info.response);
    }
  });
}

export default sendMails;