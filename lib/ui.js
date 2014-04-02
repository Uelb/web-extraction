var Ui, getText, getTextArray;

Ui = {
  api_server_url: "http://0.0.0.0:3000/",
  result: {
    centroids: {},
    url: ""
  }
};

Ui.addStyle = function(groups, url) {
  $("head").append("<link rel=\"stylesheet\" href=\"//code.jquery.com/ui/1.10.4/themes/smoothness/jquery-ui.css\">");
  $("head").append("<link href=\"" + Ui.api_server_url + "assets/ssql_ui/main.css\" rel=\"stylesheet\" type=\"text/css\">");
  $("head").append("<script src=\"http://code.jquery.com/jquery-1.11.0.min.js\"></script>");
  $("head").append("<script src=\"//code.jquery.com/ui/1.10.4/jquery-ui.js\"></script>");
  $("head").append("<script src=\"" + Ui.api_server_url + "assets/ssql_ui/ui.js\"></script>");
  $("head").append("<script src=\"//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min.js\"></script>");
  if (groups) {
    $("head").append("<script>window.groups = " + JSON.stringify(groups) + ";</script>");
  }
  if (groups) {
    $("head").append("<script>$(Ui.init)</script>");
  }
  $("head").append("<style type=\"text/css\" class=\"colors\"></style>");
  $("head").append("<meta name=\"site_url\" content=\"" + url + "\">");
  $("body").append("<div id=\"dialog-form\" title=\"Label a field\"> <form> <fieldset> <label for=\"label\">Field label</label> <input type=\"text\" name=\"label\" id=\"dialog-label\" class=\"text ui-widget-content ui-corner-all\"> </fieldset> </form> </div>");
};

Ui.bindGroups = function(groups) {
  _.each(groups, Ui.bind);
};

Ui.setDialog = function() {
  return $("#dialog-form").dialog({
    autoOpen: false,
    modal: true,
    buttons: {
      "Create a label": function() {
        var centroid, label_value;
        label_value = $("#dialog-label").val();
        centroid = groups[Ui.current_centroid_index];
        Ui.result.centroids[label_value] = centroid;
        return $(this).dialog("close");
      },
      Cancel: function() {
        return $(this).dialog("close");
      }
    },
    close: function() {
      return $("#dialog-label").val("");
    }
  });
};

Ui.bind = function(elements, index) {
  var className, ids;
  ids = Ui.getIdSelector(elements);
  className = "highlight";
  $(ids).attr("centroid", index);
  $(ids).mouseover(function(event) {
    event.stopPropagation();
    return Ui.highlight($(ids), className);
  });
  $(ids).mouseout(function(event) {
    event.stopPropagation();
    return Ui.resetHighlight($(ids), className);
  });
  $(ids).click(function() {
    event.stopPropagation();
    event.preventDefault();
    Ui.current_centroid_index = $(this).attr("centroid");
    return $("#dialog-form").dialog("open");
  });
};

Ui.highlight = function(elements, className) {
  if (className == null) {
    className = "highlight";
  }
  $(elements).addClass(className, 300);
};

Ui.resetHighlight = function(elements, className) {
  if (className == null) {
    className = "highlight";
  }
  $(elements).removeClass(className, 100);
};

Ui.displayResult = function(groups) {
  _.each(groups, putColor);
};

Ui.putColor = function(elements) {
  var color, ids;
  ids = getIdSelector(elements);
  color = getRandomColor();
  $(ids).css("background-color", color);
};

getText = function(element) {
  return $(element).text();
};

Ui.getIdSelector = function(element) {
  if (element.left === null && element.right === null) {
    return "#" + element.label;
  } else {
    return Ui.getIdSelector(element.left) + "," + Ui.getIdSelector(element.right);
  }
};

getTextArray = function(elements) {
  var ids;
  ids = getIdSelector(elements);
  return _.map($(ids), getText);
};

Ui.getResult = function(groups) {
  return _.map(groups, getTextArray);
};

Ui.getRandomColor = function() {
  var color, i, letters;
  letters = "0123456789ABCDEF".split("");
  color = "#";
  i = 0;
  while (i < 6) {
    color += letters[Math.round(Math.random() * 15)];
    i++;
  }
  return color;
};

Ui.init = function() {
  if (window.groups) {
    Ui.bindGroups(window.groups);
  }
  Ui.setDialog();
  return Ui.result.url = $("meta[name='site_url']").attr("content");
};

Ui.transformRelativeUrls = function() {
  if (_pjs) {
    $.each($('script'), function(key, value) {
      return $(value).attr('src', _pjs.toFullUrl($(value).attr('src')));
    });
    $.each($('link'), function(key, value) {
      return $(value).attr('href', _pjs.toFullUrl($(value).attr('href')));
    });
    return $.each($('img'), function(key, value) {
      return $(value).attr('src', _pjs.toFullUrl($(value).attr('src')));
    });
  } else {
    throw 'Not supported, the pjs library is not accessible';
  }
};

Ui.save = function() {
  return $.post(Ui.api_server_url + "centroids", Ui.result, function(data) {
    console.log(data);
    return console.log('Vos données sont maintenant accessibles ! L\'identifiant de la nouvelle configuration est ');
  });
};

window.Ui = Ui;
