var Box = Backbone.Model.extend({
	//instance variables
	defaults:{
		relatedBoxes: {}
	},

	//constructor
	initialize: function(element){
		element.uniqueId();
		var id = element.attr("id");
		this.set({
			id: id,
			color: element.css("color"),
            bgColor: element.css("background-color"),
            width: element.width(),
            height: element.height(),
            textDecoration: element.css("text-decoration"),
            fontStyle: element.css("font-style"),
		});
		Box.boxes[id] = this;
	},

	//instance method
	addRelation: function(element, score){
		id = element.attr("id");
		if(id){
			if(id in this.relatedBoxes)
				this.relatedBoxes[id] += score;
			else
				this.relatedBoxes[id] = score;
		}
	},

	addRelations: function(elements, score){
		for(var i=0; i< elements.length; i++){
			this.addRelation(elements[i], score);
		}
	},
	createVector: function(){
		var element = this.get("element");
		vector = [element.width(), element.height(), element.css("color"), element.css("text-decoration"), element.css("font-style"), element.css("background-color")];
		return vector;
	}
}, {
	//class variables
	boxes: {},
	
	//class methods
	find: function(id){
		return Box.boxes[id];
	},
	createMulti: function(group){
		var thisGroupboxes = group.get("boxes");
		var i = thisGroupboxes.length;
		while(i--){
			if(!Box.find(thisGroupboxes[i].attr("id")))
				new Box(thisGroupboxes[i]);
		}
	},
	processGroupRelation: function(group, score){
		var thisGroupboxes = group.get(boxes);
		var i = thisGroupboxes.length;
		while(i--){
			var box = Box.find(thisGroupboxes[i].attr("id"));
			box.addRelations(_.clone(thisGroupboxes));
		}
	},
	agglomerate: function(){
		var boxes = Box.boxes;
		vectors = [];
		labels = Object.keys(boxes);
		for(var id in boxes){
			var box = boxes[id];
			vectors[labels.indexOf(id)] = box.createVector();
		}
		var root = figue.agglomerate(labels, vectors, figue.CUSTOM_DISTANCE, figue.SINGLE_LINKAGE);
		console.log(root.buildDendogram (5, true, true, true, true));
		console.log("fin de l'opération");
		return root;
	},
	getBoxesJson: function(){
		var boxes = Box.boxes;
		return _.map(boxes, function(box){
			return {
				id: box.get("id"),
				color: box.get("color"),
				bgColor: box.get("bgColor"),
				width: box.get("width"),
				height: box.get("height"),
				textDecoration: box.get("textDecoration"),
				fontStyle: box.get("fontStyle")
			};
		});
	}
});