import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import userModel from "../model/userSchema.js";
import crypto from "crypto";

const registerController = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const lowerCaseUsername = username.toLowerCase();

    const existingEmail = await userModel.findOne({ email });
    const existingUsername = await userModel.findOne({
      username: lowerCaseUsername,
    });

    if (existingEmail) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    if (existingUsername) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      username: lowerCaseUsername,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res
      .status(201)
      .json({ message: "User Registered Successfully", newUser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const loginController = async (req, res) => {
  try {
    const { username, password } = req.body;

    const lowerCaseUsername = username.toLowerCase();

    const user = await userModel.findOne({ username: lowerCaseUsername });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }



    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const generateResetPasswordToken = () => {
  return crypto.randomBytes(20).toString("hex");
};

const forgotPasswordController = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a reset password token 
    const resetPasswordToken = generateResetPasswordToken();

    // Associate the reset password token with the user
    user.resetPasswordToken = resetPasswordToken;
    await user.save();

    const resetPasswordLink = `http://localhost:4500/reset-password/${resetPasswordToken}`;

    // Generate and send reset password email
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: "karankumarr0002@gmail.com",
      to: email,
      subject: "Reset Password",
      text: `Click the following link to reset your password: ${resetPasswordLink}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Reset password email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const resetPasswordController = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const user = await userModel.findOne({ resetPasswordToken: token });
    if (!user) {
      return res.status(404).json({ message: "Invalid token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Reset password logic
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export { registerController, loginController, forgotPasswordController, resetPasswordController };
