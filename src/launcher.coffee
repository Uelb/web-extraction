filterUnrelevantElements = (elements) ->
  i = elements.length
  while i--
    element = $(elements[i])
    elements.splice i, 1  unless element.text() or element.prop("tagName").toUpperCase() is "IMG"
  return
createJson = (elements) ->
  props = ["position", "visibility", "display"]
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
    borderHorizontalWidth: parseInt($element.css("border-left-width").replace("px", "")) + parseInt($element.css("border-right-width").replace("px", ""))
    borderVerticalWidth: parseInt($element.css("border-top-width").replace("px", "")) + parseInt($element.css("border-bottom-width").replace("px", ""))
    paddingLR: parseInt($element.css("padding-left").replace("px", "")) + parseInt($element.css("padding-right").replace("px", ""))
    paddingTB: parseInt($element.css("padding-top").replace("px", "")) + parseInt($element.css("padding-bottom").replace("px", ""))

window.run = ->
  allElements = $("body").find("*:not(script,style)")
  filterUnrelevantElements allElements
  allElements.uniqueId()
  json = createJson(allElements)
  json