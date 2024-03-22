const fs = require('fs');
const Teams = JSON.parse(fs.readFileSync('./data/product-teams.json', { encoding: 'utf8'}))

function getGif(team) {
  if(Teams.hasOwnProperty(team)){
  try {
      const gifs = fs.readdirSync(`./gifs/${team}`);
      const gif = gifs[Math.floor(Math.random() * gifs.length)];
      return `https://raw.githubusercontent.com/nicheinc/DeployCelebrationAction/main/gifs/${team}/${gif}`;}
  catch (err) {
      console.log("Error Getting Gif: " + err);
  }
  } else {
    try {
      const gifs = fs.readdirSync(`./gifs/user`);
      const gif = gifs[Math.floor(Math.random() * gifs.length)];
      return `https://raw.githubusercontent.com/nicheinc/DeployCelebrationAction/main/gifs/user/${gif}`;}
  catch (err) {
      console.log("Error Getting Gif: " + err);
  }
  }

}
module.exports = { getGif };
