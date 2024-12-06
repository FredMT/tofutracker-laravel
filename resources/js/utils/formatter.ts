export function formatRuntime(runtime: number) {
    if (runtime < 60) {
        return `${runtime}m`;
    }
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return `${hours}h ${minutes}m`;
}

export function formatReleaseDate(dateString: string) {
    // Convert the input string to a Date object
    const date = new Date(dateString);

    // Format the date using Intl.DateTimeFormat
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

export function getLanguageName(isoCode: string, locale = "en") {
    // Create an Intl.DisplayNames instance for languages
    const languageNames = new Intl.DisplayNames([locale], { type: "language" });

    // Return the formatted language name
    return languageNames.of(isoCode) || "Unknown Language";
}
