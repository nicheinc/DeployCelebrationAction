const reactions = {
    'white_check_mark': { team: 'bravo'},
    'heart': { team: 'foxtrot'}
}

const getTeamFromReaction = (team) => {
    return reactions[team]?.team;
}

module.exports = { reactions, getTeamFromReaction };