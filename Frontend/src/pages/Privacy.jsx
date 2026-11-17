import LegalPage from "../components/LegalPage";
import { contactSentence } from "../config/site";

const sections = [
  {
    heading: "What we collect",
    bullets: [
      "Account details, such as your name, email address, hostel or location, and profile photo.",
      "Content you create, such as listings, photos, messages, reports and appeals.",
      "Basic technical information needed to run and secure the service.",
    ],
  },
  {
    heading: "How we use it",
    bullets: [
      "To run the marketplace and manage your account.",
      "To send you emails about your account.",
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
      "Your messages are visible only to you and the person you are talking to.",
    ],
  },
  {
    heading: "Who we share data with",
    paragraphs: [
      "We use trusted third-party service providers to run the platform. They process data on our behalf and only for that purpose.",
      "We may also share information if the law requires it, or if it is needed to protect someone's safety.",
    ],
  },
  {
    heading: "Messages",
    paragraphs: [
      "Messages are not end-to-end encrypted. We only review them when it is needed to investigate a report or keep users safe.",
      "Do not share sensitive information such as passwords, card numbers or ID details in messages.",
    ],
  },
  {
    heading: "Keeping your data safe",
    paragraphs: [
      "We take reasonable steps to protect your data. No online service can be completely secure, so we cannot promise absolute security.",
    ],
  },
  {
    heading: "How long we keep it",
    paragraphs: [
      "We keep your data while your account is active. Records related to bans, reports and appeals may be kept for as long as needed to enforce our terms and prevent abuse.",
    ],
  },
  {
    heading: "Your choices and rights",
    bullets: [
      "You can update your profile details at any time in Edit profile.",
      "You can delete your own listings whenever you like.",
      "You can ask us for a copy of your data, or to correct or delete it. Some records may be kept so we can stop abuse.",
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