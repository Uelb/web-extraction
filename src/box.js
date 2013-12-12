var Box = Backbone.Model.extend({
	//instance variables
	defaults:{
		relatedBoxes: {}
	},

	//constructor
	initialize: function(element){
		this.set({
			id: element.uniqueId()
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
	}
}, {
	//class variables
	boxes: {},
	
	//class methods
	find: function(id){
		return boxes[id];
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
	}
});