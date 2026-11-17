import LegalPage from "../components/LegalPage";
import { contactSentence } from "../config/site";

const sections = [
  {
    heading: "What we collect",
    paragraphs: ["When you use Kimathi Marketplace, we collect:"],
    bullets: [
      "Account details: your name, email address, hostel or location, and an optional profile photo. Your password is never stored as plain text, only as a one-way hash.",
      "Content you create: listings and their photos, messages to other users, and any reports or appeals you submit.",
      "Information saved in your own browser: a login token that keeps you signed in, and your light or dark theme choice. We do not use advertising or tracking cookies.",
    ],
    closing: [
      "Our hosting providers may also keep standard technical logs, such as IP addresses, as part of running their services.",
    ],
  },
  {
    heading: "How we use it",
    bullets: [
      "To run the marketplace: show listings, let you message other users and manage your account.",
      "To send emails about your account, such as a welcome message or a notice that your account was suspended.",
      "To review reports and appeals, enforce our terms and keep the platform safe.",
    ],
    closing: ["We do not sell your information, and we do not show advertising."],
  },
  {
    heading: "What other people can see",
    bullets: [
      "Your name, profile photo and hostel or location appear on your profile and next to your listings.",
      "Your listings and their photos are visible to everyone who visits the site.",
      "Your email address is not shown to other users.",
      "Your messages are visible to you and the person you are talking to.",
    ],
  },
  {
    heading: "Who we share data with",
    paragraphs: [
      "We use a few services to run the platform. They process data on our behalf:",
    ],
    bullets: [
      "Supabase stores our database, including accounts, listings, messages, reports and appeals.",
      "Cloudinary stores and delivers listing and profile photos.",
      "Resend delivers emails.",
    ],
    closing: [
      "We may also share information if the law requires it, or if it is needed to protect someone's safety.",
    ],
  },
  {
    heading: "Messages",
    paragraphs: [
      "Messages are not end-to-end encrypted. They are stored in our database, and the people who run the platform can technically access that database. We only look at messages when it is needed to investigate a report or keep users safe.",
      "Do not share sensitive information such as passwords, card numbers or ID details in messages.",
    ],
  },
  {
    heading: "Keeping your data safe",
    paragraphs: [
      "We protect accounts with hashed passwords and access controls, and we limit who can reach the admin tools. No online service can be completely secure, so we cannot promise absolute security.",
    ],
  },
  {
    heading: "How long we keep it",
    paragraphs: [
      "We keep your data while your account is active. If an account is suspended or banned, we keep the related records for as long as we need them to enforce the ban, handle appeals and prevent the same abuse from happening again. Reports and appeals are kept as moderation records.",
    ],
  },
  {
    heading: "Your choices and rights",
    bullets: [
      "You can view and change your name, hostel or location and profile photo at any time in Edit profile.",
      "You can delete your own listings whenever you like.",
      "You can ask us for a copy of your data, or to correct or delete it. Some records, such as a ban, may be kept so we can stop abuse.",
    ],
    closing: [
      "You may also have rights under Kenyan data protection law, including the right to access, correct and delete your personal data.",
    ],
  },
  {
    heading: "Who this is for",
    paragraphs: [
      "Kimathi Marketplace is meant for university students and is not directed at children.",
    ],
  },
  {
    heading: "Changes to this policy",
    paragraphs: [
      "We may update this policy. When we do, we will change the date at the top of this page.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: ["Questions about your data, or want to make a request? " + contactSentence()],
  },
];

function Privacy() {
  return (
    <LegalPage
      title="Privacy policy"
      subtitle="What we collect, why, and who can see it."
      sections={sections}
    />
  );
}

export default Privacy;