import { Movie } from "@/types";

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

export function getDirectors(crew: Pick<Movie, "credits">["credits"]["crew"]) {
    return crew
        .filter((member) => member.job === "Director")
        .map((director) => director.name)
        .join(", ");
}

export function getWriters(crew: Pick<Movie, "credits">["credits"]["crew"]) {
    return crew
        .filter((member) => member.job === "Writer")
        .map((director) => director.name)
        .join(", ");
}

export function getUSCertification(releaseDates: any) {
    if (!releaseDates || !Array.isArray(releaseDates.results)) {
        return null; // Handle edge case where releaseDates or results is invalid
    }

    // Find the US entry in the results array
    const usEntry = releaseDates.results.find(
        (entry: any) => entry.iso_3166_1 === "US"
    );
    if (!usEntry || !Array.isArray(usEntry.release_dates)) {
        return null; // Handle edge case where no US entry or release_dates array exists
    }

    // Find the first release date with a valid certification
    const validCertification = usEntry.release_dates.find((date: any) =>
        date.certification?.trim()
    );
    return validCertification ? validCertification.certification : null;
}
