var page = require('webpage').create();
var system = require('system');
var fs = require('fs');
var webserver = require('webserver');
var server = webserver.create();
function quit( reason, value ) {
  console.log( "QUIT: " + reason );
  phantom.exit( value );
}

function getPageResult(url, level){
  page.open(url, function(status) {

    page.injectJs('lib/launcher.js');
    page.injectJs('vendor/jquery.js');
    page.injectJs('vendor/jquery-ui.custom.min.js');
    page.injectJs('vendor/underscore.js');
    page.injectJs('vendor/pjscrape_client.js');
    page.injectJs('lib/ui.js');
    page.onConsoleMessage = function(msg) {
      system.stderr.writeLine('console: ' + msg);
    };

    data = page.evaluate(function() {
      return run();
    });
    
    var groups = SSQL.processData(data, level);

    page_url = page.evaluate(function(){
      var loc = window.location,
      base = loc.hostname + (loc.port ? ':' + loc.port : ''),
      path = loc.pathname.split('/').slice(0,-1).join('/');
      return base + path;
    });
    var result = page.evaluate(function(groups) {
      addStyle();
      return getResult(groups);
    }, groups);

    // try{
    //   fs.write('output/trees/' + page_url + '.json', JSON.stringify(groups));
    //   fs.write('output/jsons/' + page_url + '.json', JSON.stringify(result));
    // }catch(e){
    //   console.log(e);
    // }

    var service = server.listen(8080, function(request, response) {
      request.url = 'http://0.0.0.0:8080/totoefe';
      response.statusCode = 200;
      response.write(page.content);
      response.close();
    });



    // page.render('result.png');
    // quit('End of process', 0);
  });
}

function init(){
  if (system.args.length === 1) {
    console.log('Try to pass some args when invoking this script!');
    quit('Not enough argument', 0);

  } else {
    phantom.injectJs('vendor/figue.js');
    phantom.injectJs('lib/utils.js');
    phantom.injectJs('lib/ssql.js');
    phantom.injectJs('vendor/underscore.js');
    if(system.args.size == 3)
      level = system.args[2];
    else
      level = 2;
    getPageResult(system.args[1], level);
  }
}

init();