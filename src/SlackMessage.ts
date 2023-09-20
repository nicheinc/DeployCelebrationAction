import { Team } from "./GifPicker"

const blockHeaderBuilder = (team:Team):any => {
  return{  
  type: "header",
		text: {
			type: "plain_text",
			text: `Congratulations ${team}!`
    }
  }
}

const blockButtonBuilder = (params:{repoName:string, releaseNum:string, releaseURL:string}) => {
const {repoName, releaseNum, releaseURL} = params  
    return{
			type: "section",
			text: {
				type: "mrkdwn",
				text: `${repoName}/${releaseNum}`
			},
			accessory: {
				type: "button",
				text: {
					type: "plain_text",
					text: "View changes"
				},
				value: "View changes",
				url: `${releaseURL}`,
				action_id: "button-action"
			}	
  }
}

const blockImageBuilder = (params:{image:string, altText:string}) => {
const {image, altText} = params
  return{
			type: "image",
			image_url: `${image}`,
			alt_text: `${altText}`
  }
}

export const finalBlockBuilder = (params:{team:Team, repoName:string, releaseNum:string, releaseURL:string, image:string, altText:string}) => {
	const {team, repoName, releaseNum, releaseURL, image, altText} = params
	let blocks = new Array<any>()
	blocks.push(blockHeaderBuilder(team), blockButtonBuilder({repoName:repoName, releaseNum:releaseNum, releaseURL:releaseURL}), blockImageBuilder({image:image, altText:altText}))
	return blocks
}