import PageHeader from "./PageHeader";
import { colors, fonts } from "../theme";
import { LAST_UPDATED } from "../config/site";

const styles = {
  container: {
    maxWidth: "700px",
    margin: "0 auto",
    padding: "2.5rem",
  },
  updated: {
    fontFamily: fonts.body,
    fontSize: "0.82rem",
    color: colors.textMuted,
    marginBottom: "2rem",
  },
  section: {
    marginBottom: "2rem",
  },
  heading: {
    fontFamily: fonts.heading,
    fontSize: "1.15rem",
    fontWeight: 600,
    color: colors.text,
    marginBottom: "0.6rem",
  },
  paragraph: {
    fontFamily: fonts.body,
    fontSize: "0.95rem",
    color: colors.text,
    lineHeight: 1.7,
    marginBottom: "0.75rem",
  },
  list: {
    paddingLeft: "1.25rem",
    marginBottom: "0.75rem",
  },
  item: {
    fontFamily: fonts.body,
    fontSize: "0.95rem",
    color: colors.text,
    lineHeight: 1.7,
    marginBottom: "0.35rem",
  },
};

function LegalPage({ title, subtitle, sections }) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div style={styles.container}>
        <p style={styles.updated}>Last updated: {LAST_UPDATED}</p>

        {sections.map((section, index) => (
          <section style={styles.section} key={section.heading}>
            <h2 style={styles.heading}>
              {index + 1}. {section.heading}
            </h2>

            {(section.paragraphs || []).map((text, i) => (
              <p style={styles.paragraph} key={`p-${i}`}>
                {text}
              </p>
            ))}

            {section.bullets && (
              <ul style={styles.list}>
                {section.bullets.map((text, i) => (
                  <li style={styles.item} key={`b-${i}`}>
                    {text}
                  </li>
                ))}
              </ul>
            )}

            {(section.closing || []).map((text, i) => (
              <p style={styles.paragraph} key={`c-${i}`}>
                {text}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

export default LegalPage;