const nodemailer = require("nodemailer");
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  SMTP_REJECT_UNAUTHORIZED,
} = require("./envConfig");

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: parseInt(SMTP_PORT, 10),
  secure: SMTP_SECURE === "true",
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: SMTP_REJECT_UNAUTHORIZED === "true",
  },
});

module.exports = { transporter };