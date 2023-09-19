 import fs from "fs";
 
 /**
 * Product teams at Niche
 */
export enum Team {
    Alpha = "alpha", 
    Bravo = "bravo",
    Charlie = "charlie",
    Delta = "delta",
    Echo = "echo",
    Foxtrot = "foxtrot",
    Golf = "golf",
    Hotel = "hotel",
    Indigo = "indigo"    
} 

/**
 * @returns a random gif for the specified team from the gifs folder.
 * @param team - The {@link Team} to get a gif for
 * Example: parameter "Team.Indigo" will return a gif from gifs/indigo
 */
export function getGif(team: Team) {
    try {
        const gifs = fs.readdirSync(`./gifs/${team}`);
        const gif = gifs[Math.floor(Math.random() * gifs.length)];
        return `./gifs/${team}/${gif}`;}
    catch (err) {
        console.log("Error: " + err);
    }
}
