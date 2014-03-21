function addStyle(){
  $('head').append('<style>.yellow{background-color: yellow;}</style>');
  $('head').append('<script src="http://code.jquery.com/jquery-1.11.0.min.js"></script>');
  $('head').append('<script src="toto.js"></script>');
  // $('head').append('<script>$(function(){bindGroups()})</script>');
}

function bindGroups(groups){
  _.each(groups,bind);
}

function bind(elements){
  ids = getIdSelector(elements);
  $(ids).hover(highlight, resetHighlight);
}

function highlight(){
  $(this).addClass('yellow');
}

function resetHighlight(){
  $(this).removeClass('yellow');
}

function displayResult(groups){
  _.each(groups, putColor);
}

function putColor(elements){
  ids = getIdSelector(elements);
  color = getRandomColor();
  $(ids).css('background-color', color);
}

function getResult(groups){
  return _.map(groups, getTextArray);
}

function getTextArray(elements){
  ids = getIdSelector(elements);
  return _.map($(ids), getText);
}

function getText(element){
  return $(element).text();
}

function getIdSelector(element){
  if(element.left === null && element.right === null)
    return "#" + element.label;
  else
    return getIdSelector(element.left) + "," + getIdSelector(element.right);
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}
