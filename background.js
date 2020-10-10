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

// given a list of reddit URLs, returns a list of objects containing the title and score of the post
async function getRedditPosts(listOfUrls) {
  let queryString = ''
  listOfUrls.forEach(url => {
    const permaLinkID = getRedditPostIDFromURL(url)
    if (queryString) queryString += ',' // add comma separator if there are already other items
    queryString += `t3_${permaLinkID}`
  })

  const queryURL = `https://api.reddit.com/api/info/?id=${queryString}`
  const response = await fetch(queryURL)
  const jsonData = await response.json()

  responseList = []
  const posts = jsonData.data.children
  posts.forEach(post => {
    const { url, title, score, num_comments: comments } = post.data
    responseList.push({ url, title, score, comments })
  })

  console.log('posts', posts)

  return responseList
}

async function searchForRedditLink(request) {
  var url = `https://www.startpage.com/sp/search?q=${request.query}+discussion+site%3Areddit.com`
  const response = await fetch(url)
  const startPageHTML = await response.text()
  
  let parser = new DOMParser();
  let document2 = parser.parseFromString(startPageHTML, "text/html");

  topThreeResults = []
  // list of results, we iterate through it and put in the top 3 that 
  results = document2.getElementsByClassName('w-gl__result-url');
  for (let i = 0; i < 3; i++) {
    topThreeResults.push(results[i].href)
  }


  listOfRedditPosts = await getRedditPosts(topThreeResults)

  return listOfRedditPosts
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