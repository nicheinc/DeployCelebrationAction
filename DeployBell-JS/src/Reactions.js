const reactions = {
    'bravocue': { team: 'bravo'},
    'team-foxtrot': { team: 'foxtrot'},
    'team-indigo-alt': { team: 'indigo'},
    'echo': { team: 'echo'}
}

const getTeamFromReaction = (team) => {
    return reactions[team]?.team;
}

module.exports = { reactions, getTeamFromReaction };