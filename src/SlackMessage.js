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

module.exports = { finalBlockBuilder };