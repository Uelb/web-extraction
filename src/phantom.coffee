page = require("webpage").create()
system = require("system")
fs = require("fs")
webserver = require("webserver")
server = webserver.create()
quit = (reason, value) ->
  console.log "QUIT: " + reason
  phantom.exit value
  return
getPageResult = (url, level) ->
  page.open url, (status) ->
    page.injectJs "lib/launcher.js"
    page.injectJs "vendor/jquery.js"
    page.injectJs "vendor/jquery-ui.custom.min.js"
    page.injectJs "vendor/underscore.js"
    page.injectJs "vendor/pjscrape_client.js"
    page.injectJs "lib/ui.js"
    page.onConsoleMessage = (msg) ->
      system.stderr.writeLine "console: " + msg
      return

    data = page.evaluate(->
      run()
    )
    groups = SSQL.processData(data, level)
    page_url = page.evaluate(->
      loc = window.location
      base = loc.hostname + ((if loc.port then ":" + loc.port else ""))
      path = loc.pathname.split("/").slice(0, -1).join("/")
      base + path
    )
    result = page.evaluate((groups, page_url) ->
      Ui.transformRelativeUrls();
      Ui.addStyle(groups, page_url);
    , groups, page_url)
    
    service = server.listen(8080, (request, response) ->
      response.statusCode = 200
      response.write page.content
      response.close()
      return
    )
    return

  return

init = ->
  if system.args.length is 1
    console.log "Try to pass some args when invoking this script!"
    quit "Not enough argument", 0
  else
    phantom.injectJs "vendor/figue.js"
    phantom.injectJs "lib/utils.js"
    phantom.injectJs "lib/ssql.js"
    phantom.injectJs "vendor/underscore.js"
    if system.args.size is 3
      level = system.args[2]
    else
      level = 2
    getPageResult system.args[1], level
  return

init()
