chrome.runtime.onInstalled.addListener(function() {
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [ new chrome.declarativeContent.PageStateMatcher({
					pageUrl: { urlMatches: 'www.nutaku.net/games/kamihime-r/play/'},
				})
			],
			actions: [ new chrome.declarativeContent.ShowPageAction() ]
		}]);
	});
});