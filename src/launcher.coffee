filterUnrelevantElements = (elements) ->
  i = elements.length
  while i--
    element = $(elements[i])
    elements.splice i, 1  unless element.text() or element.prop("tagName").toUpperCase() is "IMG"
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

window.run = ->
  allElements = $("body").find("*:not(script,style)")
  filterUnrelevantElements allElements
  allElements.uniqueId()
  json = createJson(allElements)
  json