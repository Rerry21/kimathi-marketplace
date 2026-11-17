export const SITE_NAME = "Kimathi Marketplace";

export const CONTACT_EMAIL = "";
export const DISCORD_URL = "";

export const LAST_UPDATED = "November 2026";

export function contactSentence() {
    if (CONTACT_EMAIL) return `You can reach us at ${CONTACT_EMAIL}.`;
    if (DISCORD_URL) return `You can reach us on our Discord server: ${DISCORD_URL}`;
    return "Contact details are listed at the bottom of every page.";
}