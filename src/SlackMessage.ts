const blockHeaderBuilder = () => {
  return{  
  type: "header",
		text: {
			type: "plain_text",
			text: "Congratulations!"
    }
  }
}

const blockButtonBuilder = (params:{repoName:string, releaseNum:string, releaseURL:string}) => {
const {repoName, releaseNum, releaseURL} = params  
    return{
			type: "section",
			text: {
				type: "mrkdwn",
				text: "View deploy changes"
			},
			accessory: {
				type: "button",
				text: {
					type: "plain_text",
					text: `${repoName}/${releaseNum}`
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

const finalBlockBuilder = (params:{repoName:string, releaseNum:string, releaseURL:string, image:string, altText:string}) => {
const {repoName, releaseNum, releaseURL, image, altText} = params
let blocks = []
blocks.push(blockHeaderBuilder(), blockButtonBuilder({repoName:repoName, releaseNum:releaseNum, releaseURL:releaseURL}), blockImageBuilder({image:image, altText:altText}))
return blocks
}