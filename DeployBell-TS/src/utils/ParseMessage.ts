/**
 * An interface representing the important information from an automatic Flux or Github message posted to the deploy channel
 * @member revision App version
 * @member repo What repo the message is about
 * @member githubLink A link to changes in github
 */
export interface Message {
  /** App version */
  revision: string;
  /** What repo the message is about */
  repo: string;
  /** A link to changes in github */
  githubLink: string;
}

/**
 * Parses a helm message.
 * @param message a string that contains a helm message
 * @returns A {@link Message} if one can be parsed
 */
export const parseHelmMessage = (message: string): Message | undefined => {
  const revisionMatch = message.match(new RegExp("revision\n(.*)\nsummary"));
  const repoMatch = message.match(new RegExp("^helmrelease/(.*).default"));

  if (revisionMatch && repoMatch) {
    const revision: string = revisionMatch[1];
    const repo: string = repoMatch[1];
    const githubLink: string = `https://github.com/nicheinc/${repo}/releases/tag/helm-chart-${revision}`;
    return {
      revision,
      repo,
      githubLink,
    };
  }
};

/**
 * Takes a message from Slack and sends it through several parsers.
 * - {@link parseGitHubReleaseMessage()}
 * - {@link parseGitHubMessage()}
 * - {@link parseHelmMessage()}
 * @param message A string that contains a message from github or flux that we want to parse
 * @returns A {@link Message} object if one can be parsed, otherwise undefined
 */
export const parseMessage = (message: string): Message | undefined => {
  const parsers = [
    parseGitHubReleaseMessage,
    parseGitHubMessage,
    parseHelmMessage,
  ];
  let parsedMessage;
  for (const parser of parsers) {
    parsedMessage = parser(message);
    if (parsedMessage) {
      return parsedMessage;
    }
  }
};

/**
 * Parses a github release message.
 * @param message a string that contains a github release message
 * @returns A {@link Message} if one can be parsed
 */
const parseGitHubReleaseMessage = (message: string): Message | undefined => {
  const matches = message.match(new RegExp("^GitHub has promoted (.*):(.*)\n"));

  if (matches) {
    const repo: string = matches[1];
    const revision: string = matches[2];
    const githubLink: string = `https://github.com/nicheinc/${repo}/releases/tag/${revision}`;
    return {
      revision,
      repo,
      githubLink,
    };
  }
};

/**
 * Parses a github build message.
 * @param message a string that contains a github message
 * @returns A {@link Message github message object} or empty object if one cannot be parsed
 */
const parseGitHubMessage = (message: string): Message | undefined => {
  const matches = message.match(new RegExp("^GitHub has built (.*):(.*)\n"));
  if (matches) {
    const repo: string = matches[1];
    const revision: string = matches[2];
    const githubLink: string = `https://github.com/nicheinc/${repo}/releases/tag/${revision}`;
    return {
      revision,
      repo,
      githubLink,
    };
  }
};
