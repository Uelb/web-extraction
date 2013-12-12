var Utils = Backbone.Model.extend({},{
    parents: function(node){
        var nodes = [node];
        for (; node; node = node.parentNode) {
            nodes.unshift(node);
        }
        return nodes;
    },
    commonAncestor2Node: function(node1, node2) {
        var parents1 = Utils.parents(node1);
        var parents2 = Utils.parents(node2);

        if (parents1[0] != parents2[0]) throw "No common ancestor!";

        for (var i = 0; i < parents1.length; i++) {
            if (parents1[i] != parents2[i]) return parents1[i - 1];
        }
    },
    commonAncestor: function(boxes){
        if(boxes.length > 1){
            var ancestor = Utils.commonAncestor2Node(boxes[0][0], boxes[1][0]);
            for(var i = 2; i < boxes.length; i++){
                ancestor = Utils.commonAncestor2Node(ancestor, boxes[i][0]);
            }
            return $(ancestor);
        }else if(boxes.length == 1){
            return boxes[0].parent();
        }else{
            throw "Argument number error";
        }
    },
    loadBody: function(url){
        $.get(url, function(data){
            console.log($(data).$("body"));
        });
    },
    filterUnrelevantElements: function(elements){
        var i = elements.length;
        while(i--){
            element = $(elements[i]);
            if(!(element.text()) && element.prop("tagName").toUpperCase() != "IMG" || element.prop("tagName").toUpperCase()  === "SCRIPT" || element.width() === 0 || element.height() === 0)
                elements.splice(i,1);
        }
    }
});

