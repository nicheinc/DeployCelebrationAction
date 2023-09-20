const findTeam = (repo) => {
  switch (repo) {
    case 'lead' || 'leadadmin' || 'salesforce':
      return 'foxtrot'
    case 'tracks' || 'website':
     return 'bravo'
    case 'inventory':
      return 'indigo'
    default:
      return 'Team not found for this repo'
  }
}
module.exports = { findTeam }
