/* eslint-disable no-console */
/* eslint-disable import/no-internal-modules */
import "./utils/env";
import fs from "fs";
import { App, LogLevel } from "@slack/bolt";
import { parseHelmMessage, parseMessage } from "./utils/ParseMessage";
import { formatListMessage, formatSuccessMessage } from "./utils/SlackMessage";
import { getTeamFromReaction } from "./utils/Reactions";
import {
  SubscriptionType,
  addSubscription,
  findRepoSubscribers,
  removeSubscription,
} from "./utils/Subscriptions";
import { Teams } from "./data/ProductTeams";
import {
  getTeamSubscriberData,
  getUserSubscriberData,
} from "./utils/SlashCommand";

const app = new App({
  token: process.env.BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  ignoreSelf: false,
});

app.use(async ({ next }) => {
  await next();
});

/** For testing and debugging only. Posts some hard coded messages in the format of what is seen in the deploy channel */
app.command("/testit", async ({ command, client, ack }) => {
  await ack();
  const githubReleaseMessage = fs.readFileSync(
    "./exampleMessages/exampleGithubReleaseMessage.txt",
    { encoding: "utf8" }
  );
  const githubMessage = fs.readFileSync(
    "./exampleMessages/exampleGithubMessage.txt",
    { encoding: "utf8" }
  );
  const successfulFluxDeploy = fs.readFileSync(
    "./exampleMessages/exampleSuccessfulFluxDeploy.txt",
    { encoding: "utf8" }
  );

  await client.chat.postMessage({
    text: githubReleaseMessage,
    channel: command.channel_name,
  });
  await client.chat.postMessage({
    text: githubMessage,
    channel: command.channel_name,
  });
  await client.chat.postMessage({
    text: successfulFluxDeploy,
    channel: command.channel_name,
  });
});
/** When deployment messages are reacted to with an emoji teams receive messages in their channel */
app.event("reaction_added", async ({ event, client }) => {
  const reaction = event.reaction;
  const channel = event.item.channel;
  const ts = event.item.ts;

  // check that reaction is in the list of team reactions, if not return
  const team = getTeamFromReaction(reaction);
  if (!team) {
    return;
  }

  // Get all the data about message that was reacted to
  const conversationHistory = await client.conversations.history({
    channel: channel,
    oldest: ts,
    limit: 1,
    inclusive: true,
  });

  // Now just get the first message off that response
  let message;
  if (
    conversationHistory &&
    conversationHistory.messages &&
    conversationHistory.messages.length > 0
  ) {
    message = conversationHistory.messages[0];
  } else {
    return;
  }

  // Check that the message has a reaction that we care about
  let messageReactions;
  if (message.reactions) {
    messageReactions = message.reactions.find(
      (messageReaction) => messageReaction.name == reaction
    );
  } else {
    return;
  }

  // Check to see if it's the first time its been reacted to
  // there might be a race condition here but I don't think we can do anything about it
  if (messageReactions && messageReactions.count !== 1) {
    return;
  }

  // check that message is one of the messages we care about
  let parsed;
  if (message.text) {
    parsed = parseMessage(message.text);
  } else {
    return;
  }

  // format the message
  let formattedMessage;
  if (parsed) {
    formattedMessage = await formatSuccessMessage(client, {
      subscriberName: team,
      parsedMessage: parsed,
    });
  } else {
    return;
  }

  // send the success message to teams
  if (formattedMessage) {
    await client.chat.postMessage(formattedMessage);
  }
});
/** Subscribe a product team to a service */
app.command("/subscribe", async ({ command, ack, respond }) => {
  await ack();
  const { team, serviceName } = getTeamSubscriberData(command);

  if (Teams.hasOwnProperty(team)) {
    const addResult = addSubscription({
      subscriber: team,
      serviceName,
      subscriptionType: SubscriptionType.Team,
    });
    await respond(addResult);
  } else {
    await respond(`${team} is not a recognized product team. Cannot subscribe`);
  }
});
/** Unsubscribe a team from a service */
app.command("/unsubscribe", async ({ command, ack, respond }) => {
  await ack();
  const { team, serviceName } = getTeamSubscriberData(command);

  const removalResult = removeSubscription({
    subscriber: team,
    serviceName,
    subscriptionType: SubscriptionType.Team,
  });
  await respond(removalResult);
});
/** Subscribe a user to a service */
app.command("/subscribeme", async ({ command, ack, respond, client }) => {
  await ack();
  const { userId, serviceName } = getUserSubscriberData(command);
  const displayName = await client.users.profile
    .get({
      user: userId,
    })
    .then((userProfile) => userProfile.profile?.display_name);

  const addResult = addSubscription({
    subscriber: userId,
    serviceName,
    subscriptionType: SubscriptionType.User,
    userDisplayName: displayName,
  });
  await respond(addResult);
});
/** Unsubscribe a user from a service */
app.command("/unsubscribeme", async ({ command, ack, respond, client }) => {
  await ack();
  const { userId, serviceName } = getUserSubscriberData(command);
  const displayName = await client.users.profile
    .get({
      user: userId,
    })
    .then((userProfile) => userProfile.profile?.display_name);

  const removalResult = removeSubscription({
    subscriber: userId,
    serviceName,
    subscriptionType: SubscriptionType.User,
    userDisplayName: displayName,
  });
  await respond(removalResult);
});
/** List all subscriptions for a user or team */
app.command("/listsubscriptions", async ({ command, ack, respond, client }) => {
  await ack();
  const team = command.text.split(" ")[0].toLocaleLowerCase();
  const userId = command.user_id;
  if (team) {
    if (Teams.hasOwnProperty(team)) {
      const formattedMessage = await formatListMessage({
        subscriptionType: SubscriptionType.Team,
        userId,
        subscriberName: team,
      });
      await client.chat.postMessage(formattedMessage);
    } else {
      await respond(`${team} is not a recognized product team.`);
    }
  } else {
    const formattedMessage = await formatListMessage({
      subscriptionType: SubscriptionType.User,
      userId,
    });
    await client.chat.postMessage(formattedMessage);
  }
});
/** Successful helm release messages are the final indication of a successfully completed deploy. Listen for these messages and send updates to subscribers of that service  */
app.message(
  new RegExp("^helmrelease.*Helm upgrade succeeded", "s"),
  async ({ message, client }) => {
    let messageText;
    if ("text" in message && message.text) {
      messageText = message.text;
    } else {
      return;
    }

    const parsed = parseHelmMessage(messageText);
    if (!parsed) {
      return;
    }
    const subscriptions = [
      ...findRepoSubscribers(parsed.repo, SubscriptionType.Team),
      ...findRepoSubscribers(parsed.repo, SubscriptionType.User),
    ];

    for (const subscriber of subscriptions) {
      const formattedMessage = await formatSuccessMessage(client, {
        subscriberName: subscriber,
        parsedMessage: parsed,
      });
      if (formattedMessage) {
        await client.chat.postMessage(formattedMessage);
      }
    }
  }
);

// TODO These commands will be what we want to use with a database eventually. Saving data in this way will probably mean having to do some refactoring of the way we format messages
/** Running this command in a channel subscribes that channel to whatever services are passed in */
app.command("subscribechannel", async ({ command, ack, respond }) => {
  // Take in the channel name from the command
  // Ultimately we want to save the channelID, a name, the services, and the subscription type to a data base
  // Needs to accept multiple services
  // How do we want to save a name? Do we want to just use the channel name? Do we want to allow the user to set a name? We're saving the name so that it can be used in the congratulations message. If we use the channel name it'd read like "Congratulations pt-echo on your successful deploy of ${service}" This is because we're using the same logic that sends a message when a deploy has an emoji reaction to send a subscription message.
  // If successful, respond with a message that the entire channel can see with the outcome of what was subscribed to, and what was not if a subscription already existed
  // If entirely unsuccessful, respond with a message about what happened that only the user can see
});
/** Running this command in a channel unsubscribes that channel to whatever services are passed in */
app.command("unsubscribechannel", async ({ command, ack, respond }) => {
  // Must accept multiple services to unsubscribe from
  // If successful, respond with a message that the entire channel can see with the outcome of the command.
  // If entirely unsuccessful, respond with a message about what happened that only the user can see
});

(async () => {
  // Start your app
  await app.start(Number(process.env.PORT) || 3000);

  console.log("⚡️ Bolt app is running!");
})();
