phantom = require 'phantom'
http = require 'http'
SSQL = require './lib/ssql.js'
figue = require './vendor/figue.js'
request = require 'request'

level = 2
counter = 0
quit = (message, resultCode) ->
  console.log message
  process.exit resultCode

getPageResult = (page, level, current_website) ->
  console.log "Processing " + current_website.url
  page.onConsoleMessage = (msg) -> console.log "page message : " + msg

  page.open current_website.url, ->
    setTimeout ->
      page.injectJs("vendor/jquery.js")
      page.injectJs("vendor/jquery-ui.custom.min.js")
      page.injectJs("vendor/underscore.js")
      page.injectJs("vendor/pjscrape_client.js")
      page.injectJs("lib/ui.js")
      page.injectJs("lib/launcher.js")
      page.evaluate ->
        $(":hidden").show()
        return run()
      , (data)->
        processData(data, page, current_website)
    , 5000


processData = (data, page, current_website) ->
  root = SSQL.processData data
  groups = SSQL.flatten_root root
  items = []
  for label in current_website.labels
    value = label.value
    console.log "     ===>> Processing " + value
    elements = []
    for centroid in label.centroids
      elements.push SSQL.findClosestElements(groups, createVector(centroid))
    page.evaluate (elements, label, current_website, groups) ->
      window.groups = groups
      items = []
      elements.forEach (x)->
        Ui.getItemArray(x).forEach (y) ->
          items.push y
      return [items, label, current_website]
    , (arrayAndLabel)-> 
      sendItemArray(arrayAndLabel[0], arrayAndLabel[1], arrayAndLabel[2])
    , elements, label, current_website, groups
  page.close()

createVector = (centroid) ->
  return [centroid.color, centroid.background_color, centroid.width, centroid.height, centroid.text_decoration, centroid.font_style, centroid.left_alignment, centroid.top_alignment, centroid.z_index, centroid.padding_l_r, centroid.padding_t_b, centroid.border_horizontal_width, centroid.border_vertical_width]


sendItemArray = (array, label, current_website) ->
  console.log "For label :", label.value
  console.log "Elements found : ", JSON.stringify(array)
  body = 
    label_id: label.id
    items: array
  request
    uri: process.env.TOOBROK_SERVER_URL + '/items'
    method: 'POST'
    json: body
  , -> 
    console.log "Label " + label.value + " of Website " + current_website.url + " has been processed"
    counter--
    quit("All the labels have been processed") if counter is 0


init = ->
  console.log "Connecting to server : " + process.env.TOOBROK_SERVER_URL
  request.get process.env.TOOBROK_SERVER_URL + '/websites.json', (error, response, body) ->
    if error || response.statusCode != 200
      quit "Cannot find the list of websites, check if the Rails server is on", 1
    console.log "Fetched the list of websites to update"
    websites = JSON.parse body
    for current_website in websites
      counter += current_website.labels.length
    phantom.create (ph) ->
      website_counter = 0
      for current_website in websites
        ph.createPage (page) ->
          website = websites[website_counter++]
          level = website.level if website.level
          try
            getPageResult page, level, website
          catch
            console.log "The website " + current_website + " could not be processed..."

init()