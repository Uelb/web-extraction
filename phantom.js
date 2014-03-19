var page = require('webpage').create();
var system = require('system');
function quit( reason, value ) {
  console.log( "QUIT: " + reason );
  phantom.exit( value );
}

if (system.args.length === 1) {
  console.log('Try to pass some args when invoking this script!');
  phantom.exit();

} else {
  phantom.injectJs('vendor/figue.js');
  phantom.injectJs('lib/utils.js');
  phantom.injectJs('lib/ssql.js');
  phantom.injectJs('vendor/underscore.js');

  page.open(system.args[1], function(status) {

    page.injectJs('src/launcher.js');
    page.injectJs('vendor/jquery.js');
    page.injectJs('vendor/jquery-ui.custom.min.js');
    page.injectJs('vendor/underscore.js');

    data = page.evaluate(function() {
      return run();
    });
    if(system.args.size == 3)
      level = system.args[2];
    else
      level = 2;
    var groups = SSQL.processData(data, level);
    page.injectJs('lib/ui.js');

    page.evaluate(function(groups) {
      return displayResult(groups);
    }, groups);

    page.render('result.png');
  });
}