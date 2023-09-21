const fs = require('fs');

function getGif(team) {
  try {
      const gifs = fs.readdirSync(`./gifs/${team}`);
      const gif = gifs[Math.floor(Math.random() * gifs.length)];
      return `https://raw.githubusercontent.com/nicheinc/DeployCelebrationAction/main/gifs/${team}/${gif}`;}
  catch (err) {
      console.log("Error Getting Gif: " + err);
  }
}
module.exports = { getGif };
