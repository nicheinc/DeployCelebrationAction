import fs from "fs";
import path from "path";

/**
 * The kind of Slack user that can be subscribed to a service
 * @property {string} User - A single user
 * @property {string} Team - A product team with a Slack channel
 */
export enum SubscriptionType {
  User = "user",
  Team = "team",
}

/**
 * Finds all subscriptions for a given subscriber
 * @param subscriber A Slack user or team channel to find subscriptions for
 * @param subscriptionType A {@link SubscriptionType}
 * @returns An array of services that the subscriber is subscribed to
 */
export const findSubscriptions = (
  subscriber: string,
  subscriptionType: SubscriptionType
) => {
  const subscriptions = getAllSubscriptions(subscriptionType);
  let repos = [];
  for (const entry in subscriptions) {
    if (entry === subscriber) {
      repos = subscriptions[subscriber];
    }
  }
  return repos;
};

/**
 * An object that represents important details for subscriptions
 * @property {string} subscriber - The Slack user or team channel to subscribe
 * @property {string} serviceName - The name of the service to subscribe to
 * @property {SubscriptionType} subscriptionType - The {@link SubscriptionType}
 * @property {string} userDisplayName - (Optional) The display name of the user
 */
interface Subscription {
  /** The Slack user or team channel to subscribe */
  subscriber: string;
  /** The name of the service to subscribe to */
  serviceName: string;
  /** The {@link SubscriptionType} */
  subscriptionType: SubscriptionType;
  /** (Optional) The display name of the user */
  userDisplayName?: string;
}

/**
 * Adds a subscription to the subscriptions file for a team or user
 * @param subscriptionInfo A {@link Subscription} object.
 * @returns A message about the success or failure of the addition that can be displayed to the user
 * @todo Add support for subscribing to multiple services
 */
export const addSubscription = (subscriptionInfo: Subscription) => {
  const { subscriber, serviceName, subscriptionType } = subscriptionInfo;
  const filePath = path.resolve(__dirname, "../../src/data");

  const subscriptions = getAllSubscriptions(subscriptionType, true);
  if (subscriptions[subscriber]) {
    if (!subscriptions[subscriber].includes(serviceName)) {
      subscriptions[subscriber].push(serviceName);
    } else {
      return `You are already subscribed to ${serviceName} deploys`;
    }
    try {
      fs.writeFileSync(
        `${filePath}/${subscriptionType}Subscriptions.json`,
        JSON.stringify(subscriptions)
      );
    } catch (error) {
      console.error(
        "An error occurred while trying to write subscription to file: ",
        error
      );
      return `An error occurred while trying to save subscription`;
    }
  } else {
    subscriptions[subscriber] = [serviceName];
    try {
      fs.writeFileSync(
        `${filePath}/${subscriptionType}Subscriptions.json`,
        JSON.stringify(subscriptions)
      );
    } catch (error) {
      console.error(
        "An error occurred while trying to write subscription to file: ",
        error
      );
      return `An error occurred while trying to save subscription`;
    }
  }

  return successfulSubscriptionMessage(subscriptionInfo);
};

/**
 * Given a repo name return an array of subscribers
 * @param repo The name of the repo to find subscribers for
 * @param subscriptionType Valid types are a string 'user' or 'team'
 */
export const findRepoSubscribers = (
  repo: string,
  subscriptionType: SubscriptionType
) => {
  const subscriptions = getAllSubscriptions(subscriptionType);

  const subscribers = [];
  for (const subscriber in subscriptions) {
    if (subscriptions[subscriber].includes(repo)) {
      subscribers.push(subscriber);
    }
  }
  return subscribers;
};

/**
 * Removes a subscription from the subscriptions file for a team or user
 * @param subscriptionInfo A {@link Subscription} object.
 * @returns A message about the success or failure of the removal that can be displayed to the user
 * @todo Add support for removing subscription to multiple services
 */
export const removeSubscription = (subscriptionInfo: Subscription) => {
  const { subscriber, serviceName, subscriptionType, userDisplayName } =
    subscriptionInfo;
  const subscriptions = getAllSubscriptions(subscriptionType);
  const filePath = path.resolve(__dirname, "../../src/data");

  if (subscriptions[subscriber]) {
    const repoIndex = subscriptions[subscriber].indexOf(serviceName);
    if (repoIndex > -1) {
      subscriptions[subscriber].splice(repoIndex, 1);
      try {
        fs.writeFileSync(
          `${filePath}/${subscriptionType}Subscriptions.json`,
          JSON.stringify(subscriptions)
        );
      } catch (error) {
        console.error(
          "An error occurred while trying to write subscription removal to file: ",
          error
        );
        return `An error occurred while trying to remove subscription`;
      }
      return successfulSubscriptionMessage(subscriptionInfo, true);
    } else {
      return `A deploy subscription to the ${serviceName} service was no found`;
    }
  } else {
    // If the subscriber is not found return a message
    return `There are no deploy subscriptions for requested subscriber`;
  }
};

/**
 * Checks if a subscription file exists (will create one if not) and returns the contents
 * @param subscriptionType A {@link SubscriptionType}
 * @param createFile A boolean indicating if the file should be created if it does not exist. Assumed false by default
 * @returns the contents of the file as an object
 */
const getAllSubscriptions = (
  subscriptionType: SubscriptionType,
  createFile?: boolean
) => {
  createFile = createFile || false;
  const filePath = path.resolve(__dirname, "../../src/data");
  try {
    if (
      !fs.existsSync(`${filePath}/${subscriptionType}Subscriptions.json`) &&
      createFile
    ) {
      fs.writeFileSync(
        `${filePath}/${subscriptionType}Subscriptions.json`,
        JSON.stringify({})
      );
      return JSON.parse(
        fs.readFileSync(`${filePath}/${subscriptionType}Subscriptions.json`, {
          encoding: "utf8",
        })
      );
    } else if (
      fs.existsSync(`${filePath}/${subscriptionType}Subscriptions.json`)
    ) {
      return JSON.parse(
        fs.readFileSync(`${filePath}/${subscriptionType}Subscriptions.json`, {
          encoding: "utf8",
        })
      );
    }
  } catch (error) {
    console.error("getAllSubscriptions() Error: ", error);
  }
};

/**
 * Builds a message about the successful addition or removal of a subscription that can be displayed to the user about themselves or a team
 * @param subscriptionInfo A {@link Subscription} object.
 * @param remove A boolean indicating if the subscription is being added or removed. Assumed false by default
 * @returns A message about the success of the addition or removal that can be displayed to the user
 */
const successfulSubscriptionMessage = (
  subscriptionInfo: Subscription,
  remove?: boolean
) => {
  const { subscriber, serviceName, subscriptionType, userDisplayName } =
    subscriptionInfo;
  const action = remove ? "unsubscribed from" : "subscribed to";
  if (subscriptionType === SubscriptionType.Team) {
    return `${subscriber} ${action} ${serviceName} deploys`;
  } else if (userDisplayName && subscriptionType === SubscriptionType.User) {
    return `You ${action} ${serviceName} deploys`;
  } else {
    return `${action} ${serviceName} deploys`;
  }
};
