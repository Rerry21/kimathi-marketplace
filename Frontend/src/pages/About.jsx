import PageHeader from "../components/PageHeader";
import { colors, fonts } from "../theme";

const styles = {
  container: {
    maxWidth: "650px",
    margin: "0 auto",
    padding: "2.5rem",
  },
  paragraph: {
    fontFamily: fonts.body,
    fontSize: "1rem",
    color: colors.text,
    lineHeight: 1.7,
    marginBottom: "1.25rem",
  },
};

function About() {
  return (
    <div>
      <PageHeader
        title="About Kimathi Marketplace"
        subtitle="The campus marketplace for Dedan Kimathi sudents"
      />
      <div style={styles.container}>
        <p style={styles.paragraph}>
          Kimathi Marketplace is a buy-and-sell platform built for students at
          Dedan Kimathi University. It started from a simple observation: a lot
          of students have things worth selling, textbooks, electronics,
          furniture, but not much reach beyond their own circle of friends.
        </p>
        <p style={styles.paragraph}>
          This platform gives every student on campus a place to list what
          they have, and to find what they need, without having to compete
          with strangers from across the country on a general marketplace app.
        </p>
        <p style={styles.paragraph}>
          Every trade here happens in person, on campus. No shipping, no
          holding your money, no middlemen. You meet, you check the item, you
          exchange.
        </p>
        <p style={styles.paragraph}>
          Kimathi Marketplace is an independent platform. It is not run or endorsed by the University.
        </p>
      </div>
    </div>
  );
}

export default About;