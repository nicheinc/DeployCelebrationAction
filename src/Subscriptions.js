const fs = require('fs');

/** Checks if the teamSubscriptions.json file exists. If it does not creates it if not*/
const getSubscriptions = () => {
  if(!fs.existsSync('./data/teamSubscriptions.json')){
    fs.writeFileSync('./data/teamSubscriptions.json', JSON.stringify({}));
  }
  const teamSubscriptions = JSON.parse(fs.readFileSync('./data/teamSubscriptions.json', { encoding: 'utf8'}));
  console.log(teamSubscriptions);
  return teamSubscriptions;
}

/**
 * if the channel key is there add the service to the array
 * else add the channel key and have the value be an array with the service as a string
*/
const addSubscription = (channel, serviceName) => { 
  const service = serviceName.toLowerCase(); 
  const teamSubscriptions = getSubscriptions();
    if(teamSubscriptions[channel]){
    teamSubscriptions[channel].push(service);
    fs.writeFileSync('./data/teamSubscriptions.json', JSON.stringify(teamSubscriptions));
  }
  else{
    teamSubscriptions[channel] = [service];
      fs.writeFileSync('./data/teamSubscriptions.json', JSON.stringify(teamSubscriptions));
  }
  console.log(teamSubscriptions);
}

const removeSubscription = (channel, serviceName) => {
  const service = serviceName.toLowerCase(); 
  const teamSubscriptions = getSubscriptions();
  console.log(teamSubscriptions);
  
  if(teamSubscriptions[channel]){
     const repoIndex = teamSubscriptions[channel].indexOf(service)
     console.log(repoIndex);
    if(repoIndex > -1){
    teamSubscriptions[channel].splice(repoIndex, 1)    
    fs.writeFileSync('./data/teamSubscriptions.json', JSON.stringify(teamSubscriptions));
    console.log(teamSubscriptions);
  } else {
    console.log('Service not found');
  };
  } else{
    console.log('channel does not exist');
  }
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

module.exports = {addSubscription, findSubscriptions, removeSubscription};
