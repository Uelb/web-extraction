var allElements;

function filterUnrelevantElements(elements){
	var i = elements.length;
    while(i--){
        element = $(elements[i]);
        if(!(element.text()) && element.prop("tagName").toUpperCase() != "IMG" || element.width() === 0 || element.height() === 0)
            elements.splice(i,1);
    }
}

function createJson(elements){
	return _.map(elements, function(element){
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
}

function printJSON(object){
    console.log(JSON.stringify(object, undefined, 2));
}

function sendJsonToServer(json){
	xhr.send("abcdef");
}

function run(){
	allElements = $("body").find("*:not(:hidden)");
	filterUnrelevantElements(allElements);
	allElements.uniqueId();
	json = createJson(allElements);
  return json;
}