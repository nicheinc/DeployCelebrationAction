require('dotenv').config({
    multiline: true,
    path: `.env`,
  });
//import { getGif } from '../src/GifPicker';
const { App } = require('@slack/bolt');
const { getGif } = require('../src/GifPicker');
const { finalBlockBuilder } = require('../src/SlackMessage');
const FLUXBOT_USER = 'U037RFETB7C'; //ME, REPLACE
const fs = require('fs');

const app = new App({
  token: process.env.BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
  ignoreSelf: false,
});

const getTeamsFromRepo = (repo) => ['foxtrot'];

const getChannelFromTeam = (team) => team;

const sendSuccessMessage = async(client, data = {}) => {
    
    const channel = getChannelFromTeam(data.team);
    const gif = getGif(data.team);

    const text = `${data.repo} was just updated with ${data.revision} ${data.githubLink} ${gif}`;
    
    const blocks = finalBlockBuilder({ team: data.team, repoName: data.repo, releaseNum: data.revision, releaseURL: data.githubLink, image: gif, altText: `${data.team} gif` });

    await client.chat.postMessage({ text, channel, blocks});
};

(async () => {
  await app.start();
  app.command('/testit', async ({command, client, ack}) => {
    await ack();
      console.log('started');
      //console.log(message);
      //console.log(command);
      let testMessage = fs.readFileSync('./exampleMessages/exampleGithubMessage.txt', { encoding: 'utf8'});
      await client.chat.postMessage({ text: testMessage, channel: command.channel_name});
      testMessage = fs.readFileSync('./exampleMessages/exampleSuccessfulFluxDeploy.txt', { encoding: 'utf8'});
      await client.chat.postMessage({ text: testMessage, channel: command.channel_name});
  });
  app.message(new RegExp('^helmrelease.*Helm upgrade succeeded', 's'), async ({message, say, client}) => {
    console.log('message??');
    console.log(message);
    if (true ||  message.user == FLUXBOT_USER) {
        await say('hello');

        const revision = message.text.match(new RegExp('revision\n(.*)\nsummary'))[1];
        const repo = message.text.match(new RegExp('^helmrelease/(.*)\.default'))[1];
        const githubLink = `https://github.com/nicheinc/${repo}/releases/tag/helm-chart-${revision}`;
        const teams = getTeamsFromRepo(repo);
        for (const team of teams) {
          await sendSuccessMessage(client, { team, repo, revision, githubLink});
        }
        //const githubMessage = savedGitHubMessages.filter((githubMessage) => githubMessage.revision == revision && githubMessage.repo == repo)[0];
        //console.log({githubMessage});
        //const githubMessage = client.search.messages({ query: `in:${message.channel} helm`, sort: 'timestamp'});
        //console.log(githubMessage);
    }
  });
  console.log('⚡️ Bolt app started');
})();