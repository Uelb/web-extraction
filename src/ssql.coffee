figue = require '../vendor/figue.js'
Utils = require './utils.js'
SSQL = {}
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

SSQL.processData = (data, weights=null) ->
  if weights
    to_use_distance = (vec1, vec2)->
      SSQL.CUSTOM_WEIGHTED_DISTANCE(vec1,vec2,weights)
  else
    to_use_distance = SSQL.CUSTOM_DISTANCE
  labels = []
  vectors = []
  i = 0

  while i < data.length
    element = data[i]
    labels[i] = element.id
    vectors[i] = SSQL.getVector(element)
    i++
  root = figue.agglomerate(labels, vectors, to_use_distance, figue.COMPLETE_LINKAGE)
  return root

SSQL.getWeightVector = (weights) ->
  result = [
    weights.color
    weights.bgColor
    weights.width
    weights.height
    weights.textDecoration
    weights.fontStyle
    weights.leftAlignment
    weights.topAlignement
    weights.zIndex
  ]
  for weight in result
    weight = 1 unless weight
  return result

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

SSQL.findClosestElements = (groups, centroid) ->
  distances = []
  for elements in groups
    do (elements) -> 
      distance = SSQL.CUSTOM_DISTANCE elements.centroid, centroid
      distances[distance]||= []
      distances[distance].push elements
  closestElements = distances[Math.min.apply(Math, Object.keys(distances))]
  return closestElements[0] if closestElements.length is 1
  # To improve...
  return closestElements[0]

SSQL.flatten_root = (root) ->
  groups = []
  groups.push root
  groups.push.apply groups, SSQL.flatten_root root.left unless root.left is null
  groups.push.apply groups, SSQL.flatten_root root.right unless root.right is null
  return groups

module.exports = SSQL