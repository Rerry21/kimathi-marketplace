import LegalPage from "../components/LegalPage";
import { contactSentence } from "../config/site";

const sections = [
  {
    heading: "About Kimathi Marketplace",
    paragraphs: [
      "Kimathi Marketplace is a platform where students of Dedan Kimathi University can list items and services and contact each other to trade in person on campus.",
      "We only provide the platform. We are not a buyer or a seller, we do not take part in any trade, and we do not handle payments or shipping. ",
    ],
  },
  {
    heading: "Your account",
    bullets: [
      "Sign up with your real name and a working email address.",
      "Keep one account per person, and keep your password to yourself. Passwords must be at least 8 characters.",
      "You are responsible for everything done through your account.",
      "We may suspend or remove accounts that use false information.",
    ],
  },
  {
    heading: "Listings and trading",
    bullets: [
      "Only list items you own and are allowed to sell, and describe them honestly, including their condition and price.",
      "Every trade happens in person. Meet in a public, well-lit place on campus, and inspect the item before you pay.",
      "Payment is made face to face. Never send money before you have seen the item.",
    ],
    closing: [
      "Because we are not part of any trade, we cannot guarantee any item, price or person, and we cannot resolve disputes between users. You trade at your own risk and use your own judgment.",
    ],
  },
  {
    heading: "What is not allowed",
    paragraphs: ["You may not use Kimathi Marketplace to:"],
    bullets: [
      "List stolen, counterfeit or illegal items, weapons, drugs, or anything else that breaks the law or university rules.",
      "Scam, mislead, threaten, harass or spam other users.",
      "Post adult content, or photos and descriptions that belong to someone else without permission.",
      "Create a new account to get around a suspension or ban.",
      "Submit false or abusive reports.",
    ],
  },
  {
    heading: "Reports, suspensions and appeals",
    paragraphs: [
      "Any signed-in user can report a listing or another user. We review reports and may hide listings, suspend accounts or ban them permanently.",
      "When an account is suspended, all of its listings are hidden and the user can no longer use the site, except to read the reason and submit an appeal.",
    ],
    bullets: [
      "A suspended user can appeal twice for each suspension, one appeal at a time.",
      "If an appeal is approved, the suspension ends and the listings are restored.",
      "If the second appeal is denied, the ban becomes permanent. Some bans may be permanent from the start, with no appeal.",
      "Our decisions on appeals are final.",
    ],
  },
  {
    heading: "Your content",
    paragraphs: [
      "You keep ownership of the listings, photos and messages you post. By posting them, you allow us to store and display them on the platform so the service can work. Only upload photos you have the right to use.",
    ],
  },
  {
    heading: "Availability and changes",
    paragraphs: [
      "We try to keep the site running, but we provide it as it is, with no promise that it will always be available or free of errors. We may change, pause or end any part of it.",
      "We may update these terms. When we do, we will change the date at the top. Continuing to use the site after that means you accept the updated terms.",
    ],
  },
  {
    heading: "Limits of our responsibility",
    paragraphs: [
      "To the extent the law allows, we are not responsible for losses, damages or disputes that come from trades between users, from items or services listed on the platform, or from the conduct of other users.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: ["Questions about these terms, or want to report a problem? " + contactSentence()],
  },
];

function Terms() {
  return (
    <LegalPage
      title="Terms of use"
      subtitle="The rules for using Kimathi Marketplace."
      sections={sections}
    />
  );
}

export default Terms;