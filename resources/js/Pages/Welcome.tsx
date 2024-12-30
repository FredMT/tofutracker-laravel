import ThemeButton from "@/Components/ThemeButton";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { Carousel } from "@mantine/carousel";
import { Button, Space } from "@mantine/core";

function Welcome() {
    return (
        <>
            <Head title="Welcome" />
            <Space h={64} />
            <Carousel height={700}>
                <Carousel.Slide>1</Carousel.Slide>
                <Carousel.Slide>2</Carousel.Slide>
                <Carousel.Slide>3</Carousel.Slide>
            </Carousel>
        </>
    );
}

Welcome.layout = (page: any) => (
    <AuthenticatedLayout>{page}</AuthenticatedLayout>
);

export default Welcome;

const data = {
    movies: [
        {
            title: "Gladiator II",
            release_date: "2024-11-05",
            genres: ["Action", "Adventure", "Drama"],
            overview:
                "Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius is forced to enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist. With rage in his heart and the future of the Empire at stake, Lucius must look to his past to find strength and honor to return the glory of Rome to its people.",
            backdrop_path: "/euYIwmwkmz95mnXvufEmbL6ovhZ.jpg",
            logo_path: "/jwXk1c2esVoEzVLplPiQubNVyFC.png",
            link: 558449,
        },
        {
            title: "Your Fault",
            release_date: "2024-12-26",
            genres: ["Romance", "Drama"],
            overview:
                "The love between Noah and Nick seems unwavering despite their parents' attempts to separate them. But his job and her entry into college open up their lives to new relationships that will shake the foundations of both their relationship and the Leister family itself.",
            backdrop_path: "/6qld2YxAO9gdEblo0rsEb8BcYKO.jpg",
            logo_path: "/kktwsvYZKrOwBT0271X9PePpKFQ.png",
            link: 1156593,
        },
        {
            title: "Nosferatu",
            release_date: "2024-12-25",
            genres: ["Horror", "Fantasy"],
            overview:
                "A gothic tale of obsession between a haunted young woman and the terrifying vampire infatuated with her, causing untold horror in its wake.",
            backdrop_path: "/uWOJbarUXfVf6B4o0368dh138eR.jpg",
            logo_path: "/wpGrTiLVoBAR2qsbCN0W4KFBPs2.png",
            link: 426063,
        },
        {
            title: "Sonic the Hedgehog 3",
            release_date: "2024-12-19",
            genres: ["Action", "Science Fiction", "Comedy", "Family"],
            overview:
                "Sonic, Knuckles, and Tails reunite against a powerful new adversary, Shadow, a mysterious villain with powers unlike anything they have faced before. With their abilities outmatched in every way, Team Sonic must seek out an unlikely alliance in hopes of stopping Shadow and protecting the planet.",
            backdrop_path: "/zOpe0eHsq0A2NvNyBbtT6sj53qV.jpg",
            logo_path: "/giz8GGoIMYvLf1Tm8N5dUz67DEn.png",
            link: 939243,
        },
        {
            title: "The Lord of the Rings: The War of the Rohirrim",
            release_date: "2024-12-05",
            genres: ["Animation", "Fantasy", "Action", "Adventure"],
            overview:
                "183 years before the events chronicled in the original trilogy, a sudden attack by Wulf, a clever and ruthless Dunlending lord seeking vengeance for the death of his father, forces Helm Hammerhand and his people to make a daring last stand in the ancient stronghold of the Hornburg. Finding herself in an increasingly desperate situation, H\u00e9ra, the daughter of Helm, must summon the will to lead the resistance against a deadly enemy intent on their total destruction.",
            backdrop_path: "/4ZXzO32rKk5bSoDZA6KpTzVJA.jpg",
            logo_path: "/wk6UTlcU4li2xRLzLIdIwpE44IF.png",
            link: 839033,
        },
        {
            title: "Moana 2",
            release_date: "2024-11-21",
            genres: ["Animation", "Adventure", "Family", "Comedy"],
            overview:
                "After receiving an unexpected call from her wayfinding ancestors, Moana journeys alongside Maui and a new crew to the far seas of Oceania and into dangerous, long-lost waters for an adventure unlike anything she's ever faced.",
            backdrop_path: "/tElnmtQ6yz1PjN1kePNl8yMSb59.jpg",
            logo_path: "/w3VxtldVo4c77jBxVtJBGH4ps3f.png",
            link: 1241982,
        },
        {
            title: "Venom: The Last Dance",
            release_date: "2024-10-22",
            genres: ["Action", "Science Fiction", "Adventure", "Thriller"],
            overview:
                "Eddie and Venom are on the run. Hunted by both of their worlds and with the net closing in, the duo are forced into a devastating decision that will bring the curtains down on Venom and Eddie's last dance.",
            backdrop_path: "/3V4kLQg0kSqPLctI5ziYWabAZYF.jpg",
            logo_path: "/f2j9DtQXZBYpfUJ6nyON258aHRe.png",
            link: 912649,
        },
        {
            title: "The Substance",
            release_date: "2024-09-07",
            genres: ["Horror", "Science Fiction"],
            overview:
                "A fading celebrity decides to use a black market drug, a cell-replicating substance that temporarily creates a younger, better version of herself.",
            backdrop_path: "/t98L9uphqBSNn2Mkvdm3xSFCQyi.jpg",
            logo_path: "/yXMt7AkV2W5sZsq8DtFZaBUupZS.png",
            link: 933260,
        },
        {
            title: "Wicked",
            release_date: "2024-11-20",
            genres: ["Drama", "Romance", "Fantasy"],
            overview:
                "In the land of Oz, ostracized and misunderstood green-skinned Elphaba is forced to share a room with the popular aristocrat Glinda at Shiz University, and the two's unlikely friendship is tested as they begin to fulfill their respective destinies as Glinda the Good and the Wicked Witch of the West.",
            backdrop_path: "/uVlUu174iiKhsUGqnOSy46eIIMU.jpg",
            logo_path: "/oeSUu0CjuohGO6oIiFkxn4xHbrt.png",
            link: 402431,
        },
        {
            title: "The Return",
            release_date: "2024-09-07",
            genres: ["History", "Drama", "Adventure"],
            overview:
                "After twenty years away, Odysseus washes up on the shores of Ithaca, haggard and unrecognizable. The king has finally returned home, but much has changed in his kingdom since he left to fight in the Trojan war.",
            backdrop_path: "/iI0qvHy2uN1x2mhz1iCuK3HkMs7.jpg",
            logo_path: null,
            link: 975511,
        },
    ],
    tv_shows: [
        {
            title: "Squid Game",
            release_date: "2021-09-17",
            genres: ["Action & Adventure", "Mystery", "Drama"],
            overview:
                "Hundreds of cash-strapped players accept a strange invitation to compete in children's games. Inside, a tempting prize awaits \u2014 with deadly high stakes.",
            backdrop_path: "/2meX1nMdScFOoV4370rqHWKmXhY.jpg",
            logo_path: "/vCyCNjfzWimmap1IRWs91G9fPwp.png",
            link: 93405,
        },
        {
            title: "What If...?",
            release_date: "2021-08-11",
            genres: ["Animation", "Action & Adventure", "Sci-Fi & Fantasy"],
            overview:
                "Taking inspiration from the comic books of the same name, each episode of this animated anthology series questions, revisits and twists classic Marvel Cinematic moments.",
            backdrop_path: "/4N6zEMfZ57zNEQcM8gWeERFupMv.jpg",
            logo_path: "/zWX2sHd0KnRTvIi7nJ5k7ng5EMW.png",
            link: 91363,
        },
        {
            title: "Doctor Who",
            release_date: "2024-05-11",
            genres: ["Action & Adventure", "Drama", "Sci-Fi & Fantasy"],
            overview:
                "The Doctor and his companion travel across time and space encountering incredible friends and foes.",
            backdrop_path: "/gDtZQmfzvErZpeXOVeCBQE9WkSF.jpg",
            logo_path: "/wkHMRqIwVi8GjAIJuWeMXfNhpx.png",
            link: 239770,
        },
        {
            title: "Silo",
            release_date: "2023-05-04",
            genres: ["Sci-Fi & Fantasy", "Drama"],
            overview:
                "In a ruined and toxic future, thousands live in a giant silo deep underground. After its sheriff breaks a cardinal rule and residents die mysteriously, engineer Juliette starts to uncover shocking secrets and the truth about the silo.",
            backdrop_path: "/n5FPNMJ0eRoiQrKGfUQQRAZeaxg.jpg",
            logo_path: "/orJ5TfInOu5CzgFIDs4avqEg0wu.png",
            link: 125988,
        },
        {
            title: "Guardians of the Dafeng",
            release_date: "2024-12-28",
            genres: ["Drama", "Action & Adventure"],
            overview:
                "Xu Qi\u2019an, a recent police academy graduate, awakens in a strange world filled with Confucians, Taoists, Buddhists, demons, and warlocks. Facing imminent exile to a remote frontier town, he seizes the chance to change his fate by joining a powerful organization of guardians.",
            backdrop_path: "/5JbWk5f3zSbwkQjbCazWi1adDMl.jpg",
            logo_path: null,
            link: 233912,
        },
        {
            title: "Landman",
            release_date: "2024-11-17",
            genres: ["Drama"],
            overview:
                "Set in the proverbial boomtowns of West-Texas and a modern-day tale of fortune-seeking in the world of oil rigs, the series is an upstairs/downstairs story of roughnecks and wildcat billionaires that are fueling a boom so big it\u2019s reshaping our climate, our economy and our geopolitics.",
            backdrop_path: "/mh2UczqEXJJVgqohbyZbHTuxwhL.jpg",
            logo_path: "/13lJnfO3oExZ2ECzAR6WDyShzlV.png",
            link: 157741,
        },
        {
            title: "Arcane",
            release_date: "2021-11-06",
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
            logo_path: "/jXLNOzeEA8AoJy92dJTUUZXTMxK.png",
            link: 94605,
        },
        {
            title: "Doctor Who",
            release_date: "2005-03-26",
            genres: ["Action & Adventure", "Drama", "Sci-Fi & Fantasy"],
            overview:
                "The Doctor is a Time Lord: a 900 year old alien with 2 hearts, part of a gifted civilization who mastered time travel. The Doctor saves planets for a living\u2014more of a hobby actually, and the Doctor's very, very good at it.",
            backdrop_path: "/vcFW09U4834DyFOeRZpsx9x1D3S.jpg",
            logo_path: "/r6aeDXC3UE8PfzdorYfQWpPJTho.png",
            link: 57243,
        },
        {
            title: "Dexter: Original Sin",
            release_date: "2024-12-15",
            genres: ["Crime", "Drama"],
            overview:
                "In 1991 Miami, Dexter Morgan transitions from student to avenging serial killer. When his bloodthirsty urges can't be ignored any longer, Dexter must learn to channel his inner darkness. With the guidance of his father, Harry, he adopts a Code designed to help him find and kill people who deserve to be eliminated from society without getting on law enforcements' radar. This is a particular challenge for young Dexter as he begins a forensics internship at the Miami Metro Police Department.",
            backdrop_path: "/jmcRdwSOb1Bo1snMtxTSWOqbvgR.jpg",
            logo_path: "/dfqnNvicjlul2LAZzet1AePHIAg.png",
            link: 219937,
        },
        {
            title: "Dune: Prophecy",
            release_date: "2024-11-17",
            genres: ["Sci-Fi & Fantasy", "Drama", "Action & Adventure"],
            overview:
                "Ten thousand years before the ascension of Paul Atreides, sisters Valya and Tula Harkonnen establish the fabled sect and female order that would become known as the Bene Gesserit to control the future of humankind.",
            backdrop_path: "/tWb81lXOBUQoyavNzXrp11ss6GS.jpg",
            logo_path: "/bU1A40IvAE6FRQXVCaYwHLd0HSY.png",
            link: 90228,
        },
    ],
    anime: [
        {
            title: "Bleach",
            release_date: "2004-10-05",
            genres: ["Action & Adventure", "Animation", "Sci-Fi & Fantasy"],
            overview:
                "For as long as he can remember, Ichigo Kurosaki has been able to see ghosts. But when he meets Rukia, a Soul Reaper who battles evil spirits known as Hollows, he finds his life is changed forever. Now, with a newfound wealth of spiritual energy, Ichigo discovers his true calling: to protect the living and the dead from evil.",
            backdrop_path: "/o0NsbcIvsllg6CJX0FBFY8wWbsn.jpg",
            logo_path: "/jEImh4O7mcYuwuAeryGZo3G6hg6.png",
            link: "1494",
        },
        {
            title: "BLUE LOCK",
            release_date: "2022-10-09",
            genres: ["Animation", "Action & Adventure", "Drama"],
            overview:
                "After a disastrous defeat at the 2018 World Cup, Japan's team struggles to regroup. But what's missing? An absolute Ace Striker, who can guide them to the win. The Japan Football Union is hell-bent on creating a striker who hungers for goals and thirsts for victory, and who can be the decisive instrument in turning around a losing match...and to do so, they've gathered 300 of Japan's best and brightest youth players. Who will emerge to lead the team...and will they be able to out-muscle and out-ego everyone who stands in their way?",
            backdrop_path: "/seMRyWVwIVBWbC9xaMzDMZJ8fUH.jpg",
            logo_path: "/frZHsrVO7BjhfoHeWRBebKTU5u7.png",
            link: "8373",
        },
        {
            title: "Dan Da Dan",
            release_date: "2024-10-04",
            genres: [
                "Animation",
                "Action & Adventure",
                "Comedy",
                "Sci-Fi & Fantasy",
            ],
            overview:
                "In a bet to prove whether ghosts or aliens exist, two high schoolers face terrifying paranormal threats, gain superpowers and maybe even fall in love?!",
            backdrop_path: "/jlbUx0aHJupDVDlCo0R7UxSaUUd.jpg",
            logo_path: "/vut8K3JgrDiI8VKicagwr4OvHsb.png",
            link: "15927",
        },
        {
            title: "Attack on Titan",
            release_date: "2013-04-07",
            genres: ["Animation", "Sci-Fi & Fantasy", "Action & Adventure"],
            overview:
                "Many years ago, the last remnants of humanity were forced to retreat behind the towering walls of a fortified city to escape the massive, man-eating Titans that roamed the land outside their fortress. Only the heroic members of the Scouting Legion dared to stray beyond the safety of the walls \u2013 but even those brave warriors seldom returned alive. Those within the city clung to the illusion of a peaceful existence until the day that dream was shattered, and their slim chance at survival was reduced to one horrifying choice: kill \u2013 or be devoured!",
            backdrop_path: "/yvKrycViRMQcIgdnjsM5JGNWU4Q.jpg",
            logo_path: "/csy774JSTIoo4KUkrFWtU9SHA8j.png",
            link: "4831",
        },
        {
            title: "Shangri-La Frontier",
            release_date: "2023-10-01",
            genres: [
                "Animation",
                "Action & Adventure",
                "Comedy",
                "Sci-Fi & Fantasy",
            ],
            overview:
                "Rakuro Hizutome only cares about one thing: beating crappy VR games. He devotes his entire life to these buggy games and could clear them all in his sleep. One day, he decides to challenge himself and play a popular god-tier game called Shangri-La Frontier. But he quickly learns just how difficult it is. Will his expert skills be enough to uncover its hidden secrets?",
            backdrop_path: "/yErVUZkLVak2ICxFC7mMfl3vcNP.jpg",
            logo_path: "/3LFu0PSGCmlq1ljfqp4DiRewe5u.png",
            link: "8758",
        },
        {
            title: "DEMON LORD 2099",
            release_date: "2024-10-13",
            genres: ["Animation", "Sci-Fi & Fantasy", "Action & Adventure"],
            overview:
                "Five centuries ago, Demon Lord Veltol reigned over an immortal nation. Now, the time has come for him to awaken once again. The year is 2099, and civilization has reached peak evolution, leading to a high-tech landscape with towering skyscrapers\u2014nothing like he\u2019s conquered before. Veltol may be a relic of the past, but make no mistake, this new world will be his for the taking!",
            backdrop_path: "/rS6CNUPU62dsSmsPieLGm6NceZa.jpg",
            logo_path: "/nxHe1tlkkioGdxcSNWfICWIiSC1.png",
            link: "15790",
        },
        {
            title: "Re:ZERO -Starting Life in Another World-",
            release_date: "2016-04-04",
            genres: [
                "Animation",
                "Comedy",
                "Action & Adventure",
                "Sci-Fi & Fantasy",
            ],
            overview:
                "Natsuki Subaru, an ordinary high school  student, is on his way home from the convenience store when he finds  himself transported to another world. As he's lost and confused in a new  world where he doesn't even know left from right, the only person to  reach out to him was a beautiful girl with silver hair. Determined to  repay her somehow for saving him from his own despair, Subaru agrees to  help the girl find something she's looking for.",
            backdrop_path: "/ai8bVS8Suvu4ErBhmgBvtESirBY.jpg",
            logo_path: "/wNysocYhYIiCNI3SQBBTw0DTkWu.png",
            link: "128",
        },
        {
            title: "Tower of God",
            release_date: "2020-04-02",
            genres: [
                "Animation",
                "Mystery",
                "Sci-Fi & Fantasy",
                "Action & Adventure",
            ],
            overview:
                "Reach the top, and everything will be yours. At the top of the tower exists everything in this world, and all of it can be yours. You can become a god. This is the story of the beginning and the end of Rachel, the girl who climbed the tower so she could see the stars, and Bam, the boy who needed nothing but her.",
            backdrop_path: "/gcvJgJScIt0a5sRt8uLIkGM9IhI.jpg",
            logo_path: "/mX5wfNlkuS3vZNxXqXo7uxdddEp.png",
            link: "7882",
        },
        {
            title: "Is It Wrong to Try to Pick Up Girls in a Dungeon?",
            release_date: "2015-04-04",
            genres: [
                "Animation",
                "Comedy",
                "Sci-Fi & Fantasy",
                "Action & Adventure",
            ],
            overview:
                "In Orario, fearless adventurers band together in search of fame and fortune within the underground labyrinth known as the Dungeon. But Bell Cranel, novice adventurer, has bigger plans than riches and glory; he fights monsters in the hope of having a fateful encounter with a girl. When this happens, it doesn't go exactly as he planned. Thus begins the story of an unlikely pair, a boy and a goddess, both trying to prove themselves, both eager to reach their goals.",
            backdrop_path: "/xCmdeEvJNxptR30bEVXXWLrt4iI.jpg",
            logo_path: "/fds7WouJOLo8lYYaGcUhIruw9M7.png",
            link: "5443",
        },
        {
            title: "Look Back",
            release_date: "2024-06-28",
            genres: ["Animation", "Drama"],
            overview:
                "Popular, outgoing Fujino is celebrated by her classmates for her funny comics in the class newspaper. One day, her teacher asks her to share the space with Kyomoto, a truant recluse whose beautiful artwork sparks a competitive fervor in Fujino. What starts as jealousy transforms when Fujino realizes their shared passion for drawing.",
            backdrop_path: "/1MzBCKjwDyQg2Cu8XJR8Ox59sWY.jpg",
            logo_path: "/vgwvmnnGODDN9yVAwelxgDFKbvx.png",
            link: "9242",
        },
    ],
};
