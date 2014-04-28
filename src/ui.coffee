Ui = 
  api_server_url: "http://toobrok.com/"
  result:
    labels: {}
    url: ""
    weights: {}

Ui.addStyle = (root)->
  $("head").append "<script>window.root = " + JSON.stringify(root) + ";</script>" if root
  return

Ui.bindGroups = (groups) ->
  _.each groups, Ui.bind
  return

Ui.unbindGroups = (groups) ->
  $("[centroid]").removeAttr "centroid"
  _.each groups, Ui.unbind

Ui.unbind = (elements) ->
  ids = Ui.getIdSelector(elements)
  $(ids).unbind 'mouseover'
  $(ids).unbind 'mouseout'
  $(ids).unbind 'click'

Ui.bind = (elements, index) ->
  ids = Ui.getIdSelector(elements)
  $(ids).attr("centroid", index)
  $(ids).mouseover (event) ->
    event.stopPropagation()
    Ui.highlight $(ids)
  $(ids).mouseout (event) ->
    event.stopPropagation()
    Ui.resetHighlight $(ids)
  $(ids).click (event) ->
    event.stopPropagation()
    event.preventDefault()
    if $(".selected_highlight").size() isnt 0
      old_centroid_index = $(".selected_highlight").attr "centroid"
      new_centroid_index = $(this).attr "centroid"
      if old_centroid_index != new_centroid_index
        old_centroid = groups[old_centroid_index]
        new_centroid = groups[new_centroid_index]
        if $(".extraction-center .selected").hasClass "cross"
          centroid = Ui.findCommonAncestor root, old_centroid, new_centroid
          Ui.resetSelectedHiglights()
          Ui.highlight $(Ui.getIdSelector(centroid)), "selected_highlight"
          return

    if $(this).hasClass "selected_highlight" || $(this).hasClass "selected_highlight_image"
      Ui.resetHighlight $(ids), "selected_highlight", "selected_highlight_image"
    else
      Ui.highlight $(ids), "selected_highlight", "selected_highlight_image"

  return

Ui.highlight = (elements, className="highlight", imageClass="image_highlight")->
  $(elements).filter(":not(img)").addClass className, 300
  $(elements).filter("img").addClass imageClass, 300
  return

Ui.resetHighlight= (elements, className="highlight", imageClass="image_highlight")->
  $(elements).filter(":not(img)").removeClass className, 100
  $(elements).filter("img").removeClass imageClass, 100
  return

Ui.displayResult = (groups) ->
  _.each groups, putColor
  return
Ui.putColor = (elements) ->
  ids = Ui.getIdSelector(elements)
  color = getRandomColor()
  $(ids).css "background-color", color
  return
getText = (element) ->
  if $(element).is("img")
    return "image:::" + $(element).attr("src")
  else
    return $(element).text()
Ui.getIdSelector = (element) ->
  if element.left is null and element.right is null
    "#" + element.label
  else
    Ui.getIdSelector(element.left) + "," + Ui.getIdSelector(element.right)
Ui.getTextArray = (elements) ->
  ids = Ui.getIdSelector(elements)
  _.map $(ids), getText

Ui.getResult = (groups) ->
  _.map groups, getTextArray
Ui.getRandomColor = ->
  letters = "0123456789ABCDEF".split("")
  color = "#"
  i = 0

  while i < 6
    color += letters[Math.round(Math.random() * 15)]
    i++
  color

Ui.init = () ->
  Ui.bindGroups window.groups if window.groups

Ui.transformRelativeUrls = ->
  if _pjs
    $.each $('script'), (key,value)->
      $(value).attr('src', _pjs.toFullUrl($(value).attr('src')))
    $.each $('link'), (key,value)->
      $(value).attr('href', _pjs.toFullUrl($(value).attr('href')))
    $.each $('img'), (key,value)->
      $(value).attr('src', _pjs.toFullUrl($(value).attr('src')))
  else
    throw 'Not supported, the pjs library is not accessible'

Ui.save = () ->
  Ui.result.url = $("meta[name='url']").attr("content")
  Ui.result.weights = window.weights
  if Ui.result.labels is {}
    alert('You have not chosen any labels to save...')
  else
    $.post window.location.origin + "/centroids", Ui.result, (data)->
      window.location.href = '/websites'
Ui.clusterize = (root, level, result) ->
  if root.dist <= level and not (this.left == null && this.right == null)
    result.push root
  else unless (this.left == null && this.right == null)
    Ui.clusterize root.left, level, result
    Ui.clusterize root.right, level, result
  return

Ui.findCommonAncestor = (root,a,b) ->
  return null unless root
  return root if a == root or b == root
  leftCommonAncestor = Ui.findCommonAncestor root.left, a, b
  rightCommonAncestor = Ui.findCommonAncestor root.right, a, b
  return root if leftCommonAncestor && rightCommonAncestor
  return leftCommonAncestor if leftCommonAncestor
  return rightCommonAncestor

Ui.resetSelectedHiglights = ()->
  $(".selected_highlight").removeClass "selected_highlight"
  $(".selected_highlight_image").removeClass "selected_highlight_image"

window.Ui = Ui
