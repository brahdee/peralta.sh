import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";

const clientID = secret("spotifyClientID");
const clientSecret = secret("spotifyClientSecret");
const refreshToken = secret("spotifyRefreshToken");

import sharp from "sharp";

async function getAverageColor(imageUrl: string): Promise<string> {
    const response = await fetch(imageUrl);
    const buffer = Buffer.from(await response.arrayBuffer());

    const { data } = await sharp(buffer)
        .resize(1, 1)
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    return `rgba(${data[0]}, ${data[1]}, ${data[2]}, 0.3)`;
}

type Details = {
  readonly age: number,
  readonly nowPlaying: NowPlaying | null
}

interface NowPlaying {
    name: string;
    url: string;
    image: string;
    color: string;
}

interface SpotifyResponse {
    is_playing: boolean;
    item: {
        name: string;
        external_urls: {
            spotify: string;
        };
    } | null;
}

async function getCurrentSong(): Promise<NowPlaying | null> {
    // Refresh access token
    const tokenResponse = await fetch(
        "https://accounts.spotify.com/api/token",
        {
            method: "POST",
            headers: {
                Authorization: "Basic " + Buffer.from(
                    `${clientID()}:${clientSecret()}`
                ).toString("base64"),
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken()
            })
        }
    );

    if (!tokenResponse.ok) return null;

    const tokenData = await tokenResponse.json() as {
        access_token: string;
    };

    const response = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`
            }
        }
    );

    if (response.status === 204 || !response.ok) return null;

    const data = await response.json() as {
        item: {
            name: string;
            external_urls: {
                spotify: string;
            };
            album: {
                images: {
                    url: string;
                    width: number;
                    height: number;
                }[];
            };
        } | null;
    };

    if (!data.item) return null;

    return {
        name: data.item.name,
        url: data.item.external_urls.spotify,
        image: data.item.album.images[0]?.url ?? "",
        color: await getAverageColor(data.item.album.images[0].url) ?? ""
    };
}

var currentAge = Math.floor((new Date().getTime() - new Date("2006-12-18T12:00:00.0000").getTime()) / 31557600000);

export async function getDetails(): Promise<Details> {
    return {
        age: currentAge,
        nowPlaying: await getCurrentSong()
    }
}

export const currentSong = api(
    { expose: true, method: "GET", path: "/spotify/current" },
    async (): Promise<{ song: NowPlaying | null }> => {
        return {
            song: await getCurrentSong()
        };
    }
);