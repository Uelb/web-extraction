var SSQL, counter, createVector, figue, getPageResult, http, init, level, phantom, processData, quit, request, sendItemArray;

phantom = require('phantom');

http = require('http');

SSQL = require('./lib/ssql.js');

figue = require('./vendor/figue.js');

request = require('request');

level = 2;

counter = 0;

quit = function(message, resultCode) {
  console.log(message);
  return process.exit(resultCode);
};

getPageResult = function(page, level, current_website) {
  console.log("Processing " + current_website.url);
  page.onConsoleMessage = function(msg) {
    return console.log("page message : " + msg);
  };
  return page.open(current_website.url, function() {
    return setTimeout(function() {
      page.injectJs("vendor/jquery.js");
      page.injectJs("vendor/jquery-ui.custom.min.js");
      page.injectJs("vendor/underscore.js");
      page.injectJs("vendor/pjscrape_client.js");
      page.injectJs("lib/ui.js");
      page.injectJs("lib/launcher.js");
      return page.evaluate(function() {
        $(":hidden").show();
        return run();
      }, function(data) {
        return processData(data, page, current_website);
      });
    }, 5000);
  });
};

processData = function(data, page, current_website) {
  var centroid, elements, groups, items, label, root, value, _i, _j, _len, _len1, _ref, _ref1;
  root = SSQL.processData(data);
  groups = SSQL.flatten_root(root);
  items = [];
  _ref = current_website.labels;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    label = _ref[_i];
    value = label.value;
    console.log("     ===>> Processing " + value);
    elements = [];
    _ref1 = label.centroids;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      centroid = _ref1[_j];
      elements.push(SSQL.findClosestElements(groups, createVector(centroid)));
    }
    page.evaluate(function(elements, label, current_website, groups) {
      window.groups = groups;
      items = [];
      elements.forEach(function(x) {
        return Ui.getItemArray(x).forEach(function(y) {
          return items.push(y);
        });
      });
      return [items, label, current_website];
    }, function(arrayAndLabel) {
      return sendItemArray(arrayAndLabel[0], arrayAndLabel[1], arrayAndLabel[2]);
    }, elements, label, current_website, groups);
  }
  return page.close();
};

createVector = function(centroid) {
  return [centroid.color, centroid.background_color, centroid.width, centroid.height, centroid.text_decoration, centroid.font_style, centroid.left_alignment, centroid.top_alignment, centroid.z_index];
};

sendItemArray = function(array, label, current_website) {
  var body;
  console.log("For label :", label.value);
  console.log("Elements found : ", JSON.stringify(array));
  body = {
    label_id: label.id,
    items: array
  };
  return request({
    uri: process.env.TOOBROK_SERVER_URL + '/items',
    method: 'POST',
    json: body
  }, function() {
    console.log("Label " + label.value + " of Website " + current_website.url + " has been processed");
    counter--;
    if (counter === 0) {
      return quit("All the labels have been processed");
    }
  });
};

init = function() {
  console.log("Connecting to server : " + process.env.TOOBROK_SERVER_URL);
  return request.get(process.env.TOOBROK_SERVER_URL + '/websites.json', function(error, response, body) {
    var current_website, websites, _i, _len;
    if (error || response.statusCode !== 200) {
      quit("Cannot find the list of websites, check if the Rails server is on", 1);
    }
    console.log("Fetched the list of websites to update");
    websites = JSON.parse(body);
    for (_i = 0, _len = websites.length; _i < _len; _i++) {
      current_website = websites[_i];
      counter += current_website.labels.length;
    }
    return phantom.create(function(ph) {
      var website_counter, _j, _len1, _results;
      website_counter = 0;
      _results = [];
      for (_j = 0, _len1 = websites.length; _j < _len1; _j++) {
        current_website = websites[_j];
        _results.push(ph.createPage(function(page) {
          var website;
          website = websites[website_counter++];
          if (website.level) {
            level = website.level;
          }
          try {
            return getPageResult(page, level, website);
          } catch (_error) {
            return console.log("The website " + current_website + " could not be processed...");
          }
        }));
      }
      return _results;
    });
  });
};

init();
