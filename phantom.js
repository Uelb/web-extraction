var SSQL, figue, getPageResult, getPageResultNext, http, init, level, phantom, processData, quit, request, sendResult;

phantom = require('phantom');

http = require('http');

SSQL = require('./lib/ssql.js');

figue = require('./vendor/figue.js');

request = require('request');

level = 2;

console.old_log = console.log;

console.log = function() {};

quit = function(message, resultCode) {
  console.log(message);
  return process.exit(resultCode);
};

getPageResult = function(page, url) {
  page.open(url, function(status) {
    page.injectJs("lib/launcher.js");
    page.injectJs("vendor/jquery.js");
    page.injectJs("vendor/jquery-ui.custom.min.js");
    page.injectJs("vendor/underscore.js");
    page.injectJs("vendor/pjscrape_client.js");
    page.injectJs("lib/ui.js");
    setTimeout(function() {
      return getPageResultNext(page);
    }, 1000);
  });
};

getPageResultNext = function(page) {
  return page.evaluate(function() {
    var data;
    Ui.transformRelativeUrls();
    data = run();
    return data;
  }, function(data) {
    return processData(data, page);
  });
};

processData = function(data, page) {
  var root;
  root = SSQL.processData(data);
  root = JSON.stringify(root);
  return page.evaluate(function(root) {
    Ui.addStyle(root);
    return document.documentElement.outerHTML;
  }, sendResult, root);
};

sendResult = function(content) {
  console.old_log(content);
  return quit("", 0);
};

init = function() {
  var args, url;
  args = process.argv;
  if (args.length === 2) {
    quit("Not enough argument", 0);
  } else {
    url = args[2];
    phantom.create(function(ph) {
      return ph.createPage(function(page) {
        return getPageResult(page, url);
      });
    });
  }
};

init();
