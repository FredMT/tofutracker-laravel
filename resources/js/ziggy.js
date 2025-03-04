const Ziggy = {
    url: "http://localhost",
    port: null,
    defaults: {},
    routes: {
        "debugbar.openhandler": {
            uri: "_debugbar/open",
            methods: ["GET", "HEAD"],
        },
        "debugbar.clockwork": {
            uri: "_debugbar/clockwork/{id}",
            methods: ["GET", "HEAD"],
            parameters: ["id"],
        },
        "debugbar.telescope": {
            uri: "_debugbar/telescope/{id}",
            methods: ["GET", "HEAD"],
            parameters: ["id"],
        },
        "debugbar.assets.css": {
            uri: "_debugbar/assets/stylesheets",
            methods: ["GET", "HEAD"],
        },
        "debugbar.assets.js": {
            uri: "_debugbar/assets/javascript",
            methods: ["GET", "HEAD"],
        },
        "debugbar.cache.delete": {
            uri: "_debugbar/cache/{key}/{tags?}",
            methods: ["DELETE"],
            parameters: ["key", "tags"],
        },
        "debugbar.queries.explain": {
            uri: "_debugbar/queries/explain",
            methods: ["POST"],
        },
        "sanctum.csrf-cookie": {
            uri: "sanctum/csrf-cookie",
            methods: ["GET", "HEAD"],
        },
        telescope: {
            uri: "telescope/{view?}",
            methods: ["GET", "HEAD"],
            wheres: { view: "(.*)" },
            parameters: ["view"],
        },
        "log-viewer.hosts": {
            uri: "log-viewer/api/hosts",
            methods: ["GET", "HEAD"],
        },
        "log-viewer.folders": {
            uri: "log-viewer/api/folders",
            methods: ["GET", "HEAD"],
        },
        "log-viewer.folders.request-download": {
            uri: "log-viewer/api/folders/{folderIdentifier}/download/request",
            methods: ["GET", "HEAD"],
            parameters: ["folderIdentifier"],
        },
        "log-viewer.folders.clear-cache": {
            uri: "log-viewer/api/folders/{folderIdentifier}/clear-cache",
            methods: ["POST"],
            parameters: ["folderIdentifier"],
        },
        "log-viewer.folders.delete": {
            uri: "log-viewer/api/folders/{folderIdentifier}",
            methods: ["DELETE"],
            parameters: ["folderIdentifier"],
        },
        "log-viewer.files": {
            uri: "log-viewer/api/files",
            methods: ["GET", "HEAD"],
        },
        "log-viewer.files.request-download": {
            uri: "log-viewer/api/files/{fileIdentifier}/download/request",
            methods: ["GET", "HEAD"],
            parameters: ["fileIdentifier"],
        },
        "log-viewer.files.clear-cache": {
            uri: "log-viewer/api/files/{fileIdentifier}/clear-cache",
            methods: ["POST"],
            parameters: ["fileIdentifier"],
        },
        "log-viewer.files.delete": {
            uri: "log-viewer/api/files/{fileIdentifier}",
            methods: ["DELETE"],
            parameters: ["fileIdentifier"],
        },
        "log-viewer.files.clear-cache-all": {
            uri: "log-viewer/api/clear-cache-all",
            methods: ["POST"],
        },
        "log-viewer.files.delete-multiple-files": {
            uri: "log-viewer/api/delete-multiple-files",
            methods: ["POST"],
        },
        "log-viewer.logs": {
            uri: "log-viewer/api/logs",
            methods: ["GET", "HEAD"],
        },
        "log-viewer.folders.download": {
            uri: "log-viewer/api/folders/{folderIdentifier}/download",
            methods: ["GET", "HEAD"],
            parameters: ["folderIdentifier"],
        },
        "log-viewer.files.download": {
            uri: "log-viewer/api/files/{fileIdentifier}/download",
            methods: ["GET", "HEAD"],
            parameters: ["fileIdentifier"],
        },
        "log-viewer.index": {
            uri: "log-viewer/{view?}",
            methods: ["GET", "HEAD"],
            wheres: { view: "(.*)" },
            parameters: ["view"],
        },
        "resend.webhook": { uri: "resend/webhook", methods: ["POST"] },
        me: { uri: "me", methods: ["GET", "HEAD"] },
        "user.movies": {
            uri: "user/{username}/movies",
            methods: ["GET", "HEAD"],
            parameters: ["username"],
        },
        "user.tv": {
            uri: "user/{username}/tv",
            methods: ["GET", "HEAD"],
            parameters: ["username"],
        },
        "user.anime": {
            uri: "user/{username}/anime",
            methods: ["GET", "HEAD"],
            parameters: ["username"],
        },
        "user.profile": {
            uri: "user/{username}",
            methods: ["GET", "HEAD"],
            parameters: ["username"],
        },
        "profile.edit": { uri: "settings", methods: ["GET", "HEAD"] },
        "profile.update": { uri: "settings", methods: ["PATCH"] },
        "profile.destroy": { uri: "settings", methods: ["DELETE"] },
        "profile.avatar": { uri: "settings/avatar", methods: ["POST"] },
        "profile.banner": { uri: "settings/banner", methods: ["POST"] },
        "profile.bio": { uri: "settings/bio", methods: ["PATCH"] },
        "movie.library.store": {
            uri: "movies/library/{movie_id}",
            methods: ["POST"],
            parameters: ["movie_id"],
        },
        "movie.library.destroy": {
            uri: "movies/library/{movie_id}",
            methods: ["DELETE"],
            parameters: ["movie_id"],
        },
        "movie.library.update-status": {
            uri: "movie/library/status/{movie_id}",
            methods: ["PATCH"],
            parameters: ["movie_id"],
        },
        "movie.library.rate": {
            uri: "movie/library/rating/{movie_id}",
            methods: ["POST"],
            parameters: ["movie_id"],
        },
        "tv.episode.store": {
            uri: "tv/episode/{episode_id}",
            methods: ["POST"],
            parameters: ["episode_id"],
        },
        "tv.episode.destroy": {
            uri: "tv/episode/{episode_id}",
            methods: ["DELETE"],
            parameters: ["episode_id"],
        },
        "tv.season.library.store": {
            uri: "tv/season/library",
            methods: ["POST"],
        },
        "tv.season.library.destroy": {
            uri: "tv/season/library",
            methods: ["DELETE"],
        },
        "tvseason.library.rate": {
            uri: "tv/season/library/rate",
            methods: ["POST"],
        },
        "tvseason.library.update-status": {
            uri: "tv/season/library/status",
            methods: ["PATCH"],
        },
        "tv.show.library.store": { uri: "tv/show/library", methods: ["POST"] },
        "tv.show.library.destroy": {
            uri: "tv/show/library",
            methods: ["DELETE"],
        },
        "tv.library.rate": { uri: "tv/show/library/rate", methods: ["POST"] },
        "tv.library.update-status": {
            uri: "tv/show/library/status",
            methods: ["PATCH"],
        },
        "anime.movie.library.store": {
            uri: "anime/movie/library",
            methods: ["POST"],
        },
        "anime.movie.library.destroy": {
            uri: "anime/movie/library",
            methods: ["DELETE"],
        },
        "anime.movie.library.rate": {
            uri: "anime/movie/library/rate",
            methods: ["POST"],
        },
        "anime.movie.library.update-status": {
            uri: "anime/movie/library/status",
            methods: ["PATCH"],
        },
        "anime.tv.library.store": {
            uri: "anime/tv/library",
            methods: ["POST"],
        },
        "anime.tv.library.destroy": {
            uri: "anime/tv/library",
            methods: ["DELETE"],
        },
        "animetv.library.rate": {
            uri: "anime/tv/library/rate",
            methods: ["POST"],
        },
        "animetv.library.update-status": {
            uri: "anime/tv/library/status",
            methods: ["PATCH"],
        },
        "anime.season.library.store": {
            uri: "anime/season/library",
            methods: ["POST"],
        },
        "anime.season.library.destroy": {
            uri: "anime/season/library",
            methods: ["DELETE"],
        },
        "anime.season.library.rate": {
            uri: "anime/season/library/rate",
            methods: ["POST"],
        },
        "anime.season.library.update-status": {
            uri: "anime/season/library/status",
            methods: ["PATCH"],
        },
        "anime.episode.store": {
            uri: "anime/episode/library",
            methods: ["POST"],
        },
        "anime.episode.destroy": {
            uri: "anime/episode/library",
            methods: ["DELETE"],
        },
        "movie.show": {
            uri: "movie/{id}",
            methods: ["GET", "HEAD"],
            wheres: { id: "[0-9]+" },
            parameters: ["id"],
        },
        "tv.show": {
            uri: "tv/{id}",
            methods: ["GET", "HEAD"],
            wheres: { id: "[0-9]+" },
            parameters: ["id"],
        },
        "tv.season.show": {
            uri: "tv/{id}/season/{seasonNumber}",
            methods: ["GET", "HEAD"],
            parameters: ["id", "seasonNumber"],
        },
        "anime.show": {
            uri: "anime/{id}",
            methods: ["GET", "HEAD"],
            parameters: ["id"],
        },
        "anime.season.show": {
            uri: "anime/{id}/season/{seasonId}",
            methods: ["GET", "HEAD"],
            parameters: ["id", "seasonId"],
        },
        search: { uri: "search", methods: ["GET", "HEAD"] },
        quicksearch: { uri: "quicksearch", methods: ["GET", "HEAD"] },
        register: { uri: "register", methods: ["GET", "HEAD"] },
        login: { uri: "login", methods: ["GET", "HEAD"] },
        "password.request": {
            uri: "forgot-password",
            methods: ["GET", "HEAD"],
        },
        "password.email": { uri: "forgot-password", methods: ["POST"] },
        "password.reset": {
            uri: "reset-password/{token}",
            methods: ["GET", "HEAD"],
            parameters: ["token"],
        },
        "password.store": { uri: "reset-password", methods: ["POST"] },
        "verification.notice": {
            uri: "verify-email",
            methods: ["GET", "HEAD"],
        },
        "verification.verify": {
            uri: "verify-email/{id}/{hash}",
            methods: ["GET", "HEAD"],
            parameters: ["id", "hash"],
        },
        "verification.send": {
            uri: "email/verification-notification",
            methods: ["POST"],
        },
        "password.confirm": {
            uri: "confirm-password",
            methods: ["GET", "HEAD"],
        },
        "password.update": { uri: "password", methods: ["PUT"] },
        logout: { uri: "logout", methods: ["POST"] },
        "storage.local": {
            uri: "storage/{path}",
            methods: ["GET", "HEAD"],
            wheres: { path: ".*" },
            parameters: ["path"],
        },
    },
};
if (typeof window !== "undefined" && typeof window.Ziggy !== "undefined") {
    Object.assign(Ziggy.routes, window.Ziggy.routes);
}
export { Ziggy };
