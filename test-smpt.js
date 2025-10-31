// test-gmail.js
import nodemailer from "nodemailer";

const accounts = [
  { user: "oluwese4life2@gmail.com", pass: "yjdphxbjgtddlfxs" },
];

const host = "smtp.gmail.com";
const port = 587;
const secure = false;

(async () => {
  for (const { user, pass } of accounts) {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      logger: true,
    });

    try {
      await transporter.verify();
      console.log(`✅ ${user} - SMTP connection OK`);
    } catch (err) {
      console.error(`❌ ${user} - ${err.message}`);
    }
  }
})();