require('dotenv').config({
    multiline: true,
    path: `.env`,
  });
const { App } = require('@slack/bolt');
const FLUXBOT_USER = 'U037RFETB7C'; //ME, REPLACE
const GITHUB_ACTIONS_USER = 'U037RFETB7C'; // ME, REPLACE

const app = new App({
  token: process.env.BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

const sendSuccessMessage = async(client, data = {}) => {
    await client.chat.postMessage({ text: data.text, channel: data.channel});
};

(async () => {
  await app.start();

  //app.processEvent
  //app.event
  app.message(new RegExp('^helmrelease.*Helm upgrade succeeded', 's'), async ({message, say, client}) => {
    console.log('message??');
    console.log(message);
    if (message.user == FLUXBOT_USER) {
        await say('hello');
        await sendSuccessMessage(client, { text: 'new hello', channel: 'bravo'});
    }
  });
  console.log('⚡️ Bolt app started');
})();