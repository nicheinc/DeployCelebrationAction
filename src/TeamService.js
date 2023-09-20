const findTeam = (repo) => {
  switch (repo) {
    case 'lead':
    case 'leadadmin':
    case 'salesforce':
      return 'foxtrot'
    case 'tracks':
    case 'website':
     return 'bravo'
    case 'inventory':
      return 'indigo'
    default:
      return 'Team not found for this repo'
  }
}
module.exports = { findTeam }
