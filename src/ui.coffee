underscore = _ unless underscore
jq = jQuery unless jq

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
  jq("head").append "<script>window.root = " + JSON.stringify(root) + ";</script>" if root
  return

Ui.bindGroups = (groups) ->
  underscore.each groups, Ui.bind
  return

Ui.unbindGroups = (groups) ->
  jq("[centroid]").removeAttr "centroid"
  underscore.each groups, Ui.unbind

Ui.unbind = (elements) ->
  ids = Ui.getIdSelector(elements)
  jq(ids).unbind 'mouseover'
  jq(ids).unbind 'mouseout'
  jq(ids).unbind 'click'

Ui.bind = (elements, index) ->
  ids = Ui.getIdSelector(elements)
  jq(ids).attr("centroid", index)
  jq(ids).mouseover (event) ->
    event.stopPropagation()
    Ui.highlight jq(ids)
  jq(ids).mouseout (event) ->
    event.stopPropagation()
    Ui.resetHighlight jq(ids)
  jq(ids).click (event) ->
    event.stopPropagation()
    event.preventDefault()
    if jq(".selected_highlight").size() isnt 0
      old_centroid_index = jq(".selected_highlight").attr "centroid"
      new_centroid_index = jq(this).attr "centroid"
      if old_centroid_index != new_centroid_index
        old_centroid = groups[old_centroid_index]
        new_centroid = groups[new_centroid_index]
        if jq(".extraction-center .selected").hasClass "cross"
          centroid = Ui.findCommonAncestor root, old_centroid, new_centroid
          Ui.resetSelectedHiglights()
          Ui.highlight jq(Ui.getIdSelector(centroid)), "selected_highlight"
          return

    if jq(this).hasClass "selected_highlight" || jq(this).hasClass "selected_highlight_image"
      Ui.resetHighlight jq(ids), "selected_highlight", "selected_highlight_image"
    else
      Ui.highlight jq(ids), "selected_highlight", "selected_highlight_image"

  return

Ui.highlight = (elements, className="highlight", imageClass="image_highlight")->
  jq(elements).filter(":not(img)").addClass className, 300
  jq(elements).filter("img").addClass imageClass, 300
  return

Ui.resetHighlight= (elements, className="highlight", imageClass="image_highlight")->
  jq(elements).filter(":not(img)").removeClass className, 100
  jq(elements).filter("img").removeClass imageClass, 100
  return

Ui.displayResult = (groups) ->
  underscore.each groups, putColor
  return

Ui.putColor = (elements) ->
  ids = Ui.getIdSelector(elements)
  color = getRandomColor()
  jq(ids).css "background-color", color
  return

getItem = (element) ->
  i = groups.length
  id = jq(element).attr("id")
  while(i--)
    break if groups[i].label == id
  item =
    value: jq(element).text()
    image: false
    link: null
    centroid: groups[i]
  if jq(element).is("img")
    item.value = jq(element).attr("src")
    item.link = jq(element).attr("src")
    item.image = true
  else if !!jq(element).attr('href')
    item.link = jq(element).attr("href")
  return item

Ui.getIdSelector = (element) ->
  if element.left is null and element.right is null
    "#" + element.label
  else
    Ui.getIdSelector(element.left) + "," + Ui.getIdSelector(element.right)
Ui.getItemArray = (elements) ->
  ids = Ui.getIdSelector(elements)
  underscore.map jq(ids), getItem

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
    jq.each jq('script'), (key,value)->
      jq(value).attr('src', _pjs.toFullUrl(jq(value).attr('src')))
    jq.each jq('link'), (key,value)->
      jq(value).attr('href', _pjs.toFullUrl(jq(value).attr('href')))
    jq.each jq('img'), (key,value)->
      jq(value).attr('src', _pjs.toFullUrl(jq(value).attr('src')))
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

  Ui.result.url = jq("meta[name='url']").attr("content")
  Ui.result.weights = window.weights
  if Ui.result.labels is {}
    alert('You have not chosen any labels to save...')
  else
    jq.post window.location.origin + "/centroids", Ui.result, (data)->
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
  jq(".selected_highlight").removeClass "selected_highlight"
  jq(".selected_highlight_image").removeClass "selected_highlight_image"

window.Ui = Ui
