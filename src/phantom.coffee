#REQUIRES
phantom = require 'phantom'
http = require 'http'
SSQL = require './lib/ssql.js'
figue = require './vendor/figue.js'
request = require 'request'

#GLOBAL VARIABLES DEFINITIONS
level = 2

console.old_log = console.log
console.log = ->

#METHOD DEFINITONS
quit = (message, resultCode) ->
  console.log message
  process.exit resultCode

getPageResult = (page, url) ->
  page.open url, (status) ->
    # page.onConsoleMessage = (msg) -> console.log "page message : " + msg
    page.injectJs "lib/launcher.js"
    page.injectJs "vendor/jquery.js"
    page.injectJs "vendor/jquery-ui.custom.min.js"
    page.injectJs "vendor/underscore.js"
    page.injectJs "vendor/pjscrape_client.js"
    page.injectJs "lib/ui.js"
    setTimeout ->
      getPageResultNext page
    , 1000
    return
  return

getPageResultNext = (page)->
  page.evaluate ()->
    Ui.transformRelativeUrls()
    data = run()
    return data
  , (data) ->
    processData(data, page)

processData = (data, page) ->
  root = SSQL.processData data
  root = JSON.stringify root
  page.evaluate (root)->
    Ui.addStyle root
    return document.documentElement.outerHTML
  , sendResult, root

sendResult = (content)->
  console.old_log content
  quit "", 0

init = ->
  args = process.argv
  if args.length is 2
    quit "Not enough argument", 0
  else
    url = args[2]
    phantom.create (ph) ->
      ph.createPage (page) ->
        getPageResult(page, url)
  return

init()
