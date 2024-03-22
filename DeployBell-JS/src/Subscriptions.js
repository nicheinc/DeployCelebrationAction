const fs = require('fs');

/** 
 * Checks if the teamSubscriptions.json file exists. If it does not creates it 
 * if not 
 * @returns the contents of the file
 * @param subscriptionType: Valid types are a string 'user' or 'team'
 */
const getSubscriptions = (subscriptionType) => {
  try {
    if(!fs.existsSync(`./data/${subscriptionType}Subscriptions.json`)){
      fs.writeFileSync(`./data/${subscriptionType}Subscriptions.json`, JSON.stringify({}));
    }
    const subscriptions = JSON.parse(fs.readFileSync(`./data/${subscriptionType}Subscriptions.json`, { encoding: 'utf8'}));
    //console.log(subscriptions);
    return subscriptions;
  } catch (error) {
    console.log('getSubscriptions() Error: ', error);
  }
}

/**
 * if the channel key is there add the service to the array
 * else add the channel key and have the value be an array with the service as a string
 * @param subscriptionType: Valid types are a string 'user' or 'team'
*/
const addSubscription = (channel, serviceName, subscriptionType) => { 
  const service = serviceName.toLowerCase(); 
  const teamSubscriptions = getSubscriptions(subscriptionType);
    if(teamSubscriptions[channel]){
    teamSubscriptions[channel].push(service);
    fs.writeFileSync(`./data/${subscriptionType}Subscriptions.json`, JSON.stringify(teamSubscriptions));
  }
  else{
    teamSubscriptions[channel] = [service];
      fs.writeFileSync(`./data/${subscriptionType}Subscriptions.json`, JSON.stringify(teamSubscriptions));
  }
  //console.log(teamSubscriptions);
}

/**
 * @param subscriptionType: Valid types are a string 'user' or 'team'
 */
const removeSubscription = (subscriber, serviceName, subscriptionType) => {
  const service = serviceName.toLowerCase(); 
  const subscriptions = getSubscriptions(subscriptionType);

  if(subscriptions[subscriber]){
    const repoIndex = subscriptions[subscriber].indexOf(service)
    if(repoIndex > -1){
    subscriptions[subscriber].splice(repoIndex, 1)    
    fs.writeFileSync(`./data/${subscriptionType}Subscriptions.json`, JSON.stringify(subscriptions));
    return `$Successfully unsubscribed from ${service} deploys`
  } else {
    return `A deploy subscription to the ${service} service was no found`
  };
  } else{
    return `There are no deploy subscriptions for requested subscriber`
  }
}

/**
 * Given a repo name return an array of channels that are subscribed to that 
 * repo
 * @param subscriptionType: Valid types are a string 'user' or 'team'
 */
const findSubscriptions = (repo, subscriptionType) => {
  const subscriptions = getSubscriptions(subscriptionType);
  //console.log(subscriptions);
  const subscribers = [];
  for (const subscriber in subscriptions) {
    if (subscriptions[subscriber].includes(repo)) {
      subscribers.push(subscriber);
    }
  }
  //console.log(subscribers);
  return subscribers;
}

module.exports = {addSubscription, findSubscriptions, removeSubscription};
