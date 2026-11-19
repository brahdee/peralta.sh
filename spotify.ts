import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";

import sharp from "sharp";

// Token variables
const clientID = secret("spotifyClientID");
const clientSecret = secret("spotifyClientSecret");
const refreshToken = secret("spotifyRefreshToken");

let accessToken = "";
let tokenExpiresAt = 0;

// Cache variables for optimization
const colorCache = new Map<string, string>();
let cachedSong: NowPlaying | null = null;
let lastSongFetch = 0;

const CACHE_DURATION = 2000;

// Interfaces for expected variables 
interface NowPlaying {
    name: string;
    url: string;
    image: string;
    color: string;
    artist: string;
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

// Gets the access token that will be used to communicate with Spotify's API 
async function getAccessToken(): Promise<string | null> {
    if (accessToken && Date.now() < tokenExpiresAt) {
        return accessToken;
    }

    const response = await fetch(
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

    if (!response.ok) return null;

    const data = await response.json() as {
        access_token: string;
        expires_in: number;
    };

    accessToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

    return accessToken;
}

// Gets the average color of album artwork for use with dynamic elements
async function getAverageColor(imageUrl: string): Promise<string> {
    const cached = colorCache.get(imageUrl);

    if (cached) return cached;

    const response = await fetch(imageUrl);
    const buffer = Buffer.from(await response.arrayBuffer());

    const { data } = await sharp(buffer)
        .resize(1, 1)
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const color = `rgba(${data[0]}, ${data[1]}, ${data[2]})`;

    colorCache.set(imageUrl, color);

    return color;
}

// Gets a NowPlaying object using API responses
async function getCurrentSong(): Promise<NowPlaying | null> {
    if (Date.now() - lastSongFetch < CACHE_DURATION) {
        return cachedSong;
    }

    const token = await getAccessToken();
    if (!token) return null;

    const response = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
            headers: {
                Authorization: `Bearer ${token}`
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
            artists: {
                name: string;
            }[];
        } | null;
    };

    if (!data.item) return null;

    const imageUrl = data.item.album.images[0]?.url ?? "";

    cachedSong = {
        name: data.item.name,
        url: data.item.external_urls.spotify,
        image: imageUrl,
        color: await getAverageColor(imageUrl),
        artist: data.item.artists.map(a => a.name).join(", ")
    };

    lastSongFetch = Date.now();

    return cachedSong;
}

// Export for use in details.ts
export const currentSong = api(
    { expose: true, method: "GET", path: "/spotify/current" },
    async (): Promise<{ song: NowPlaying | null }> => {
        return {
            song: await getCurrentSong()
        };
    }
);