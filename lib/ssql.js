var SSQL, Utils, figue;

figue = require('../vendor/figue.js');

Utils = require('./utils.js');

SSQL = {};

SSQL.CUSTOM_WEIGHTED_DISTANCE = function(vec1, vec2, weights) {
  var N, d, defaultWeight, i;
  d = 0;
  N = vec1.length;
  Utils.checkLengths(vec1, vec2);
  defaultWeight = 0;
  if (weights.length === 1) {
    defaultWeight = weights[0];
  }
  i = 0;
  while (i < N) {
    if (vec1[i] !== vec2[i]) {
      if (defaultWeight !== 0) {
        d += defaultWeight;
      } else {
        d += weights[i];
      }
    }
    i++;
  }
  return d;
};

SSQL.CUSTOM_DISTANCE = function(vec1, vec2) {
  return SSQL.CUSTOM_WEIGHTED_DISTANCE(vec1, vec2, [1]);
};

SSQL.processData = function(data) {
  var element, i, labels, root, vectors;
  labels = [];
  vectors = [];
  i = 0;
  while (i < data.length) {
    element = data[i];
    labels[i] = element.id;
    vectors[i] = SSQL.getVector(element);
    i++;
  }
  root = figue.agglomerate(labels, vectors, SSQL.CUSTOM_DISTANCE, figue.COMPLETE_LINKAGE);
  return root;
};

SSQL.getWeightVector = function(weights) {
  var result, weight, _i, _len;
  result = [weights.color, weights.bgColor, weights.width, weights.height, weights.textDecoration, weights.fontStyle, weights.leftAlignment, weights.topAlignement, weights.zIndex];
  for (_i = 0, _len = result.length; _i < _len; _i++) {
    weight = result[_i];
    if (!weight) {
      weight = 1;
    }
  }
  return result;
};

SSQL.getVector = function(element) {
  var bgColor, color, fontStyle, height, leftAlignment, textDecoration, topAlignement, width, zIndex;
  color = Utils.processColorString(element.color);
  bgColor = Utils.processColorString(element.bgColor);
  width = element.width;
  height = element.height;
  textDecoration = element.textDecoration;
  if (element.textDecoration === "none") {
    textDecoration = 0;
  } else if (element.textDecoration === "underline") {
    textDecoration = 1;
  } else if (element.textDecoration === "overline") {
    textDecoration = 2;
  } else if (element.textDecoration === "line-through") {
    textDecoration = 3;
  } else {
    textDecoration = 4;
  }
  fontStyle = element.fontStyle;
  if (element.fontStyle === "normal") {
    fontStyle = 0;
  } else if (element.fontStyle === "italic") {
    fontStyle = 1;
  } else if (element.fontStyle === "oblique") {
    fontStyle = 2;
  } else {
    fontStyle = 3;
  }
  leftAlignment = element.position.left;
  topAlignement = element.position.top;
  zIndex = element.zIndex;
  if (element.zIndex === "auto") {
    zIndex = 0;
  } else {
    zIndex = parseFloat(element.zIndex);
  }
  return [color, bgColor, width, height, textDecoration, fontStyle, leftAlignment, topAlignement, zIndex];
};

SSQL.findClosestElements = function(groups, centroid) {
  var closestElements, distances, elements, _fn, _i, _len;
  distances = [];
  _fn = function(elements) {
    var distance;
    distance = SSQL.CUSTOM_DISTANCE(elements.centroid, centroid);
    distances[distance] || (distances[distance] = []);
    return distances[distance].push(elements);
  };
  for (_i = 0, _len = groups.length; _i < _len; _i++) {
    elements = groups[_i];
    _fn(elements);
  }
  closestElements = distances[Math.min.apply(Math, Object.keys(distances))];
  if (closestElements.length === 1) {
    return closestElements[0];
  }
  return closestElements[0];
};

SSQL.flatten_root = function(root) {
  var groups;
  groups = [];
  groups.push(root);
  if (root.left !== null) {
    groups.push.apply(groups, SSQL.flatten_root(root.left));
  }
  if (root.right !== null) {
    groups.push.apply(groups, SSQL.flatten_root(root.right));
  }
  return groups;
};

module.exports = SSQL;
