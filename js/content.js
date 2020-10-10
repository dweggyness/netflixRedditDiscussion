
/*
Creates a string to be used with search engine
@param {string} name - name of the show, 'John Wick', 'Brooklyn Nine-Nine'
@param {string=} episode - season:episode, 'S02:E08', 'S1:E1'
@returns {string} A search string that can be used for search engines

@example
searchString = createSearchString('Brooklyn Nine-Nine', 'S3:E02')
// returns 'Brooklyn+Nine-Nine+Season+3+Episode+2'
searchString = createSearchString('John Wick', undefined)
// returns 'John+Wick'
*/
function createSearchString(name, episode) {
    searchString = name.trim().replace(/ /g, '+')
    if (episode) {
        seasonNum = parseInt(episode.substring(
            1,
            episode.lastIndexOf(":")
        ))
        episodeNum = parseInt(episode.substring(
            episode.lastIndexOf("E") + 1,
            episode.length
        ))
        searchString += `+Season+${seasonNum}+Episode+${episodeNum}`
    }
    return searchString
}

function addDisplay() {
    console.log('test')
}

function getMovieName() {
    // read the name, episode and season from netflix

    try {
        console.log('wa')
        name = document.getElementsByClassName('ellipsize-text')[0].getElementsByTagName('h4')[0].textContent;

        if (document.getElementsByClassName('ellipsize-text')[0].getElementsByTagName('span')) {
            episode = document.getElementsByClassName('ellipsize-text')[0].getElementsByTagName('span')[0].textContent
            return { name, episode }
        } else {
            return { name }
        }
    } catch(e) {
        console.log('catch')
        name = document.getElementsByClassName('pp-rating-title')[0].textContent;
        return { name }
    }
}

async function handleVideoEnd() {
    nameObj = getMovieName();
    searchString = createSearchString(nameObj.name, nameObj.episode)

    chrome.runtime.sendMessage(
        {message: "searchForRedditLink", query: searchString},
        links => {
            console.log(nameObj)
            console.log(links)
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