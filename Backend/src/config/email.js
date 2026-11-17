import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_ADDRESS = "Kimathi Marketplace <onboarding@resend.dev>";

export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char];
  });
}

export async function sendEmail({ to, subject, html }) {
  if (!resend) {
    console.warn("Email skipped: RESEND_API_KEY is not set");
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Email send failed:", error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Email send failed:", err.message);
    return null;
  }
}