
/*
Gets the permalink part of a reddit post ( used to call reddit api )
@param {string} url - url to a reddit post
@returns {string} permalink part of reddit post

@example
getRedditPostIDFromUrl(https://www.reddit.com/r/redditdev/comments/c93rdt/how_do_i_get_json_data_of_a_specific_post_without/)
// returns 'c93rdt'
*/
function getRedditPostIDFromURL(url) {
  startingIndexOfID = url.lastIndexOf("comments/") + 8
  id = url.substring(
    startingIndexOfID + 1,
    startingIndexOfID + 7
  )

  return id
}

/*
Gets post information for each item in a list of reddit urls 
@type {Post} - {
    title: title of post
    score: reddit score
    url: link to the thread
    comments: num of comments
}
@param {string[]} url - list of urls to reddit posts
@returns {Posts[]} list of objects of reddit posts

@example
getRedditPosts([https://www.reddit.com/r/witcher/comments/ed6wtj/episode_discussion_s01e07_before_a_fall/])
// returns [{
    title: 'Episode Discussion - S01E07: Before A Fall'
    score: 520
    url: 'https://www.reddit.com/r/witcher/comments/ed6wtj/episode_discussion_s01e07_before_a_fall/'
    comments: 967
}]
*/
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

/*
Given a query to search for, attempts to find three discussion threads on reddit.com
@type {Post} - {
    title: title of post
    score: reddit score
    url: link to the thread
    comments: num of comments
}
@param {string} query - query to search for, will be appended with "+discussion+site:reddit.com"
@returns {Posts[]} list of objects of reddit posts

@example
searchForRedditLinks('The+Witcher+Season+1+Episode+7')
// returns [{
    title: 'Episode Discussion - S01E07: Before A Fall'
    score: 520
    url: 'https://www.reddit.com/r/witcher/comments/ed6wtj/episode_discussion_s01e07_before_a_fall/'
    comments: 967
  },
  ... two more such objects
]
*/
async function searchForRedditLinks(query) {
  var url = `https://www.startpage.com/sp/search?q=${query}+discussion+site%3Areddit.com`
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
    if (request.message == "searchForRedditLinks") {
      const payload = async () => {
        const response = await searchForRedditLinks(request.query);
        sendResponse(response);
      }
      payload()
      return true;
  }
});