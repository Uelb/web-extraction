Ui = 
  api_server_url: "http://0.0.0.0:3000/"
  result:
    labels: {}
    url: ""

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
  # className = "color_" + Math.floor((Math.random()*4)+1)
  className = "highlight"
  $(ids).attr("centroid", index)
  $(ids).mouseover (event) ->
    event.stopPropagation()
    Ui.highlight $(ids), className
  $(ids).mouseout (event) ->
    event.stopPropagation()
    Ui.resetHighlight $(ids), className
  $(ids).click ->
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
          $(".selected_highlight").removeClass "selected_highlight"
          Ui.highlight $(Ui.getIdSelector(centroid)), "selected_highlight"
          return

    if $(this).hasClass "selected_highlight"
      Ui.resetHighlight $(ids), "selected_highlight"
    else
      Ui.highlight $(ids), "selected_highlight"

  return

Ui.highlight = (elements, className="highlight")->
  $(elements).addClass className, 300
  return

Ui.resetHighlight= (elements, className="highlight")->
  $(elements).removeClass className, 100
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
  $(element).text()
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
  $.post Ui.api_server_url + "centroids", Ui.result, (data)->
    console.log data
    console.log 'Vos données sont maintenant accessibles ! L\'identifiant de la nouvelle configuration est '

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


window.Ui = Ui
