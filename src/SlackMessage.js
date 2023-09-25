const fs = require('fs');
const { getGif } = require('../src/GifPicker');
const Teams = JSON.parse(fs.readFileSync('./data/product-teams.json', { encoding: 'utf8'}))

const blockHeaderBuilder = (team) => {
  return {
    type: "header",
    text: {
      type: "plain_text",
      text: `Congratulations ${team}!`
    }
  };
};

const blockButtonBuilder = (params) => {
  const { repoName, releaseNum, releaseURL } = params;
  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `${repoName}/${releaseNum}`
    },
    accessory: {
      type: "button",
      text: {
        type: "plain_text",
        text: "View changes"
      },
      value: "View changes",
      url: `${releaseURL}`,
      action_id: "button-action"
    }
  };
};

const blockImageBuilder = (params) => {
  const { image, altText } = params;
  return {
    type: "image",
    image_url: `${image}`,
    alt_text: `${altText}`
  };
};

const finalBlockBuilder = (params) => {
  const { team, repoName, releaseNum, releaseURL, image, altText } = params;
  let blocks = new Array();
  blocks.push(
    blockHeaderBuilder(team),
    blockButtonBuilder({ repoName: repoName, releaseNum: releaseNum, releaseURL: releaseURL }),
    blockImageBuilder({ image: image, altText: altText })
  );
  return blocks;
};

const sendSuccessMessage = async(client, data = {}) => {
  const gif = getGif(data.subscriber);
  let channel
  let subscriber

  if(Teams.hasOwnProperty(data.subscriber)){
    //const getChannelFromTeam = (team) => `pt-${team}`;
    channel = `pt-${data.subscriber}`
    subscriber = data.subscriber
  } else {
    channel = data.subscriber
    const userProfile = await client.users.profile.get({user: data.subscriber})
    subscriber = userProfile.profile.display_name
  }
  const text = `${data.repo} was just updated with ${data.revision} ${data.githubLink} ${gif}`;
  
  const blocks = finalBlockBuilder({ team: subscriber, repoName: data.repo, releaseNum: data.revision, releaseURL: data.githubLink, image: gif, altText: `${data.subscriber} gif` });

  await client.chat.postMessage({ text, channel, blocks});
};
module.exports = { sendSuccessMessage };