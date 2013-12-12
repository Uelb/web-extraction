chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript({
    file: 'vendor/underscore.js'
  });
  chrome.tabs.executeScript({
    file: 'vendor/backbone.js'
  });
  chrome.tabs.executeScript({
    file: 'vendor/jquery.js'
  });
  chrome.tabs.executeScript({
    file: 'src/utils.js'
  });
  chrome.tabs.executeScript({
    file: 'src/boxGroup.js'
  });
  chrome.tabs.executeScript({
    file: 'src/launcher.js'
  });
});