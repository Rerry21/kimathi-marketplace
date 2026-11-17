import { useState } from "react";
import PageHeader from "../components/PageHeader";
import { colors, fonts } from "../theme";

const faqs = [
  {
    question: "Who can use Kimathi Marketplace?",
    answer:
      "Any Dedan Kimathi University student. Sign up with your name and email to start browsing, buying or posting listings.",
  },
  {
    question: "How does payment work?",
    answer:
      "Payment happens face to face, when you meet the seller. We don't process or hold any payments on the platform.",
  },
  {
    question: "Can I ship items or is it local only?",
    answer:
      "Local only, for now. Every listing is meant to be picked up in person somewhere on or near campus.",
  },
  {
    question: "Is there a fee to use Kimathi Marketplace?",
    answer: "No. Posting a listing and messaging other students is free.",
  },
  {
    question: "How do I request an item I can't find?",
    answer:
      "There's no request feature yet, but it's something we're considering adding. For now, try posting in relevant class or hostel group chats.",
  },
  {
    question: "What safety measures are in place?",
    answer:
      "You can report a listing or a user at any time. Meet in public, well-lit spots on campus, and never send money before seeing the item in person.",
  },
];

const styles = {
  container: {
    maxWidth: "650px",
    margin: "0 auto",
    padding: "2.5rem",
  },
  item: {
    borderBottom: `1px solid ${colors.border}`,
  },
  questionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.1rem 0",
    cursor: "pointer",
  },
  question: {
    fontFamily: fonts.body,
    fontWeight: 600,
    fontSize: "0.98rem",
    color: colors.text,
  },
  iconWrap: (open) => ({
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    backgroundColor: open ? colors.accent : colors.accentMuted,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "background-color 0.15s ease",
  }),
  icon: (open) => ({
    fontFamily: fonts.body,
    fontSize: "1rem",
    color: open ? "#FFFFFF" : colors.accent,
    transform: open ? "rotate(45deg)" : "rotate(0deg)",
    transition: "transform 0.15s ease",
  }),
  answer: {
    fontFamily: fonts.body,
    fontSize: "0.92rem",
    color: colors.textMuted,
    lineHeight: 1.6,
    paddingBottom: "1.1rem",
    paddingRight: "1.5rem",
  },
};

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  function toggle(index) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <div>
      <PageHeader
        title="Frequently asked questions"
        subtitle="Everything you need to know about Kimathi Marketplace."
      />
      <div style={styles.container}>
        {faqs.map((faq, index) => {
          const open = openIndex === index;
          return (
            <div style={styles.item} key={faq.question}>
              <div style={styles.questionRow} onClick={() => toggle(index)}>
                <p style={styles.question}>{faq.question}</p>
                <div style={styles.iconWrap(open)}>
                  <span style={styles.icon(open)}>+</span>
                </div>
              </div>
              {open && <p style={styles.answer}>{faq.answer}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FAQ;