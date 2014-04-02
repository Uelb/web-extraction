var Utils;

Utils = {};

Utils.processColorString = function(color) {
  var colorRgb;
  colorRgb = color.substring(color.indexOf("(") + 1, color.indexOf(")")).split(",");
  return parseFloat(colorRgb[0]) + 256 * parseFloat(colorRgb[1]) + 65536 * parseFloat(colorRgb[2]);
};

Utils.checkLengths = function(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw "vectors have different lengths";
  }
};

window.Utils = Utils;
