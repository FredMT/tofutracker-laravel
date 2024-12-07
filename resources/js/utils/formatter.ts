export function getLanguageName(isoCode: string, locale = "en") {
    // Create an Intl.DisplayNames instance for languages
    const languageNames = new Intl.DisplayNames([locale], { type: "language" });

    // Return the formatted language name
    return languageNames.of(isoCode) || "Unknown Language";
}
export function formatJoinDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}
