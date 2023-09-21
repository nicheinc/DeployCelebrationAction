const fs = require('fs');

/** Checks if the teamSubscriptions.json file exists. If it does not creates it if not*/
const getSubscriptions = () => {
  if(!fs.existsSync('./src/teamSubscriptions.json')){
    fs.writeFileSync('./src/teamSubscriptions.json', JSON.stringify({}));
  }
  const teamSubscriptions = JSON.parse(fs.readFileSync('./src/teamSubscriptions.json', { encoding: 'utf8'}));
  console.log(teamSubscriptions);
  return teamSubscriptions;
}

/**
 * if the channel key is there add the service to the array
 * else add the channel key and have the value be an array with the service as a string
*/
const addSubscription = (channel, serviceName) => {  
  const teamSubscriptions = getSubscriptions();
    if(teamSubscriptions[channel]){
    teamSubscriptions[channel].push(serviceName);
    fs.writeFileSync('./src/teamSubscriptions.json', JSON.stringify(teamSubscriptions));
  }
  else{
    teamSubscriptions[channel] = [serviceName];
      fs.writeFileSync('./src/teamSubscriptions.json', JSON.stringify(teamSubscriptions));
  }
  console.log(teamSubscriptions);
}

/**
 * Given a repo name return an array of channels that are subscribed to that 
 * repo
 */
const findSubscriptions = (repo) => {
  const subscriptions = getSubscriptions();
  const teams = [];
  for (const channel in subscriptions) {
    if (subscriptions[channel].includes(repo)) {
      teams.push(channel);
    }
  }
  return teams;
}

module.exports = {addSubscription, findSubscriptions};
