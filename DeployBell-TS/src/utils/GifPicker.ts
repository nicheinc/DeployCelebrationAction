import fs from "fs";
import { Teams } from "../data/ProductTeams";

/**
 * Returns a random gif for a product team or user subscriber. If a product team is not found for it is assumed that the gif is for a user subscriber and a random gif for users is returned. In the event a gif cannot be found for the team or user, a default gif is returned.
 * @param team A string representing the product team that the gif should be associated with.
 * @returns The url of a gif
 */
export const getGif = (subscriber: string): string => {
  if (Teams.hasOwnProperty(subscriber)) {
    try {
      const gifs = fs.readdirSync(`./gifs/${subscriber}`);
      const gif = gifs[Math.floor(Math.random() * gifs.length)];
      return `https://raw.githubusercontent.com/nicheinc/DeployCelebrationAction/main/gifs/${subscriber}/${gif}`;
    } catch (err) {
      console.log("Error Getting Gif, posting default instead: " + err);
      return "https://raw.githubusercontent.com/nicheinc/DeployCelebrationAction/main/gifs/user/celebration.gif";
    }
  } else {
    try {
      const gifs = fs.readdirSync(`./gifs/user`);
      const gif = gifs[Math.floor(Math.random() * gifs.length)];
      return `https://raw.githubusercontent.com/nicheinc/DeployCelebrationAction/main/gifs/user/${gif}`;
    } catch (err) {
      console.log("Error Getting Gif, posting default instead: " + err);
      return "https://raw.githubusercontent.com/nicheinc/DeployCelebrationAction/main/gifs/user/celebration.gif";
    }
  }
};
