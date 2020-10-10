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
      var url = `https://html.duckduckgo.com/html/?q=${request.query}+site%3Areddit.com`
      fetch(url)
        .then(response => response.text())
        .then(data => {
          let parser = new DOMParser();
          let document2 = parser.parseFromString(data, "text/html")

          sendResponse(document2.getElementsByClassName('result__snippet')[0].href)
        })
      return true;  // Will respond asynchronously.
  }
});