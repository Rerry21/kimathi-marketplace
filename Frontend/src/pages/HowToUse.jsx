import PageHeader from "../components/PageHeader";
import { colors, fonts, radius } from "../theme";

const steps = [
  {
    title: "Create a listing",
    text: "Add a clear title, an honest price, a couple of photos and a meet-up spot on campus.",
  },
  {
    title: "Wait for messages",
    text: "Interested buyers message you directly through the platform. Reply when you can.",
  },
  {
    title: "Agree on a meet-up",
    text: "Pick a public, well-lit spot on campus. The gate, library or a common area work well.",
  },
  {
    title: "Check the item and pay",
    text: "Inspect the item in person before paying. All payment happens face to face, on the spot.",
  },
  {
    title: "Mark it as sold",
    text: "Once the trade is done, mark your listing as sold so it's removed from search.",
  },
];

const styles = {
  container: {
    maxWidth: "650px",
    margin: "0 auto",
    padding: "2.5rem",
  },
  step: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  stepNumber: {
    width: "34px",
    height: "34px",
    minWidth: "34px",
    borderRadius: "50%",
    backgroundColor: colors.accent,
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: fonts.body,
    fontWeight: 600,
    fontSize: "0.9rem",
  },
  stepTitle: {
    fontFamily: fonts.body,
    fontWeight: 600,
    fontSize: "1rem",
    color: colors.text,
    marginBottom: "0.25rem",
  },
  stepText: {
    fontFamily: fonts.body,
    fontSize: "0.92rem",
    color: colors.textMuted,
    lineHeight: 1.6,
  },
  safetyBox: {
    marginTop: "2rem",
    padding: "1.25rem",
    borderRadius: radius.md,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
  },
  safetyTitle: {
    fontFamily: fonts.body,
    fontWeight: 600,
    fontSize: "0.95rem",
    color: colors.text,
    marginBottom: "0.5rem",
  },
  safetyText: {
    fontFamily: fonts.body,
    fontSize: "0.88rem",
    color: colors.textMuted,
    lineHeight: 1.6,
  },
};

function HowToUse() {
  return (
    <div>
      <PageHeader
        title="How it works"
        subtitle="Buying and selling on Kimathi Marketplace, from posting to handshake."
      />
      <div style={styles.container}>
        {steps.map((step, i) => (
          <div style={styles.step} key={step.title}>
            <div style={styles.stepNumber}>{i + 1}</div>
            <div>
              <p style={styles.stepTitle}>{step.title}</p>
              <p style={styles.stepText}>{step.text}</p>
            </div>
          </div>
        ))}

        <div style={styles.safetyBox}>
          <p style={styles.safetyTitle}>Trading safely</p>
          <p style={styles.safetyText}>
            Meet in public campus spots during the day when you can. Don't
            send money before seeing the item. Trust your judgment, and
            report a listing or user if something feels off.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HowToUse;