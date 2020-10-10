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

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message == "searchForRedditLink") {
      var url = `https://www.startpage.com/sp/search?q=${request.query}+discussion+site%3Areddit.com`
      fetch(url)
        .then(response => response.text())
        .then(data => {
          let parser = new DOMParser();
          let document2 = parser.parseFromString(data, "text/html")
          
          alert(`https://www.startpage.com/sp/search?q=${request.query}+discussion+site%3Areddit.com`)
          /*
            ideal response: [
              { title, link, score },
              ...
            ]
          */
          sendResponse(document2.getElementsByClassName('w-gl__result-url')[0].href)
        })
      return true;  // Will respond asynchronously.
  }
});