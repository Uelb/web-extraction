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

getPageResult = (page, url, weights) ->
  page.open url, (status) ->
    # page.onConsoleMessage = (msg) -> console.log "page message : " + msg
    setTimeout ->
      page.injectJs "lib/launcher.js"
      page.injectJs "vendor/jquery.js"
      page.injectJs "vendor/jquery-ui.custom.min.js"
      page.injectJs "vendor/underscore.js"
      page.injectJs "vendor/pjscrape_client.js"
      page.injectJs "lib/ui.js"
      getPageResultNext page, weights
    , 1000
    return
  return

getPageResultNext = (page, weights)->
  page.evaluate ()->
    Ui.transformRelativeUrls()
    data = run()
    return data
  , (data) ->
    processData(data, page, weights)

processData = (data, page, weights) ->
  parsedWeights = JSON.parse(weights) if weights;
  root = SSQL.processData data, parsedWeights
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
  if args.length > 2
    url = args[2]
  if args.length > 3
    weights = args[3]    
  phantom.create (ph) ->
    ph.createPage (page) ->
      getPageResult(page, url, weights)
  return

init()
