import { SlashCommand } from "@slack/bolt";
import { Teams } from "../data/ProductTeams";

/**
 * Locates the team and service name from the subscribe/unsubscribe slash command. Also converts the text to lowercase to avoid case sensitivity issues.
 * @param command A Slack {@link SlashCommand}
 * @returns An object with the team and serviceName
 * @note We're only using the first service that is submitted at the moment
 * @todo Add support for subscribing to multiple services
 */
export const getTeamSubscriberData = (command: SlashCommand) => {
  const text = command.text;
  const team = text.split(" ")[0].toLocaleLowerCase();
  const serviceName = text.split(" ")[1].toLocaleLowerCase();
  return { team, serviceName };
};

/**
 * Locates the user id and service name from the subscribeme/unsubscribeme slash command. Also converts text to lowercase to avoid case sensitivity issues.
 * @param command A Slack {@link SlashCommand}
 * @returns An object with the userId and serviceName
 * @note We're only using the first service that is submitted at the moment
 * @todo Add support for subscribing to multiple services
 */
export const getUserSubscriberData = (command: SlashCommand) => {
  const userId = command.user_id;
  const serviceName = command.text.split(" ")[0].toLocaleLowerCase();
  return { userId, serviceName };
};
