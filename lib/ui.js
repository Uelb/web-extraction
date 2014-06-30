var Ui, getItem, underscore;

if (!underscore) {
  underscore = _;
}

Ui = {
  api_server_url: "http://toobrok.com/",
  result: {
    labels: {},
    url: "",
    weights: {},
    number_of_centroid: 0,
    statistic: {
      color: 0,
      background_color: 0,
      width: 0,
      height: 0,
      text_decoration: 0,
      font_style: 0,
      left_alignment: 0,
      top_alignment: 0,
      z_index: 0,
      padding_l_r: 0,
      padding_t_b: 0,
      border_horizontal_width: 0,
      border_vertical_width: 0
    }
  }
};

Ui.addStyle = function(root) {
  if (root) {
    $("head").append("<script>window.root = " + JSON.stringify(root) + ";</script>");
  }
};

Ui.bindGroups = function(groups) {
  underscore.each(groups, Ui.bind);
};

Ui.unbindGroups = function(groups) {
  $("[centroid]").removeAttr("centroid");
  return underscore.each(groups, Ui.unbind);
};

Ui.unbind = function(elements) {
  var ids;
  ids = Ui.getIdSelector(elements);
  $(ids).unbind('mouseover');
  $(ids).unbind('mouseout');
  return $(ids).unbind('click');
};

Ui.bind = function(elements, index) {
  var ids;
  ids = Ui.getIdSelector(elements);
  $(ids).attr("centroid", index);
  $(ids).mouseover(function(event) {
    event.stopPropagation();
    return Ui.highlight($(ids));
  });
  $(ids).mouseout(function(event) {
    event.stopPropagation();
    return Ui.resetHighlight($(ids));
  });
  $(ids).click(function(event) {
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
          Ui.resetSelectedHiglights();
          Ui.highlight($(Ui.getIdSelector(centroid)), "selected_highlight");
          return;
        }
      }
    }
    if ($(this).hasClass("selected_highlight" || $(this).hasClass("selected_highlight_image"))) {
      return Ui.resetHighlight($(ids), "selected_highlight", "selected_highlight_image");
    } else {
      return Ui.highlight($(ids), "selected_highlight", "selected_highlight_image");
    }
  });
};

Ui.highlight = function(elements, className, imageClass) {
  if (className == null) {
    className = "highlight";
  }
  if (imageClass == null) {
    imageClass = "image_highlight";
  }
  $(elements).filter(":not(img)").addClass(className, 300);
  $(elements).filter("img").addClass(imageClass, 300);
};

Ui.resetHighlight = function(elements, className, imageClass) {
  if (className == null) {
    className = "highlight";
  }
  if (imageClass == null) {
    imageClass = "image_highlight";
  }
  $(elements).filter(":not(img)").removeClass(className, 100);
  $(elements).filter("img").removeClass(imageClass, 100);
};

Ui.displayResult = function(groups) {
  underscore.each(groups, putColor);
};

Ui.putColor = function(elements) {
  var color, ids;
  ids = Ui.getIdSelector(elements);
  color = getRandomColor();
  $(ids).css("background-color", color);
};

getItem = function(element) {
  var i, id, item;
  i = groups.length;
  id = $(element).attr("id");
  while (i--) {
    if (groups[i].label === id) {
      break;
    }
  }
  item = {
    value: $(element).text(),
    image: false,
    link: null,
    centroid: groups[i]
  };
  if ($(element).is("img")) {
    item.value = $(element).attr("src");
    item.link = $(element).attr("src");
    item.image = true;
  } else if (!!$(element).attr('href')) {
    item.link = $(element).attr("href");
  }
  return item;
};

Ui.getIdSelector = function(element) {
  if (element.left === null && element.right === null) {
    return "#" + element.label;
  } else {
    return Ui.getIdSelector(element.left) + "," + Ui.getIdSelector(element.right);
  }
};

Ui.getItemArray = function(elements) {
  var ids;
  ids = Ui.getIdSelector(elements);
  return underscore.map($(ids), getItem);
};

Ui.getResult = function(groups) {
  return underscore.map(groups, getTextArray);
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
  underscore.each(Ui.result.labels, function(value, key, list) {
    var bool, element, i, left, right, _i, _j, _k, _l, _len, _len1, _ref, _ref1, _results;
    Ui.result.number_of_centroid++;
    bool = [];
    if (value.centroids.length === 1) {
      left = value.centroids[0].left.centroid;
      right = value.centroids[0].right.centroid;
      for (i = _i = 0; _i <= 12; i = ++_i) {
        bool[i] = left[i] === right[i];
      }
    } else {
      left = value.centroids[0].centroid;
      for (i = _j = 0; _j <= 12; i = ++_j) {
        bool[i] = true;
        _ref = value.centroids;
        for (_k = 0, _len = _ref.length; _k < _len; _k++) {
          element = _ref[_k];
          bool[i] = bool[i] && (element.centroid[i] === left[i]);
        }
      }
    }
    _ref1 = Object.keys(Ui.result.statistic);
    _results = [];
    for (i = _l = 0, _len1 = _ref1.length; _l < _len1; i = ++_l) {
      key = _ref1[i];
      if (bool[i]) {
        _results.push(Ui.result.statistic[key] += 1);
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  });
  Ui.result.url = $("meta[name='url']").attr("content");
  Ui.result.weights = window.weights;
  if (Ui.result.labels === {}) {
    return alert('You have not chosen any labels to save...');
  } else {
    return $.post(window.location.origin + "/centroids", Ui.result, function(data) {
      return window.location.href = '/websites';
    });
  }
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

Ui.resetSelectedHiglights = function() {
  $(".selected_highlight").removeClass("selected_highlight");
  return $(".selected_highlight_image").removeClass("selected_highlight_image");
};

window.Ui = Ui;
