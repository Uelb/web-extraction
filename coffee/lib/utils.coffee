Utils = {}
Utils.processColorString = (color) ->
  colorRgb = color.substring(color.indexOf("(") + 1, color.indexOf(")")).split(",")
  parseFloat(colorRgb[0]) + 256 * parseFloat(colorRgb[1]) + 65536 * parseFloat(colorRgb[2])

Utils.checkLengths = (vec1, vec2) ->
  throw "vectors have different lengths"  unless vec1.length is vec2.length
  return
