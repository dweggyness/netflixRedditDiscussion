
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

function addDisplay(listOfPosts) {
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

function getMovieName() {
    // read the name, episode and season from netflix

    try {
        name = document.getElementsByClassName('ellipsize-text')[0].querySelector('h4').textContent;

        if (document.getElementsByClassName('ellipsize-text')[0].getElementsByTagName('span')) {
            episode = document.getElementsByClassName('ellipsize-text')[0].getElementsByTagName('span')[0].textContent
            return { name, episode }
        } else {
            return { name }
        }
    } catch(e) {
        name = document.getElementsByClassName('pp-rating-title')[0].textContent;
        return { name }
    }
}

async function handleVideoEnd() {
    nameObj = getMovieName();
    searchString = createSearchString(nameObj.name, nameObj.episode)

    chrome.runtime.sendMessage(
        {message: "searchForRedditLink", query: searchString},
        listOfPosts => {
            addDisplay(listOfPosts)
        }
    );

}

// some code to call 'addDisplay' when episode ends
MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var target = document.querySelector("#appMountPoint");

// ['SeamlessControls--container', 'PromotedVideo-actions']

var observer = new MutationObserver(function(mutations, observer) {
    mutation = mutations.find(mutation => {
        var classes = [ ...mutation.target.classList ];
        // console.log(classes.some(x => x === 'SeamlessControls--container' || x === 'PromotedVideo-actions'))
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