function displayResult(groups){
  for(var i = 0; i < groups.length; i++){
    elements = groups[i];
    ids = _.map(elements, getIdSelector).join();
    color = getRandomColor();
    $(ids).css('background-color', color);
  }
}

function getIdSelector(element){
  return "#" + element.label;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}
