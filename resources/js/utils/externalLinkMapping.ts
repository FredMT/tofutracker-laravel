type LinkConfig = {
    name: string;
    url: (identifier: string | number) => string;
    icon: string;
};

type LinkMapping = {
    [key: string]: LinkConfig;
};

export const externalLinkMapping: LinkMapping = {
    amazon_dp: {
        name: "Amazon",
        url: (id) => `https://www.amazon.com/dp/${id}`,
        icon: "/icons/amazonprime.svg",
    },
    baidu: {
        name: "Baidu",
        url: (id) => `https://baike.baidu.com/item/${id}`,
        icon: "/icons/baidu.svg",
    },
    primevideo: {
        name: "Amazon",
        url: (id) => `https://www.amazon.com/dp/${id}`,
        icon: "/icons/amazonprime.svg",
    },
    netflix: {
        name: "Netflix",
        url: (id) => `https://www.netflix.com/title/${id}`,
        icon: "/icons/netflix.svg",
    },
    hidive: {
        name: "HiDive",
        url: (id) => `https://www.hidive.com/${id}`,
        icon: "/icons/hidive.png",
    },
    wikipedia_en: {
        name: "Wikipedia (EN)",
        url: (id) => `https://en.wikipedia.org/wiki/${id}`,
        icon: "/icons/wikipedia.svg",
    },

    wikipedia_ja: {
        name: "Wikipedia (JA)",
        url: (id) => `https://ja.wikipedia.org/wiki/${id}`,
        icon: "/icons/wikipedia.svg",
    },
    twitter: {
        name: "Twitter",
        url: (id) => `https://twitter.com/${id}`,
        icon: "/icons/twitterx.svg",
    },
    crunchyroll: {
        name: "Crunchyroll",
        url: (id) => `https://www.crunchyroll.com/${id}`,
        icon: "/icons/crunchyroll.svg",
    },
    funimation: {
        name: "Funimation",
        url: (id) => `https://www.funimation.com/${id}`,
        icon: "/icons/funimation.webp",
    },
    myanimelist: {
        name: "MyAnimeList",
        url: (id) => `https://myanimelist.net/anime/${id}`,
        icon: "/icons/mal.svg",
    },
    themoviedb: {
        name: "TMDB",
        url: (id) => `https://www.themoviedb.org/tv/${id}`,
        icon: "/icons/tmdb.svg",
    },
    thetvdb: {
        name: "TVDB",
        url: (id) => `https://thetvdb.com/series/${id}`,
        icon: "/icons/tvdb.webp",
    },
    livechart: {
        name: "LiveChart",
        url: (id) => `https://livechart.me/anime/${id}`,
        icon: "/icons/livechart.webp",
    },
    anime_planet: {
        name: "Anime-Planet",
        url: (id) => `https://www.anime-planet.com/anime/${id}`,
        icon: "/icons/animeplanet.webp",
    },
    imdb: {
        name: "IMDB",
        url: (id) => `https://www.imdb.com/title/${id}`,
        icon: "/icons/imdb.svg",
    },
    animenewsnetwork: {
        name: "Anime News Network",
        url: (id) => `https://www.imdb.com/title/${id}`,
        icon: "/icons/ann.webp",
    },
};
