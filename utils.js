import nodemailer from "nodemailer"
import dotenv from "dotenv";
dotenv.config();
const sendMails = (email, otp)=> {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS
    }
  })

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Your otp for email verification",
    text : `This otp is : ${otp} for ${email}`
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