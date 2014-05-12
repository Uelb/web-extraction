var SSQL, figue, getPageResult, getPageResultNext, http, init, level, phantom, processData, quit, request, sendResult, url;

phantom = require('phantom');

http = require('http');

SSQL = require('./lib/ssql.js');

figue = require('./vendor/figue.js');

request = require('request');

level = 2;

url = null;

console.old_log = console.log;

console.log = function() {};

quit = function(message, resultCode) {
  console.log(message);
  return process.exit(resultCode);
};

getPageResult = function(page, url, weights) {
  page.open(url, function(status) {
    setTimeout(function() {
      page.injectJs("lib/launcher.js");
      page.injectJs("vendor/jquery.js");
      page.injectJs("vendor/jquery-ui.custom.min.js");
      page.injectJs("vendor/underscore.js");
      page.injectJs("vendor/pjscrape_client.js");
      page.injectJs("lib/ui.js");
      return getPageResultNext(page, weights);
    }, 1000);
  });
};

getPageResultNext = function(page, weights) {
  return page.evaluate(function() {
    var data;
    $(":hidden").show();
    data = run();
    return data;
  }, function(data) {
    return processData(data, page, weights);
  });
};

processData = function(data, page, weights) {
  var parsedWeights, root;
  if (weights) {
    parsedWeights = JSON.parse(weights);
  }
  root = SSQL.processData(data, parsedWeights);
  root = JSON.stringify(root);
  return page.open(url, function(status) {
    return setTimeout(function() {
      page.injectJs("lib/launcher.js");
      page.injectJs("vendor/jquery.js");
      page.injectJs("vendor/jquery-ui.custom.min.js");
      page.injectJs("vendor/underscore.js");
      page.injectJs("vendor/pjscrape_client.js");
      page.injectJs("lib/ui.js");
      return page.evaluate(function(root) {
        run();
        Ui.transformRelativeUrls();
        document.getElementsByTagName("head")[0].innerHTML += "<script>window.root = " + JSON.stringify(root) + ";</script>";
        return document.documentElement.outerHTML;
      }, sendResult, root);
    }, 1000);
  });
};

sendResult = function(content) {
  console.old_log(content);
  return quit("", 0);
};

init = function() {
  var args, weights;
  args = process.argv;
  if (args.length === 2) {
    quit("Not enough argument", 0);
  }
  if (args.length > 2) {
    url = args[2];
  }
  if (args.length > 3) {
    weights = args[3];
  }
  phantom.create(function(ph) {
    return ph.createPage(function(page) {
      return getPageResult(page, url, weights);
    });
  });
};

init();
