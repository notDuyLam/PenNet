const nodemailer = require("nodemailer");

require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports.sendVerificationEmail = async (email, token) => {
  const verificationLink = `${process.env.HOST_WEB}/users/verify?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Verify Your Email",
    html: `
        <h1>Email Verification</h1>
        <p>Please click the button below to verify your email:</p>
        <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
      `,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent to", email);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports.sendResetPasswordEmail = async (email, token) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Password Reset Request",
    html: `
      <h1>Password Reset</h1>
      <p>We received a request to reset your password. Please use the token below to reset your password:</p>
      <p style="font-size: 20px; font-weight: bold; color: #FF5733;">${token}</p>
      <p>This token will expire in 15 minutes. If you did not request a password reset, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return "Password reset email sent to " + email;
  } catch (error) {
    return error;
  }
};
