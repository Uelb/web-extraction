window.SSQL ||= {}
SSQL.CUSTOM_WEIGHTED_DISTANCE = (vec1, vec2, weights) ->
  d = 0
  N = vec1.length
  Utils.checkLengths vec1, vec2
  defaultWeight = 0
  defaultWeight = weights[0]  if weights.length is 1
  i = 0

  while i < N
    unless vec1[i] is vec2[i]
      if defaultWeight isnt 0
        d += defaultWeight
      else
        d += weights[i]
    i++
  d

SSQL.CUSTOM_DISTANCE = (vec1, vec2) ->
  SSQL.CUSTOM_WEIGHTED_DISTANCE vec1, vec2, [1]

SSQL.processData = (data, level) ->
  labels = []
  vectors = []
  i = 0

  while i < data.length
    element = data[i]
    labels[i] = element.id
    vectors[i] = SSQL.getVector(element)
    i++
  root = figue.agglomerate(labels, vectors, SSQL.CUSTOM_DISTANCE, figue.COMPLETE_LINKAGE)
  result = []
  SSQL.clusterize root, level, result
  result

SSQL.clusterize = (root, level, result) ->
  if root.dist <= level and not root.isLeaf()
    result.push root
  else unless root.isLeaf()
    SSQL.clusterize root.left, level, result
    SSQL.clusterize root.right, level, result
  return

SSQL.getVector = (element) ->
  color = Utils.processColorString(element.color)
  bgColor = Utils.processColorString(element.bgColor)
  width = element.width
  height = element.height
  textDecoration = element.textDecoration
  if element.textDecoration is "none"
    textDecoration = 0
  else if element.textDecoration is "underline"
    textDecoration = 1
  else if element.textDecoration is "overline"
    textDecoration = 2
  else if element.textDecoration is "line-through"
    textDecoration = 3
  else
    textDecoration = 4
  fontStyle = element.fontStyle
  if element.fontStyle is "normal"
    fontStyle = 0
  else if element.fontStyle is "italic"
    fontStyle = 1
  else if element.fontStyle is "oblique"
    fontStyle = 2
  else
    fontStyle = 3
  leftAlignment = element.position.left
  topAlignement = element.position.top
  zIndex = element.zIndex
  if element.zIndex is "auto"
    zIndex = 0
  else
    zIndex = parseFloat(element.zIndex)
  [
    color
    bgColor
    width
    height
    textDecoration
    fontStyle
    leftAlignment
    topAlignement
    zIndex
  ]
