var Ui, getText;

Ui = {
  api_server_url: "http://0.0.0.0:3000/",
  result: {
    labels: {},
    url: ""
  }
};

Ui.addStyle = function(root) {
  if (root) {
    $("head").append("<script>window.root = " + JSON.stringify(root) + ";</script>");
  }
};

Ui.bindGroups = function(groups) {
  _.each(groups, Ui.bind);
};

Ui.unbindGroups = function(groups) {
  $("[centroid]").removeAttr("centroid");
  return _.each(groups, Ui.unbind);
};

Ui.unbind = function(elements) {
  var ids;
  ids = Ui.getIdSelector(elements);
  $(ids).unbind('mouseover');
  $(ids).unbind('mouseout');
  return $(ids).unbind('click');
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
    var centroid, new_centroid, new_centroid_index, old_centroid, old_centroid_index;
    event.stopPropagation();
    event.preventDefault();
    if ($(".selected_highlight").size() !== 0) {
      old_centroid_index = $(".selected_highlight").attr("centroid");
      new_centroid_index = $(this).attr("centroid");
      if (old_centroid_index !== new_centroid_index) {
        old_centroid = groups[old_centroid_index];
        new_centroid = groups[new_centroid_index];
        if ($(".extraction-center .selected").hasClass("cross")) {
          centroid = Ui.findCommonAncestor(root, old_centroid, new_centroid);
          $(".selected_highlight").removeClass("selected_highlight");
          Ui.highlight($(Ui.getIdSelector(centroid)), "selected_highlight");
          return;
        }
      }
    }
    if ($(this).hasClass("selected_highlight")) {
      return Ui.resetHighlight($(ids), "selected_highlight");
    } else {
      return Ui.highlight($(ids), "selected_highlight");
    }
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
  ids = Ui.getIdSelector(elements);
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

Ui.getTextArray = function(elements) {
  var ids;
  ids = Ui.getIdSelector(elements);
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
    return Ui.bindGroups(window.groups);
  }
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
  Ui.result.url = $("meta[name='url']").attr("content");
  return $.post(Ui.api_server_url + "centroids", Ui.result, function(data) {
    return window.location.href = '/websites';
  });
};

Ui.clusterize = function(root, level, result) {
  if (root.dist <= level && !(this.left === null && this.right === null)) {
    result.push(root);
  } else if (!(this.left === null && this.right === null)) {
    Ui.clusterize(root.left, level, result);
    Ui.clusterize(root.right, level, result);
  }
};

Ui.findCommonAncestor = function(root, a, b) {
  var leftCommonAncestor, rightCommonAncestor;
  if (!root) {
    return null;
  }
  if (a === root || b === root) {
    return root;
  }
  leftCommonAncestor = Ui.findCommonAncestor(root.left, a, b);
  rightCommonAncestor = Ui.findCommonAncestor(root.right, a, b);
  if (leftCommonAncestor && rightCommonAncestor) {
    return root;
  }
  if (leftCommonAncestor) {
    return leftCommonAncestor;
  }
  return rightCommonAncestor;
};

window.Ui = Ui;