underscore = _ unless underscore

Ui = 
  api_server_url: "http://toobrok.com/"
  result:
    labels: {}
    url: ""
    weights: {}
    number_of_centroid: 0
    statistic:
      color: 0
      background_color: 0
      width: 0
      height: 0
      text_decoration: 0
      font_style: 0
      left_alignment: 0
      top_alignment: 0
      z_index: 0
      padding_l_r: 0
      padding_t_b: 0
      border_horizontal_width: 0
      border_vertical_width: 0

Ui.addStyle = (root)->
  $("head").append "<script>window.root = " + JSON.stringify(root) + ";</script>" if root
  return

Ui.bindGroups = (groups) ->
  underscore.each groups, Ui.bind
  return

Ui.unbindGroups = (groups) ->
  $("[centroid]").removeAttr "centroid"
  underscore.each groups, Ui.unbind

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
  underscore.each groups, putColor
  return

Ui.putColor = (elements) ->
  ids = Ui.getIdSelector(elements)
  color = getRandomColor()
  $(ids).css "background-color", color
  return

getItem = (element) ->
  i = groups.length
  id = $(element).attr("id")
  while(i--)
    break if groups[i].label == id
  item =
    value: $(element).text()
    image: false
    link: null
    centroid: groups[i]
  if $(element).is("img")
    item.value = $(element).attr("src")
    item.link = $(element).attr("src")
    item.image = true
  else if !!$(element).attr('href')
    item.link = $(element).attr("href")
  return item

Ui.getIdSelector = (element) ->
  if element.left is null and element.right is null
    "#" + element.label
  else
    Ui.getIdSelector(element.left) + "," + Ui.getIdSelector(element.right)
Ui.getItemArray = (elements) ->
  ids = Ui.getIdSelector(elements)
  underscore.map $(ids), getItem

Ui.getResult = (groups) ->
  underscore.map groups, getTextArray
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
  underscore.each Ui.result.labels, (value, key, list) ->
    Ui.result.number_of_centroid++
    bool = []
    if value.centroids.length == 1
      left = value.centroids[0].left.centroid
      right = value.centroids[0].right.centroid
      for i in [0..12]
        bool[i] = (left[i] == right[i])
    else
      left = value.centroids[0].centroid
      for i in [0..12]
        bool[i] = true
        for element in value.centroids
          bool[i] = bool[i] && (element.centroid[i] == left[i])
    for key, i in Object.keys(Ui.result.statistic)
      Ui.result.statistic[key] +=1 if bool[i]

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
