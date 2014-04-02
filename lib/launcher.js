var createJson, filterUnrelevantElements;

filterUnrelevantElements = function(elements) {
  var element, i;
  i = elements.length;
  while (i--) {
    element = $(elements[i]);
    if (!(element.text() || element.prop("tagName").toUpperCase() === "IMG")) {
      elements.splice(i, 1);
    }
  }
};

createJson = function(elements) {
  return _.map(elements, function(element) {
    var $element;
    $element = $(element);
    return {
      id: $element.attr("id"),
      color: $element.css("color"),
      bgColor: $element.css("background-color"),
      width: $element.width(),
      height: $element.height(),
      textDecoration: $element.css("text-decoration"),
      fontStyle: $element.css("font-style"),
      position: $element.position(),
      zIndex: $element.css("z-index")
    };
  });
};

window.run = function() {
  var allElements, json;
  allElements = $("body").find("*:not(script,style)");
  filterUnrelevantElements(allElements);
  allElements.uniqueId();
  json = createJson(allElements);
  return json;
};
