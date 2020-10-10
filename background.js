chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'www.netflix.com'},
        })
      ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

// given post id, c93rdt,
function getRedditPostIDFromURL(url) {
  startingIndexOfID = url.lastIndexOf("comments/") + 8
  id = url.substring(
    startingIndexOfID + 1,
    startingIndexOfID + 7
  )

  return id
}

// given reddit post url, returns the title and score of the post
async function getRedditPostTitleAndScore(url) {
  const permaLinkID = getRedditPostIDFromURL(url);
  const queryURL = `https://api.reddit.com/api/info/?id=t3_${permaLinkID}`
  const response = await fetch(queryURL)
  const jsonData = await response.json()

  const postData = jsonData.data.children[0].data
  const { title, score } = postData

  return { title, score }
}

async function searchForRedditLink(request) {
  var url = `https://www.startpage.com/sp/search?q=${request.query}+discussion+site%3Areddit.com`
  const response = await fetch(url)
  const startPageHTML = await response.text()
  
  let parser = new DOMParser();
  let document2 = parser.parseFromString(startPageHTML, "text/html");
  
  alert(`https://www.startpage.com/sp/search?q=${request.query}+discussion+site%3Areddit.com`)

  link = document2.getElementsByClassName('w-gl__result-url')[0].href;

  linkDetails = await getRedditPostTitleAndScore(link)

  responseObj = { link, title: linkDetails.title, score: linkDetails.score }
  return responseObj
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message == "searchForRedditLink") {
      const payload = async () => {
        const response = await searchForRedditLink(request);
        sendResponse(response);
      }
      payload()
      return true;
  }
});