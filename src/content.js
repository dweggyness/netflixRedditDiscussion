
/*
Creates a string to be used with search engine
@param {string} name - name of the show, 'John Wick', 'Brooklyn Nine-Nine'
@param {string=} episode - season:episode, 'S02:E08', 'S1:E1'
@returns {string} A search string that can be used for search engines

@example
searchString = createSearchString('Brooklyn Nine-Nine', 'S3:E02')
// returns 'Brooklyn+Nine-Nine+Season+3+Episode+2'
searchString = createSearchString('John Wick', undefined)
// returns 'John+Wick+movie'
*/
function createSearchString(name, episode) {
    searchString = name.trim().replace(/ /g, '+')
    if (episode) {
        seasonNum = parseInt(episode.substring(
            1,
            episode.lastIndexOf(":")
        ))
        episodeNum = parseInt(episode.substring(
            episode.lastIndexOf(":") + 2,
            episode.length
        ))
        searchString += `+Season+${seasonNum}+Episode+${episodeNum}`
    } else {
        searchString += '+movie'
    }
    return searchString
}

/*
Creates a box on the screen that shows clickable links to discussion threads on the show
@type {Post} - {
    title: title of post
    score: reddit score
    url: link to the thread
    comments: num of comments
}
@param {Post[]} posts - List of post objects
@returns None

@example
listOfPosts = [{ 
    title: 'Episode Discussion - S01E07: Before A Fall'
    score: 520
    url: 'https://www.reddit.com/r/witcher/comments/ed6wtj/episode_discussion_s01e07_before_a_fall/'
    comments: 967
}]
displayRedditThreads(listOfPosts)
*/
function displayRedditThreads(listOfPosts) {
    const container = document.getElementsByClassName('SeamlessControls--container')[0] 
        || document.getElementsByClassName('OriginalsPostPlay-BackgroundTrailer')[0]

    const mainElement = document.createElement('section');
    mainElement.id = 'netflixttContainer'
    listOfPosts.forEach(post => {
        const postContainer = document.createElement('div');
        postContainer.className = 'postContainer';

        const postScore = document.createElement('div');
        postScore.className = 'postScore';

        const score = document.createElement('h3');
        const comments = document.createElement('span');
        score.textContent = post.score
        comments.textContent = `${post.comments} comments`

        const postDetails = document.createElement('div');
        postDetails.className = 'postDetails';

        const postTitle = document.createElement('a');
        const postLink = document.createElement('span');
        postLink.className = 'postLink';
        postLink.textContent = post.url.replace('https://www.', '');
        postTitle.className = 'postTitle';
        postTitle.href = post.url;
        postTitle.target = "_blank"
        postTitle.rel = "noopener noreferrer"
        postTitle.textContent = post.title;

        postDetails.appendChild(postTitle)
        postDetails.appendChild(postLink)
        postScore.appendChild(score)
        postScore.appendChild(comments)
        postContainer.appendChild(postScore)
        postContainer.appendChild(postDetails)

        mainElement.appendChild(postContainer)
    })

    if (!document.getElementById('redditLinks')) {
        container.appendChild(mainElement)
    }
}

/*
Gets the movie/show name and episode (if available) from the HTML of netflix
@type {Object} - object containing the movie name and potentially the episode
@returns {string} A search string that can be used for search engines

@example
// for movie
getMovieDetails() // returns { name: 'John Wick' }
// for show
getMovieDetails() // returns { name: 'Brooklyn Nine-Nine', episode: 'S1:E03' }
*/
function getMovieName() {
    try { // for show
        name = document.getElementsByClassName('ellipsize-text')[0].querySelector('h4').textContent;

        if (document.getElementsByClassName('ellipsize-text')[0].getElementsByTagName('span')) {
            episode = document.getElementsByClassName('ellipsize-text')[0].getElementsByTagName('span')[0].textContent
            return { name, episode }
        } else {
            return { name }
        }
    } catch(e) { // title for movie has a different className
        name = document.getElementsByClassName('pp-rating-title')[0].textContent;
        return { name }
    }
}

async function handleVideoEnd() {
    nameObj = getMovieName();
    searchString = createSearchString(nameObj.name, nameObj.episode)

    chrome.runtime.sendMessage(
        {message: "searchForRedditLinks", query: searchString},
        listOfPosts => {
            displayRedditThreads(listOfPosts)
        }
    );

}

// used to detect when the show/movie has ended.
MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var target = document.querySelector("#appMountPoint");

var observer = new MutationObserver(function(mutations, observer) {
    mutation = mutations.find(mutation => {
        var classes = [ ...mutation.target.classList ];
        // watches the classes that change when episode/movie ends
        // SeamlessControls--container if there is next episode, postplay if there is a trailer
        return classes.some(x => x === 'SeamlessControls--container' || x === 'postplay');
    })

    if (mutation) {
        handleVideoEnd()
    }
})

observer.observe(target, {
    subtree: true,
    attributes: true,
})