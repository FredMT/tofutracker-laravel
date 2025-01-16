import {Carousel} from "@mantine/carousel";
import React from "react";
import WelcomeCarouselCard from "./WelcomeCarouselCard";
import WelcomeCustomCarousel from "./WelcomeCustomCarousel";
import WelcomeCustomCarouselContent from "./WelcomeCustomCarouselContent";
import ResponsiveContainer from "@/Components/ResponsiveContainer";

function getContentType(type: string) {
    switch (type) {
        case "movie":
            return "movie";
        case "tv":
            return "tv";
        case "anime":
            return "anime";
        default:
            return "Unknown";
    }
}

function TrendingSection() {
    const allContent = [...data.movies, ...data.tv_shows, ...data.anime]
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 20);

    return (
        <ResponsiveContainer>
            <WelcomeCustomCarousel title="Top 20" slideSize="200px">
                {allContent.map((content) => (
                    <Carousel.Slide key={`${content.type}-${content.link}`}>
                        <WelcomeCarouselCard
                            id={Number(content.link)}
                            title={content.title}
                            posterPath={content.poster_path}
                            type={getContentType(content.type)}
                            vote_average={content.vote_average}
                        />
                    </Carousel.Slide>
                ))}
            </WelcomeCustomCarousel>

            <WelcomeCustomCarouselContent
                title="Top 10"
                slideSize="200px"
                movies={data.movies}
                tvShows={data.tv_shows}
                anime={data.anime}
            />
        </ResponsiveContainer>
    );
}

export default TrendingSection;

const data = {
    movies: [
        {
            title: "Gladiator II",
            release_date: "5th November, 2024",
            genres: ["Action", "Adventure", "Drama"],
            overview:
                "Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius is forced to enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist. With rage in his heart and the future of the Empire at stake, Lucius must look to his past to find strength and honor to return the glory of Rome to its people.",
            backdrop_path: "/euYIwmwkmz95mnXvufEmbL6ovhZ.jpg",
            poster_path: "/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
            logo_path: "/jwXk1c2esVoEzVLplPiQubNVyFC.png",
            vote_average: 6.78,
            popularity: 7979.938,
            link: 558449,
            type: "movie",
        },
        {
            title: "Your Fault",
            release_date: "26th December, 2024",
            genres: ["Romance", "Drama"],
            overview:
                "The love between Noah and Nick seems unwavering despite their parents' attempts to separate them. But his job and her entry into college open up their lives to new relationships that will shake the foundations of both their relationship and the Leister family itself.",
            backdrop_path: "/6qld2YxAO9gdEblo0rsEb8BcYKO.jpg",
            poster_path: "/1sQA7lfcF9yUyoLYC0e6Zo3jmxE.jpg",
            logo_path: "/kktwsvYZKrOwBT0271X9PePpKFQ.png",
            vote_average: 7.736,
            popularity: 5541.871,
            link: 1156593,
            type: "movie",
        },
        {
            title: "Nosferatu",
            release_date: "25th December, 2024",
            genres: ["Horror", "Fantasy"],
            overview:
                "A gothic tale of obsession between a haunted young woman and the terrifying vampire infatuated with her, causing untold horror in its wake.",
            backdrop_path: "/uWOJbarUXfVf6B4o0368dh138eR.jpg",
            poster_path: "/5qGIxdEO841C0tdY8vOdLoRVrr0.jpg",
            logo_path: "/wpGrTiLVoBAR2qsbCN0W4KFBPs2.png",
            vote_average: 6.6,
            popularity: 667.621,
            link: 426063,
            type: "movie",
        },
        {
            title: "Wicked",
            release_date: "20th November, 2024",
            genres: ["Drama", "Romance", "Fantasy"],
            overview:
                "In the land of Oz, ostracized and misunderstood green-skinned Elphaba is forced to share a room with the popular aristocrat Glinda at Shiz University, and the two's unlikely friendship is tested as they begin to fulfill their respective destinies as Glinda the Good and the Wicked Witch of the West.",
            backdrop_path: "/uVlUu174iiKhsUGqnOSy46eIIMU.jpg",
            poster_path: "/xDGbZ0JJ3mYaGKy4Nzd9Kph6M9L.jpg",
            logo_path: "/oeSUu0CjuohGO6oIiFkxn4xHbrt.png",
            vote_average: 7.415,
            popularity: 692.694,
            link: 402431,
            type: "movie",
        },
        {
            title: "Moana 2",
            release_date: "21st November, 2024",
            genres: ["Animation", "Adventure", "Family", "Comedy"],
            overview:
                "After receiving an unexpected call from her wayfinding ancestors, Moana journeys alongside Maui and a new crew to the far seas of Oceania and into dangerous, long-lost waters for an adventure unlike anything she's ever faced.",
            backdrop_path: "/tElnmtQ6yz1PjN1kePNl8yMSb59.jpg",
            poster_path: "/m0SbwFNCa9epW1X60deLqTHiP7x.jpg",
            logo_path: "/6y1b2fmGr4ZoIxMcQRBF0PQ6Sw.png",
            vote_average: 6.969,
            popularity: 3081.616,
            link: 1241982,
            type: "movie",
        },
        {
            title: "Sonic the Hedgehog 3",
            release_date: "19th December, 2024",
            genres: ["Action", "Science Fiction", "Comedy", "Family"],
            overview:
                "Sonic, Knuckles, and Tails reunite against a powerful new adversary, Shadow, a mysterious villain with powers unlike anything they have faced before. With their abilities outmatched in every way, Team Sonic must seek out an unlikely alliance in hopes of stopping Shadow and protecting the planet.",
            backdrop_path: "/zOpe0eHsq0A2NvNyBbtT6sj53qV.jpg",
            poster_path: "/d8Ryb8AunYAuycVKDp5HpdWPKgC.jpg",
            logo_path: "/qmVvIjoREyAyiPqk321qJV7oNbD.png",
            vote_average: 7.777,
            popularity: 4258.313,
            link: 939243,
            type: "movie",
        },
        {
            title: "The Lord of the Rings: The War of the Rohirrim",
            release_date: "5th December, 2024",
            genres: ["Animation", "Fantasy", "Action", "Adventure"],
            overview:
                "183 years before the events chronicled in the original trilogy, a sudden attack by Wulf, a clever and ruthless Dunlending lord seeking vengeance for the death of his father, forces Helm Hammerhand and his people to make a daring last stand in the ancient stronghold of the Hornburg. Finding herself in an increasingly desperate situation, H\u00e9ra, the daughter of Helm, must summon the will to lead the resistance against a deadly enemy intent on their total destruction.",
            backdrop_path: "/4ZXzO32rKk5bSoDZA6KpTzVJA.jpg",
            poster_path: "/hE9SAMyMSUGAPsHUGdyl6irv11v.jpg",
            logo_path: "/wk6UTlcU4li2xRLzLIdIwpE44IF.png",
            vote_average: 6.849,
            popularity: 539.161,
            link: 839033,
            type: "movie",
        },
        {
            title: "The Substance",
            release_date: "7th September, 2024",
            genres: ["Horror", "Science Fiction"],
            overview:
                "A fading celebrity decides to use a black market drug, a cell-replicating substance that temporarily creates a younger, better version of herself.",
            backdrop_path: "/t98L9uphqBSNn2Mkvdm3xSFCQyi.jpg",
            poster_path: "/lqoMzCcZYEFK729d6qzt349fB4o.jpg",
            logo_path: "/yXMt7AkV2W5sZsq8DtFZaBUupZS.png",
            vote_average: 7.181,
            popularity: 939.826,
            link: 933260,
            type: "movie",
        },
        {
            title: "Venom: The Last Dance",
            release_date: "22nd October, 2024",
            genres: ["Action", "Science Fiction", "Adventure", "Thriller"],
            overview:
                "Eddie and Venom are on the run. Hunted by both of their worlds and with the net closing in, the duo are forced into a devastating decision that will bring the curtains down on Venom and Eddie's last dance.",
            backdrop_path: "/3V4kLQg0kSqPLctI5ziYWabAZYF.jpg",
            poster_path: "/aosm8NMQ3UyoBVpSxyimorCQykC.jpg",
            logo_path: "/rWfSzjTq8RsdMUFLjnBupxAl0cS.png",
            vote_average: 6.8,
            popularity: 4026.483,
            link: 912649,
            type: "movie",
        },
        {
            title: "Anora",
            release_date: "14th October, 2024",
            genres: ["Romance", "Comedy", "Drama"],
            overview:
                "A young sex worker from Brooklyn gets her chance at a Cinderella story when she meets and impulsively marries the son of an oligarch. Once the news reaches Russia, her fairytale is threatened as his parents set out to get the marriage annulled.",
            backdrop_path: "/4cp40IyTpFfsT2IKpl0YlUkMBIR.jpg",
            poster_path: "/7MrgIUeq0DD2iF7GR6wqJfYZNeC.jpg",
            logo_path: "/dYVsBFfGLSCAZ9HqwOfkpgWUwTw.png",
            vote_average: 6.996,
            popularity: 798.497,
            link: 1064213,
            type: "movie",
        },
    ],
    tv_shows: [
        {
            title: "Squid Game",
            release_date: "17th September, 2021",
            genres: ["Action & Adventure", "Mystery", "Drama"],
            overview:
                "Hundreds of cash-strapped players accept a strange invitation to compete in children's games. Inside, a tempting prize awaits \u2014 with deadly high stakes.",
            backdrop_path: "/2meX1nMdScFOoV4370rqHWKmXhY.jpg",
            poster_path: "/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg",
            logo_path: "/6YFWTX7fiGjWpsnJWLLV4RSbJWd.png",
            popularity: 3138.471,
            vote_average: 7.835,
            link: 93405,
            type: "tv",
        },
        {
            title: "What If...?",
            release_date: "11th August, 2021",
            genres: ["Animation", "Action & Adventure", "Sci-Fi & Fantasy"],
            overview:
                "Taking inspiration from the comic books of the same name, each episode of this animated anthology series questions, revisits and twists classic Marvel Cinematic moments.",
            backdrop_path: "/4N6zEMfZ57zNEQcM8gWeERFupMv.jpg",
            poster_path: "/lztz5XBMG1x6Y5ubz7CxfPFsAcW.jpg",
            logo_path: "/rcCBnENZrekD2WX1x2xWRTQ4LsS.png",
            popularity: 1670.462,
            vote_average: 8.1,
            link: 91363,
            type: "tv",
        },
        {
            title: "Guardians of the Dafeng",
            release_date: "28th December, 2024",
            genres: ["Drama", "Action & Adventure"],
            overview:
                "Xu Qi\u2019an, a recent police academy graduate, awakens in a strange world filled with Confucians, Taoists, Buddhists, demons, and warlocks. Facing imminent exile to a remote frontier town, he seizes the chance to change his fate by joining a powerful organization of guardians.",
            backdrop_path: "/5JbWk5f3zSbwkQjbCazWi1adDMl.jpg",
            poster_path: "/zhIvZOCzwjJdn1Xu2KWikC7Luiq.jpg",
            logo_path: null,
            popularity: 147.273,
            vote_average: 9.3,
            link: 233912,
            type: "tv",
        },
        {
            title: "Landman",
            release_date: "17th November, 2024",
            genres: ["Drama"],
            overview:
                "Set in the proverbial boomtowns of West-Texas and a modern-day tale of fortune-seeking in the world of oil rigs, the series is an upstairs/downstairs story of roughnecks and wildcat billionaires that are fueling a boom so big it\u2019s reshaping our climate, our economy and our geopolitics.",
            backdrop_path: "/mh2UczqEXJJVgqohbyZbHTuxwhL.jpg",
            poster_path: "/AnLq5YSssNWpiD06iYF69wFiaNh.jpg",
            logo_path: "/13lJnfO3oExZ2ECzAR6WDyShzlV.png",
            popularity: 403.399,
            vote_average: 7.9,
            link: 157741,
            type: "tv",
        },
        {
            title: "Doctor Who",
            release_date: "11th May, 2024",
            genres: ["Action & Adventure", "Drama", "Sci-Fi & Fantasy"],
            overview:
                "The Doctor and his companion travel across time and space encountering incredible friends and foes.",
            backdrop_path: "/gDtZQmfzvErZpeXOVeCBQE9WkSF.jpg",
            poster_path: "/8FHthx4Vu81J4X5BTLhJYK9Gtbs.jpg",
            logo_path: "/eX1aEvStMLjt8THtXyNwthzbZmP.png",
            popularity: 236.249,
            vote_average: 6.6,
            link: 239770,
            type: "tv",
        },
        {
            title: "Silo",
            release_date: "4th May, 2023",
            genres: ["Sci-Fi & Fantasy", "Drama"],
            overview:
                "In a ruined and toxic future, thousands live in a giant silo deep underground. After its sheriff breaks a cardinal rule and residents die mysteriously, engineer Juliette starts to uncover shocking secrets and the truth about the silo.",
            backdrop_path: "/n5FPNMJ0eRoiQrKGfUQQRAZeaxg.jpg",
            poster_path: "/tlliQuCupf8fpTH7RAor3aKMGy.jpg",
            logo_path: "/orJ5TfInOu5CzgFIDs4avqEg0wu.png",
            popularity: 928.189,
            vote_average: 8.2,
            link: 125988,
            type: "tv",
        },
        {
            title: "Arcane",
            release_date: "6th November, 2021",
            genres: [
                "Animation",
                "Sci-Fi & Fantasy",
                "Action & Adventure",
                "Mystery",
                "Drama",
            ],
            overview:
                "Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and clashing convictions.",
            backdrop_path: "/sYXLeu5usz6yEz0k00FYvtEdodD.jpg",
            poster_path: "/abf8tHznhSvl9BAElD2cQeRr7do.jpg",
            logo_path: "/jXLNOzeEA8AoJy92dJTUUZXTMxK.png",
            popularity: 480.331,
            vote_average: 8.8,
            link: 94605,
            type: "tv",
        },
        {
            title: "Yellowstone",
            release_date: "20th June, 2018",
            genres: ["Western", "Drama"],
            overview:
                "Follow the violent world of the Dutton family, who controls the largest contiguous ranch in the United States. Led by their patriarch John Dutton, the family defends their property against constant attack by land developers, an Indian reservation, and America\u2019s first National Park.",
            backdrop_path: "/2Erj4Oav9EHAtqLI354VM7ULDqu.jpg",
            poster_path: "/s4QRRYc1V2e68Qy9Wel9MI8fhRP.jpg",
            logo_path: "/afF8ciL8JGKEVOpMN0q8mgqcB9z.png",
            popularity: 1107.229,
            vote_average: 8.2,
            link: 73586,
            type: "tv",
        },
        {
            title: "Dune: Prophecy",
            release_date: "17th November, 2024",
            genres: ["Sci-Fi & Fantasy", "Drama", "Action & Adventure"],
            overview:
                "Ten thousand years before the ascension of Paul Atreides, sisters Valya and Tula Harkonnen establish the fabled sect and female order that would become known as the Bene Gesserit to control the future of humankind.",
            backdrop_path: "/tWb81lXOBUQoyavNzXrp11ss6GS.jpg",
            poster_path: "/5B8Cxz8ZZXp3w2WmmdKTXpkS24e.jpg",
            logo_path: "/mu2ks5qifHl45BNYwHkHM6E2BwX.png",
            popularity: 564.634,
            vote_average: 7.71,
            link: 90228,
            type: "tv",
        },
        {
            title: "Beheneko: The Elf-Girl's Cat Is Secretly an S-Ranked Monster!",
            release_date: "4th January, 2025",
            genres: [
                "Animation",
                "Action & Adventure",
                "Comedy",
                "Sci-Fi & Fantasy",
            ],
            overview:
                "After dying in battle against the forces of evil, a knight is reborn as a behemoth-one of the most powerful monsters in the world! However, baby behemoths look an awful lot like adorable house cats. Just when he thinks his situation couldn\u2019t be more confusing, a beautiful elven adventurer rescues him from the brink of death and adopts him as her pet. This \u201ccat\u2019s\u201d baffling journey is just getting started.",
            backdrop_path: "/kwczoZpGHJm9Gzk52FWsGWHRhFQ.jpg",
            poster_path: "/xN4dgkzgZXux3Jv3sH9sk3Crrcz.jpg",
            logo_path: "/9syQ4Z0VIVCtD9jI36uex5zz8sE.png",
            popularity: 32.371,
            vote_average: 9,
            link: 249545,
            type: "tv",
        },
    ],
    anime: [
        {
            title: "Bleach",
            release_date: "5th October, 2004",
            genres: ["Action & Adventure", "Animation", "Sci-Fi & Fantasy"],
            overview:
                "For as long as he can remember, Ichigo Kurosaki has been able to see ghosts. But when he meets Rukia, a Soul Reaper who battles evil spirits known as Hollows, he finds his life is changed forever. Now, with a newfound wealth of spiritual energy, Ichigo discovers his true calling: to protect the living and the dead from evil.",
            backdrop_path: "/o0NsbcIvsllg6CJX0FBFY8wWbsn.jpg",
            poster_path: "/2EewmxXe72ogD0EaWM8gqa0ccIw.jpg",
            logo_path: "/21zm3sP3j6rmpbZR3j0quusRe6h.png",
            popularity: 471.52,
            vote_average: 8.4,
            link: "1494",
            type: "anime",
        },
        {
            title: "BLUE LOCK",
            release_date: "9th October, 2022",
            genres: ["Animation", "Action & Adventure", "Drama"],
            overview:
                "After a disastrous defeat at the 2018 World Cup, Japan's team struggles to regroup. But what's missing? An absolute Ace Striker, who can guide them to the win. The Japan Football Union is hell-bent on creating a striker who hungers for goals and thirsts for victory, and who can be the decisive instrument in turning around a losing match...and to do so, they've gathered 300 of Japan's best and brightest youth players. Who will emerge to lead the team...and will they be able to out-muscle and out-ego everyone who stands in their way?",
            backdrop_path: "/seMRyWVwIVBWbC9xaMzDMZJ8fUH.jpg",
            poster_path: "/fT9W86KFA9Khy2hIbkfClI8IYDH.jpg",
            logo_path: "/frZHsrVO7BjhfoHeWRBebKTU5u7.png",
            popularity: 760.307,
            vote_average: 8.09,
            link: "8373",
            type: "anime",
        },
        {
            title: "Shangri-La Frontier",
            release_date: "1st October, 2023",
            genres: [
                "Animation",
                "Action & Adventure",
                "Comedy",
                "Sci-Fi & Fantasy",
            ],
            overview:
                "Rakuro Hizutome only cares about one thing: beating crappy VR games. He devotes his entire life to these buggy games and could clear them all in his sleep. One day, he decides to challenge himself and play a popular god-tier game called Shangri-La Frontier. But he quickly learns just how difficult it is. Will his expert skills be enough to uncover its hidden secrets?",
            backdrop_path: "/yErVUZkLVak2ICxFC7mMfl3vcNP.jpg",
            poster_path: "/aCGdpgNkgz66R1winFkTFsMAhlC.jpg",
            logo_path: "/3LFu0PSGCmlq1ljfqp4DiRewe5u.png",
            popularity: 250.295,
            vote_average: 7.9,
            link: "8758",
            type: "anime",
        },
        {
            title: "Attack on Titan",
            release_date: "7th April, 2013",
            genres: ["Animation", "Sci-Fi & Fantasy", "Action & Adventure"],
            overview:
                "Many years ago, the last remnants of humanity were forced to retreat behind the towering walls of a fortified city to escape the massive, man-eating Titans that roamed the land outside their fortress. Only the heroic members of the Scouting Legion dared to stray beyond the safety of the walls \u2013 but even those brave warriors seldom returned alive. Those within the city clung to the illusion of a peaceful existence until the day that dream was shattered, and their slim chance at survival was reduced to one horrifying choice: kill \u2013 or be devoured!",
            backdrop_path: "/yvKrycViRMQcIgdnjsM5JGNWU4Q.jpg",
            poster_path: "/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg",
            logo_path: "/csy774JSTIoo4KUkrFWtU9SHA8j.png",
            popularity: 107.562,
            vote_average: 8.7,
            link: "4831",
            type: "anime",
        },
        {
            title: "DEMON LORD 2099",
            release_date: "13th October, 2024",
            genres: ["Animation", "Sci-Fi & Fantasy", "Action & Adventure"],
            overview:
                "Five centuries ago, Demon Lord Veltol reigned over an immortal nation. Now, the time has come for him to awaken once again. The year is 2099, and civilization has reached peak evolution, leading to a high-tech landscape with towering skyscrapers\u2014nothing like he\u2019s conquered before. Veltol may be a relic of the past, but make no mistake, this new world will be his for the taking!",
            backdrop_path: "/rS6CNUPU62dsSmsPieLGm6NceZa.jpg",
            poster_path: "/5RL8vgrThMe92wcJPZGpJc3XI94.jpg",
            logo_path: "/nxHe1tlkkioGdxcSNWfICWIiSC1.png",
            popularity: 107.667,
            vote_average: 7.583,
            link: "15790",
            type: "anime",
        },
        {
            title: "Re:ZERO -Starting Life in Another World-",
            release_date: "4th April, 2016",
            genres: [
                "Animation",
                "Comedy",
                "Action & Adventure",
                "Sci-Fi & Fantasy",
            ],
            overview:
                "Natsuki Subaru, an ordinary high school  student, is on his way home from the convenience store when he finds  himself transported to another world. As he's lost and confused in a new  world where he doesn't even know left from right, the only person to  reach out to him was a beautiful girl with silver hair. Determined to  repay her somehow for saving him from his own despair, Subaru agrees to  help the girl find something she's looking for.",
            backdrop_path: "/ai8bVS8Suvu4ErBhmgBvtESirBY.jpg",
            poster_path: "/aRwmcX36r1ZpR5Xq5mmFcpUDQ8J.jpg",
            logo_path: "/wNysocYhYIiCNI3SQBBTw0DTkWu.png",
            popularity: 248.989,
            vote_average: 7.8,
            link: "128",
            type: "anime",
        },
        {
            title: "Tower of God",
            release_date: "2nd April, 2020",
            genres: [
                "Animation",
                "Mystery",
                "Sci-Fi & Fantasy",
                "Action & Adventure",
            ],
            overview:
                "Reach the top, and everything will be yours. At the top of the tower exists everything in this world, and all of it can be yours. You can become a god. This is the story of the beginning and the end of Rachel, the girl who climbed the tower so she could see the stars, and Bam, the boy who needed nothing but her.",
            backdrop_path: "/gcvJgJScIt0a5sRt8uLIkGM9IhI.jpg",
            poster_path: "/8v8ANBJNUzvA8F6sM20DBt3zZ44.jpg",
            logo_path: "/mX5wfNlkuS3vZNxXqXo7uxdddEp.png",
            popularity: 429.127,
            vote_average: 8.3,
            link: "7882",
            type: "anime",
        },
        {
            title: "Fights Break Sphere",
            release_date: "7th January, 2017",
            genres: ["Animation", "Action & Adventure", "Sci-Fi & Fantasy"],
            overview:
                "In a land where no magic is present. A land where the strong make the rules and weak have to obey. A land filled with alluring treasures and beauty, yet also filled with unforeseen danger. Three years ago, Xiao Yan, who had shown talents none had seen in decades, suddenly lost everything. His powers, his reputation, and his promise to his mother. What sorcery has caused him to lose all of his powers? And why has his fiancee suddenly shown up?",
            backdrop_path: "/jCWMWclOVImgkpZgryFd6AvYIu5.jpg",
            poster_path: "/a9bJPlezCXF6u0siDxf7cZaSXaJ.jpg",
            logo_path: null,
            popularity: 178.619,
            vote_average: 8.7,
            link: "14776",
            type: "anime",
        },
        {
            title: "Is It Wrong to Try to Pick Up Girls in a Dungeon?",
            release_date: "4th April, 2015",
            genres: [
                "Animation",
                "Comedy",
                "Sci-Fi & Fantasy",
                "Action & Adventure",
            ],
            overview:
                "In Orario, fearless adventurers band together in search of fame and fortune within the underground labyrinth known as the Dungeon. But Bell Cranel, novice adventurer, has bigger plans than riches and glory; he fights monsters in the hope of having a fateful encounter with a girl. When this happens, it doesn't go exactly as he planned. Thus begins the story of an unlikely pair, a boy and a goddess, both trying to prove themselves, both eager to reach their goals.",
            backdrop_path: "/xCmdeEvJNxptR30bEVXXWLrt4iI.jpg",
            poster_path: "/h97iHupymkJXBv0gyr4qlePhKAk.jpg",
            logo_path: "/fds7WouJOLo8lYYaGcUhIruw9M7.png",
            popularity: 75.062,
            vote_average: 7.3,
            link: "5443",
            type: "anime",
        },
        {
            title: "Is It Wrong to Try to Pick Up Girls in a Dungeon?",
            release_date: "4th April, 2015",
            genres: [
                "Animation",
                "Comedy",
                "Sci-Fi & Fantasy",
                "Action & Adventure",
            ],
            overview:
                "In Orario, fearless adventurers band together in search of fame and fortune within the underground labyrinth known as the Dungeon. But Bell Cranel, novice adventurer, has bigger plans than riches and glory; he fights monsters in the hope of having a fateful encounter with a girl. When this happens, it doesn't go exactly as he planned. Thus begins the story of an unlikely pair, a boy and a goddess, both trying to prove themselves, both eager to reach their goals.",
            backdrop_path: "/xCmdeEvJNxptR30bEVXXWLrt4iI.jpg",
            poster_path: "/h97iHupymkJXBv0gyr4qlePhKAk.jpg",
            logo_path: "/fds7WouJOLo8lYYaGcUhIruw9M7.png",
            popularity: 75.062,
            vote_average: 7.3,
            link: "5443",
            type: "anime",
        },
    ],
};
