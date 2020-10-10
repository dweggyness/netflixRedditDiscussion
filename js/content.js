function createSearchString(name, episode) {
    searchString = name.replace(/ /g, '+')
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
            console.log(searchString)
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