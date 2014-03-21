filterUnrelevantElements = (elements) ->
  i = elements.length
  while i--
    element = $(elements[i])
    elements.splice i, 1  if not (element.text()) and element.prop("tagName").toUpperCase() isnt "IMG" or element.width() is 0 or element.height() is 0
  return
createJson = (elements) ->
  _.map elements, (element) ->
    $element = $(element)
    id: $element.attr("id")
    color: $element.css("color")
    bgColor: $element.css("background-color")
    width: $element.width()
    height: $element.height()
    textDecoration: $element.css("text-decoration")
    fontStyle: $element.css("font-style")
    position: $element.position()
    zIndex: $element.css("z-index")

printJSON = (object) ->
  console.log JSON.stringify(object, `undefined`, 2)
  return
sendJsonToServer = (json) ->
  xhr.send "abcdef"
  return
run = ->
  allElements = $("body").find("*:not(:hidden)")
  filterUnrelevantElements allElements
  allElements.uniqueId()
  json = createJson(allElements)
  json
allElements = undefined
