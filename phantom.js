var page = require('webpage').create();
var system = require('system');

if (system.args.length === 1) {
  console.log('Try to pass some args when invoking this script!');
} else {
  phantom.injectJs('vendor/figue.js');
  phantom.injectJs('lib/utils.js');
  phantom.injectJs('lib/ssql.js');
  page.open(system.args[1], function() {
    page.injectJs('src/launcher.js');
    page.injectJs('vendor/jquery.js');
    page.injectJs('vendor/jquery-ui.custom.min.js');
    page.injectJs('vendor/underscore.js');
    data = page.evaluate(function() {
      return run();
    });
    SSQL.processData(data);
  });

}
phantom.exit();
