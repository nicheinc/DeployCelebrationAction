/**
 * A Slack emoji and the team associated with it.
 * TODO: have ways to update this from Slack
 */
const emojiReactions: { [key: string]: string } = {
  alf: "alpha",
  bravocue: "bravo",
  charlie: "charlie",
  delta: "delta",
  echo: "echo",
  "team-foxtrot": "foxtrot",
  "clappy-hands": "golf",
  "pt-hotel": "hotel",
  "team-indigo-alt": "indigo",
};

/**
 * Find which team a message reaction is associated with.
 * @param reaction An emoji represented by its text name
 * @returns a string representing the team that the emoji is associated with
 */
export const getTeamFromReaction = (reaction: string) => {
  if (Object.keys(emojiReactions).find((key) => key === reaction)) {
    const foundReaction = Object.keys(emojiReactions).find(
      (key) => key === reaction
    );
    return emojiReactions[foundReaction!];
  }
};
