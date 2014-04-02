var fs, getPageResult, init, page, quit, server, system, webserver;

page = require("webpage").create();

system = require("system");

fs = require("fs");

webserver = require("webserver");

server = webserver.create();

quit = function(reason, value) {
  console.log("QUIT: " + reason);
  phantom.exit(value);
};

getPageResult = function(url, level, label) {
  page.open(url, function(status) {
    var centroid, data, e, element, groups, page_url, result;
    page.injectJs("lib/launcher.js");
    page.injectJs("vendor/jquery.js");
    page.injectJs("vendor/jquery-ui.custom.min.js");
    page.injectJs("vendor/underscore.js");
    page.injectJs("vendor/pjscrape_client.js");
    page.injectJs("lib/ui.js");
    page.onConsoleMessage = function(msg) {
      system.stderr.writeLine("console: " + msg);
    };
    data = page.evaluate(function() {
      return run();
    });
    page_url = page.evaluate(function() {
      var base, loc, path;
      loc = window.location;
      base = loc.hostname + (loc.port ? ":" + loc.port : "");
      path = loc.pathname.split("/").slice(0, -1).join("/");
      return base + path;
    });
    groups = SSQL.processData(data, level);
    centroid = page.evaluate(function() {
      $.ajax({
        url: Ui.api_server_url + 'jsons/' + page_url + '/' + label,
        async: false,
        type: 'GET',
        succces: function(data) {
          var json;
          return json = data;
        }
      });
      return json;
    });
    element = SSQL.findClosestElement(groups, centroid);
    result = page.evaluate(function(element) {
      return Ui.getTextArray(element);
    }, element);
    try {
      fs.write('output/trees/' + page_url + '.json', JSON.stringify(groups));
      fs.write('output/jsons/' + page_url + '.json', JSON.stringify(result));
    } catch (_error) {
      e = _error;
      console.log(e);
    }
  });
};

init = function() {
  if (system.args.length < 3) {
    console.log("Try to pass some args when invoking this script!");
    quit("Not enough argument", 0);
  } else {
    phantom.injectJs("vendor/figue.js");
    phantom.injectJs("lib/utils.js");
    phantom.injectJs("lib/ssql.js");
    phantom.injectJs("vendor/underscore.js");
    getPageResult(system.args[1], 2, system.args[2]);
  }
};

init();
