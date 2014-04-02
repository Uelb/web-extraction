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

getPageResult = function(url, level) {
  page.open(url, function(status) {
    var data, groups, page_url, result, service;
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
    groups = SSQL.processData(data, level);
    page_url = page.evaluate(function() {
      var base, loc, path;
      loc = window.location;
      base = loc.hostname + (loc.port ? ":" + loc.port : "");
      path = loc.pathname.split("/").slice(0, -1).join("/");
      return base + path;
    });
    result = page.evaluate(function(groups, page_url) {
      Ui.transformRelativeUrls();
      return Ui.addStyle(groups, page_url);
    }, groups, page_url);
    service = server.listen(8080, function(request, response) {
      response.statusCode = 200;
      response.write(page.content);
      response.close();
    });
  });
};

init = function() {
  var level;
  if (system.args.length === 1) {
    console.log("Try to pass some args when invoking this script!");
    quit("Not enough argument", 0);
  } else {
    phantom.injectJs("vendor/figue.js");
    phantom.injectJs("lib/utils.js");
    phantom.injectJs("lib/ssql.js");
    phantom.injectJs("vendor/underscore.js");
    if (system.args.size === 3) {
      level = system.args[2];
    } else {
      level = 2;
    }
    getPageResult(system.args[1], level);
  }
};

init();
