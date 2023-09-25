require('dotenv').config({
    multiline: true,
    path: `.env`,
  });
const { App } = require('@slack/bolt');
const fs = require('fs');
const { sendSuccessMessage } = require('../src/SlackMessage');
const { addSubscription, findSubscriptions, removeSubscription } = require('../src/Subscriptions');
const { getTeamFromReaction } = require('../src/Reactions');
const Teams = JSON.parse(fs.readFileSync('./data/product-teams.json', { encoding: 'utf8'}))

const app = new App({
  token: process.env.BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
  ignoreSelf: false,
});

const parseHelmMessage = (message) => {
  try {
  const revision = message.match(new RegExp('revision\n(.*)\nsummary'))[1];
  const repo = message.match(new RegExp('^helmrelease/(.*)\.default'))[1];
  const githubLink = `https://github.com/nicheinc/${repo}/releases/tag/helm-chart-${revision}`;
    return {
      revision,
      repo,
      githubLink
    };
  } catch (error) {
    return {};
  }
};

const parseGitHubReleaseMessage = (message) => {
  try {
    const matches = message.match(new RegExp('^GitHub has promoted (.*):(.*)\n'));
    const repo = matches[1];
    const revision = matches[2];
    const githubLink = `https://github.com/nicheinc/${repo}/releases/tag/${revision}`;
    return {
      revision,
      repo,
      githubLink
    };
  } catch (error) {
    return {};
  }
};

const parseGitHubMessage = (message) => {
  try {
    const matches = message.match(new RegExp('^GitHub has built (.*):(.*)\n'));
    const repo = matches[1];
    const revision = matches[2];
    const githubLink = `https://github.com/nicheinc/${repo}/releases/tag/${revision}`;
    return {
      revision,
      repo,
      githubLink
    };
  } catch (error) {
    return {};
  }
};

(async () => {
  await app.start();
  app.command('/subscribe', async ({command, ack, respond}) => {
    await ack();
    const team = command.text.split(' ')[0].toLowerCase();
    const serviceName = command.text.split(' ')[1];

    if(Teams.hasOwnProperty(team)){
      addSubscription(team, serviceName, 'team');
      await respond(`${team} subscribed to successful ${serviceName} deployments`)
    } else {
      await respond(`${team} is not a recognized product team. Cannot subscribe`);
    }
  });
  app.command('/unsubscribe', async ({command, ack, respond}) => {
    await ack();
    const team = command.text.split(' ')[0].toLowerCase();
    const serviceName = command.text.split(' ')[1];
    const removalResult = removeSubscription(team, serviceName, 'team');
    await respond(removalResult)
  });
  app.command('/subscribeme', async ({command, ack, respond}) => {
    //TODO: adjust the methods in addSubscription to take in many services at once
    await ack();
    const user = command.user_id;
    const serviceName = command.text.split(' ')[0]; //only taking the first service for now
    addSubscription(user, serviceName, 'user');
    await respond(`You subscribed to successful ${serviceName} deployments`)
  });
  app.command('/unsubscribeme', async ({command, ack, respond}) => {
    //todo: adjust the methods in removeSubscription to take in many services at once
    await ack();
    const user = command.user_id;
    const serviceName = command.text.split(' ')[0]; //only taking the first service for now
    const removalResult = removeSubscription(user, serviceName, 'user');
    await respond(removalResult)
  });
  app.command('/testit', async ({command, client, ack}) => {
    await ack();
      console.log('started');
      //console.log(message);
      //console.log(command);
      let testMessage = fs.readFileSync('./exampleMessages/exampleGithubReleaseMessage.txt', { encoding: 'utf8'});
      await client.chat.postMessage({ text: testMessage, channel: command.channel_name});
      testMessage = fs.readFileSync('./exampleMessages/exampleGithubMessage.txt', { encoding: 'utf8'});
      await client.chat.postMessage({ text: testMessage, channel: command.channel_name});
      testMessage = fs.readFileSync('./exampleMessages/exampleSuccessfulFluxDeploy.txt', { encoding: 'utf8'});
      await client.chat.postMessage({ text: testMessage, channel: command.channel_name});
  });
  app.message(new RegExp('^helmrelease.*Helm upgrade succeeded', 's'), async ({message, say, client}) => {
    // console.log('message??');
    // console.log(message);
    //await say('hello');

    const parsed = parseHelmMessage(message.text);
    const subscriptions = [...findSubscriptions(parsed.repo, 'team'), ...findSubscriptions(parsed.repo, 'user')];
    
    for (const subscriber of subscriptions) {
      await sendSuccessMessage(client, { subscriber, repo: parsed.repo, revision: parsed.revision, githubLink: parsed.githubLink});
    }
  });
  app.event('reaction_added', async ({event, client}) => {
    console.log(event);
    // check that reaction is in the list of team reactions
    const reaction = event.reaction;
    const team = getTeamFromReaction(reaction);
    if (!team) {
      return;
    }
    const channel = event.item.channel;
    const ts = event.item.ts;
    const message = (await client.conversations.history({ channel: channel, oldest: ts, limit:1, inclusive: true})).messages[0];
    // check that the message only has 1 reaction of the one we care about
    const messageReactions = message.reactions.find((messageReaction) => messageReaction.name == reaction);
    if (messageReactions.count !== 1) {
      // there might be a race condition here but I dont think we can do anything about it
      // not the first time its been reacted to, dont send message again
      console.log('bouncing?');
      return;
    }
    // check that message is one of the messages we care about
    let parsed = parseGitHubReleaseMessage(message.text);
    if (!parsed.revision && !parsed.repo) {
      parsed = parseGitHubMessage(message.text);
    }
    if (!parsed.revision && !parsed.repo) {
      parsed = parseHelmMessage(message.text);
    }
    // send the message
    if (!parsed.revision && !parsed.repo) {
      return;
    }
    await sendSuccessMessage(client, { subscriber: team, repo: parsed.repo, revision: parsed.revision, githubLink: parsed.githubLink});
  });
  console.log('⚡️ Bolt app started');
})();