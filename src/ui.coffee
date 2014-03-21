addStyle = ->
  $("head").append "<style>.yellow{background-color: yellow;}</style>"
  $("head").append "<script src=\"http://code.jquery.com/jquery-1.11.0.min.js\"></script>"
  $("head").append "<script src=\"toto.js\"></script>"
  return

# $('head').append('<script>$(function(){bindGroups()})</script>');
bindGroups = (groups) ->
  _.each groups, bind
  return
bind = (elements) ->
  ids = getIdSelector(elements)
  $(ids).hover highlight, resetHighlight
  return
highlight = ->
  $(this).addClass "yellow"
  return
resetHighlight = ->
  $(this).removeClass "yellow"
  return
displayResult = (groups) ->
  _.each groups, putColor
  return
putColor = (elements) ->
  ids = getIdSelector(elements)
  color = getRandomColor()
  $(ids).css "background-color", color
  return
getResult = (groups) ->
  _.map groups, getTextArray
getTextArray = (elements) ->
  ids = getIdSelector(elements)
  _.map $(ids), getText
getText = (element) ->
  $(element).text()
getIdSelector = (element) ->
  if element.left is null and element.right is null
    "#" + element.label
  else
    getIdSelector(element.left) + "," + getIdSelector(element.right)
getRandomColor = ->
  letters = "0123456789ABCDEF".split("")
  color = "#"
  i = 0

  while i < 6
    color += letters[Math.round(Math.random() * 15)]
    i++
  color
