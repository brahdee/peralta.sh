import { currentSong } from "./spotify";

type Details = {
  readonly age: number,
  readonly nowPlaying: object
}

// Have my age update automatically over time
var currentAge = Math.floor((new Date().getTime() - new Date("2006-12-18T12:00:00.0000").getTime()) / 31557600000);

export async function getDetails(): Promise<Details> {
    return {
        age: currentAge,
        nowPlaying: currentSong
    }
}