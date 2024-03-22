import { Message } from "./ParseMessage";
import { getGif } from "./GifPicker";
import {
  HeaderBlock,
  ImageBlock,
  Block,
  ChatPostMessageArguments,
  SectionBlock,
  WebClient,
  RichTextBlock,
  RichTextElement,
  RichTextSection,
} from "@slack/web-api";
import { Teams } from "../data/ProductTeams";
import { SubscriptionType, findSubscriptions } from "./Subscriptions";

/**
 * Formats data for a Slack message to be sent with client.chat.postMessage()
 * @param client A Slack {@link WebClient} object
 * @param params An object containing the subscriber name and parsed message
 * @returns A slack {@link ChatPostMessageArguments} object if the subscriber is a known team or user. Otherwise, undefined.
 */
export const formatSuccessMessage = async (
  client: WebClient,
  params: { subscriberName: string; parsedMessage: Message }
): Promise<ChatPostMessageArguments | undefined> => {
  const { parsedMessage, subscriberName } = params;
  const gif = getGif(subscriberName);

  const channelAndSubscriber = await getChannelAndSubscriber({
    client: client,
    subscriberName: subscriberName,
  });

  let channel: string;
  let subscriber: string;
  if (channelAndSubscriber) {
    ({ channel, subscriber } = channelAndSubscriber);
  } else {
    return;
  }

  const blocks = finalBlockBuilder({
    subscriberName: subscriber,
    parsedMessage: parsedMessage,
    image: gif,
    altText: `${subscriberName} gif`,
  });

  /** WARN log from Slack: It's a best practice to always provide a `text` argument when posting a message. The `text` is used in places where the content cannot be rendered such as: system push notifications, assistive technology such as screen readers, etc. */
  const text = `${parsedMessage.repo} was just updated with ${parsedMessage.revision} ${parsedMessage.githubLink} ${gif}`;

  return { text, channel, blocks };
};

/**
 * Gets the channel and subscriber name. In the case of a team subscriber, the channel name is prefixed with "pt-". In the case of a personal subscriber, the subscriber name is the display name.
 * @param params A subscriber name and slack {@link WebClient} object
 * @returns An object with the channel and subscriber name
 */
const getChannelAndSubscriber = async (params: {
  /** The product team or user */
  subscriberName: string;
  /** A slack {@link WebClient} object */
  client: WebClient;
}) => {
  const { subscriberName, client } = params;

  if (Teams.hasOwnProperty(subscriberName) && subscriberName !== "delta") {
    return {
      channel: `pt-${subscriberName}`,
      subscriber: subscriberName,
    };
  } else if (
    Teams.hasOwnProperty(subscriberName) &&
    subscriberName === "delta"
  ) {
    return {
      channel: `eso-${subscriberName}`,
      subscriber: subscriberName,
    };
  } else {
    const userDisplayName = await client.users.profile
      .get({
        user: subscriberName,
      })
      .then((userProfile) => userProfile.profile?.display_name);
    return {
      channel: subscriberName,
      subscriber: userDisplayName ?? "",
    };
  }
};

/**
 * Builds the final slack message blocks.
 * @param params A name, parsed message, gif url, and alt text
 * @returns An array of slack {@link Block} objects
 */
const finalBlockBuilder = (params: {
  /** A user or product team name receiving the message */
  subscriberName: string;
  /** A parsed {@link Message} object */
  parsedMessage: Message;
  /** A gif url */
  image: string;
  /** Alt text for image */
  altText: string;
}): Block[] => {
  const { subscriberName, parsedMessage, image, altText } = params;
  const blocks = new Array<Block>();
  blocks.push(
    headerBlockBuilder(subscriberName),
    buttonBlockBuilder(parsedMessage),
    imageBlockBuilder({ image: image, altText: altText })
  );
  return blocks;
};

/**
 * Builds a slack header block with the product team's name.
 * @param subscriberName Who's receiving the message. Either the name of the product team or user subscriber
 * @returns A slack {@link HeaderBlock} object
 */
const headerBlockBuilder = (subscriberName: string): HeaderBlock => {
  return {
    type: "header",
    text: {
      type: "plain_text",
      text: `Congratulations ${subscriberName}!`,
    },
  };
};

/**
 * Creates a section in the slack message with the repo and revision number and a button that links to changes in github.
 * @param parsedMessage A parsed {@link Message} object
 * @returns A slack {@link SectionBlock} object
 */
const buttonBlockBuilder = (parsedMessage: Message): SectionBlock => {
  const { repo, revision, githubLink } = parsedMessage;
  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `${repo}/${revision}`,
    },
    accessory: {
      type: "button",
      text: {
        type: "plain_text",
        text: "View changes",
      },
      value: "View changes",
      url: `${githubLink}`,
      action_id: "button-action",
    },
  };
};

/**
 * Builds a slack image block with the gif url and alt text.
 * @param params The image url and alt text
 * @returns A slack {@link ImageBlock} object
 */
const imageBlockBuilder = (params: {
  /** Image url */
  image: string;
  /** Alt text for image */
  altText: string;
}): ImageBlock => {
  const { image, altText } = params;
  return {
    type: "image",
    image_url: `${image}`,
    alt_text: `${altText}`,
  };
};

/**
 * Formats a Slack message with data about a subscriptions to send to the requesting user's direct messages
 * @param params An object containing the subscriber name, subscriber type, and user id
 * @returns A slack {@link ChatPostMessageArguments} object to be sent with client.chat.postMessage()
 */
export const formatListMessage = async (params: {
  /** The {@link SubscriptionType} the look up is for */
  subscriptionType: SubscriptionType;
  /** The user id of the user requesting the list */
  userId: string;
  /** The name of the subscriber to look up */
  subscriberName?: string;
}): Promise<ChatPostMessageArguments | undefined> => {
  const { subscriptionType, userId, subscriberName } = params;
  const subscriptions = findSubscriptions(
    subscriberName ?? userId,
    subscriptionType
  );
  const listBlock = listBlockBuilder({
    subscriptionList: subscriptions,
    subscriberName: subscriberName ?? "you",
  });
  /** WARN log from Slack: It's a best practice to always provide a `text` argument when posting a message. The `text` is used in places where the content cannot be rendered such as: system push notifications, assistive technology such as screen readers, etc. */
  const text = `Listing subscriptions for ${subscriberName ?? "you"}`;
  const channel = userId;

  return { text, channel, blocks: [listBlock] };
};

/**
 * Builds a slack list block with the subscriber's name and a list of their subscriptions.
 * @param params A list of service subscriptions and the subscriber name
 * @returns A slack {@link RichTextBlock} object
 */
const listBlockBuilder = (params: {
  /** An array of service subscriptions */
  subscriptionList: string[];
  /** The subscriber's name to be used in the message */
  subscriberName: string;
}): RichTextBlock => {
  const { subscriptionList, subscriberName } = params;
  const listElements = listElementBuilder(subscriptionList);
  return {
    type: "rich_text",
    elements: [
      {
        type: "rich_text_section",
        elements: [
          {
            type: "text",
            text: `Subscriptions for ${subscriberName}\n`,
          },
        ],
      },
      {
        type: "rich_text_list",
        style: "bullet",
        indent: 0,
        border: 0,
        elements: listElements,
      },
    ],
  };
};

/**
 * Wraps each service subscription in a slack {@link RichTextSection} object.
 * @param subscriptionList A list of service subscriptions
 * @returns An array of slack {@link RichTextSection} objects, one for each subscription
 */
const listElementBuilder = (subscriptionList: string[]): RichTextSection[] => {
  const listElements = new Array<RichTextSection>();

  for (let i = 0; i < subscriptionList.length; i++) {
    listElements.push({
      type: "rich_text_section",
      elements: [
        {
          type: "text",
          text: subscriptionList[i],
        },
      ],
    });
  }
  return listElements;
};
