Ui = 
  api_server_url: "http://0.0.0.0:3000/"
  result:
    centroids: {}
    url: ""

Ui.addStyle = (groups, url)->
  $("head").append "<link rel=\"stylesheet\" href=\"//code.jquery.com/ui/1.10.4/themes/smoothness/jquery-ui.css\">"
  $("head").append "<link href=\"" + Ui.api_server_url + "assets/ssql_ui/main.css\" rel=\"stylesheet\" type=\"text/css\">"
  $("head").append "<script src=\"http://code.jquery.com/jquery-1.11.0.min.js\"></script>"
  $("head").append "<script src=\"//code.jquery.com/ui/1.10.4/jquery-ui.js\"></script>"
  $("head").append "<script src=\"" + Ui.api_server_url + "assets/ssql_ui/ui.js\"></script>"
  $("head").append "<script src=\"//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min.js\"></script>"
  $("head").append "<script>window.groups = " + JSON.stringify(groups) + ";</script>" if groups
  $("head").append "<script>$(Ui.init)</script>" if groups
  $("head").append "<style type=\"text/css\" class=\"colors\"></style>"
  $("head").append "<meta name=\"site_url\" content=\"" + url + "\">"
  $("body").append "
    <div id=\"dialog-form\" title=\"Label a field\">
      <form>
        <fieldset>
          <label for=\"label\">Field label</label>
          <input type=\"text\" name=\"label\" id=\"dialog-label\" class=\"text ui-widget-content ui-corner-all\">
        </fieldset>
      </form>
    </div>"
  return

Ui.bindGroups = (groups) ->
  _.each groups, Ui.bind
  return

Ui.setDialog = ->
  $("#dialog-form").dialog 
    autoOpen: false
    modal: true
    buttons:
      "Create a label": ->
        label_value = $("#dialog-label").val()
        centroid = groups[Ui.current_centroid_index]
        Ui.result.centroids[label_value] = centroid
        $(this).dialog "close"
      Cancel: ->
        $(this).dialog "close"
    close: ->
      $("#dialog-label").val ""

Ui.bind = (elements, index) ->
  ids = Ui.getIdSelector(elements)
  # className = "color_" + Math.floor((Math.random()*4)+1)
  className = "highlight"
  $(ids).attr("centroid", index)
  $(ids).mouseover (event) ->
    event.stopPropagation()
    Ui.highlight $(ids), className
  $(ids).mouseout (event) ->
    event.stopPropagation()
    Ui.resetHighlight $(ids), className
  $(ids).click ->
    event.stopPropagation()
    event.preventDefault()
    Ui.current_centroid_index = $(this).attr "centroid"
    $("#dialog-form").dialog "open"

  return

Ui.highlight = (elements, className="highlight")->
  $(elements).addClass className, 300
  return

Ui.resetHighlight= (elements, className="highlight")->
  $(elements).removeClass className, 100
  return

Ui.displayResult = (groups) ->
  _.each groups, putColor
  return
Ui.putColor = (elements) ->
  ids = getIdSelector(elements)
  color = getRandomColor()
  $(ids).css "background-color", color
  return
getText = (element) ->
  $(element).text()
Ui.getIdSelector = (element) ->
  if element.left is null and element.right is null
    "#" + element.label
  else
    Ui.getIdSelector(element.left) + "," + Ui.getIdSelector(element.right)
getTextArray = (elements) ->
  ids = getIdSelector(elements)
  _.map $(ids), getText

Ui.getResult = (groups) ->
  _.map groups, getTextArray
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
  Ui.setDialog()
  Ui.result.url = $("meta[name='site_url']").attr("content")

Ui.transformRelativeUrls = ->
  if _pjs
    $.each $('script'), (key,value)->
      $(value).attr('src', _pjs.toFullUrl($(value).attr('src')))
    $.each $('link'), (key,value)->
      $(value).attr('href', _pjs.toFullUrl($(value).attr('href')))
    $.each $('img'), (key,value)->
      $(value).attr('src', _pjs.toFullUrl($(value).attr('src')))
  else
    throw 'Not supported, the pjs library is not accessible'

Ui.save = () ->
  $.post Ui.api_server_url + "centroids", Ui.result, (data)->
    console.log data
    console.log 'Vos données sont maintenant accessibles ! L\'identifiant de la nouvelle configuration est '
window.Ui = Ui