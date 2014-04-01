page = require("webpage").create()
system = require("system")
fs = require("fs")
webserver = require("webserver")
server = webserver.create()

quit = (reason, value) ->
  console.log "QUIT: " + reason
  phantom.exit value
  return

getPageResult = (url, level, label) ->
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
    page_url = page.evaluate(->
      loc = window.location
      base = loc.hostname + ((if loc.port then ":" + loc.port else ""))
      path = loc.pathname.split("/").slice(0, -1).join("/")
      base + path
    )
    groups = SSQL.processData(data, level)

    centroid = page.evaluate ->
      $.ajax
        url: Ui.api_server_url + 'jsons/' + page_url + '/' + label
        async: false
        type: 'GET'
        succces: (data)->
          json = data
      return json
    element = SSQL.findClosestElement groups, centroid
    result = page.evaluate (element)->
      Ui.getTextArray element
    , element
    try
      fs.write('output/trees/' + page_url + '.json', JSON.stringify groups)
      fs.write('output/jsons/' + page_url + '.json', JSON.stringify result)
    catch e
      console.log e
    return
  return

init = ->
  if system.args.length < 3
    console.log "Try to pass some args when invoking this script!"
    quit "Not enough argument", 0
  else
    phantom.injectJs "vendor/figue.js"
    phantom.injectJs "lib/utils.js"
    phantom.injectJs "lib/ssql.js"
    phantom.injectJs "vendor/underscore.js"
    getPageResult system.args[1], 2, system.args[2]
  return

init()
