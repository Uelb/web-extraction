var BoxGroup = Backbone.Model.extend({
        // Definition of the instance methods
        initialize: function(boxElement, index){
            this.set({
                color: boxElement.css("color"),
                bgColor: boxElement.css("background-color"),
                width: boxElement.width(),
                height: boxElement.height(),
                textDecoration: boxElement.css("text-decoration"),
                position: boxElement.position(),
                fontStyle: boxElement.css("font-style"),
                sameAncestor: boxElement.parent(),
                boxes: [boxElement]
            });
            if(index == 1)
                BoxGroup.boxGroups.push(this);
        },
        defaults: {
            alreadyProcessed: false
        },
        checkIfSimilar: function(otherElement){
            return this.get("color") == otherElement.css("color") && this.get("bgColor") == otherElement.css("background-color") &&
            this.get("width") == otherElement.width() && this.get("height") == otherElement.height() &&
            this.get("textDecoration") == otherElement.css("text-decoration") &&
            this.get("fontStyle") == otherElement.css("font-style");
        },
        insertInGroup: function(otherElement){
            if(this.checkIfSimilar(otherElement)){
                this.get("boxes").push(otherElement);
                this.updateSameAncestorLevel();
                return true;
            }
            else{
                return false;
            }
        },
        updateSameAncestorLevel: function(){
            this.sameAncestor = Utils.commonAncestor(this.get("boxes"));
        },
        print: function(){
            var array = _.map(this.get("boxes"), function(box){return box[0];});
            console.log(array);
        },
        deleteSimilarNodes: function(){
            var boxes = this.get("boxes");
            var i = boxes.length;
            var notPrinted = true;
            alreadySeenStrings = [];
            while(i--){
                var box = boxes[i];
                if(_.contains(alreadySeenStrings, box.text().trim())){
                    if(notPrinted){
                        notPrinted = false;
                    }
                    boxes.splice(i,1);
                }else if(box.text().trim()){
                    alreadySeenStrings.push(box.text().trim());
                }
            }
        },
        deleteSimilarContainers: function(){
            //Fonction à revoir, ne marche pas
            var boxes = this.get("boxes");
            var i = boxes.length;
            while(i--){
                var box = boxes[i];
                var samePosition = false;
                var j = boxes.length -1;
                while(j-- && !(samePosition)){
                    if(boxes[j].position() == box.position()){
                        samePosition = true;
                    }
                }
                if(samePosition){
                    boxes.splice(i,1);
                }
            }
        },
        add: function(box){
            this.get("boxes").push(box);
        },
        addAll: function(boxes){
            thisBoxes = this.get("boxes");
            for(var i = 0; i < boxes.length; i++){
                thisBoxes.push(boxes[i]);
            }
        },
        looseProperty: function(otherElement, propertyIndex){
            var propertyIndexes = _.without(Object.keys(BoxGroup.propertiesHash), propertyIndex);
            var result = true;
            for(var i in propertyIndexes)
                result = result && this.get(propertiesHash[i]) == otherElement.get(propertiesHash[i]);
            if(result){
                if(!BoxGroup.irregularBoxGroup[i])
                    BoxGroup.irregularBoxGroup[i] = [otherElement];
                else
                    BoxGroup.irregularBoxGroup[i].push(otherElement);
            }
            return result;
        },
        process: function(level){
            if(this.get("alreadyProcessed"))
                return false;
            if(level == 1)
                score = BoxGroup.firstLevelScore;
            else
                score = BoxGroup.secondLevelScore;
            Box.createMulti(this);
            Box.processGroupRelation(this, score);
            this.set({alreadyProcessed: true});
            return true;
        }
    },
    {

    //Definition of the class variables
        boxGroups: [],
        irregularBoxGroup: {},
        propertiesHash: {1: "color", 2: "bgColor", 3: "textDecoration", 4: "fontStyle", 5: "height", 6: "width"},
        numberOfPropertiesConsidered: 6,
        firstLevelScore: 12,
        secondLevelScore: 2,

    //Definition of the class methods
        findGroup: function(element){
            var inserted = false;
            var i = 0;
            while(i < this.boxGroups.length && !inserted){
                if(this.boxGroups[i].insertInGroup(element))
                    inserted = true;
                i++;
            }
            if(!inserted){
                new this(element, 1);
            }
        },
        printGroups: function(group){
            for(var i =0; i< group.length; i++){
                if(group[i].get("boxes").length > 1)
                    group[i].print();
            }
        },
        deleteSimilarNodes: function(group){
            for(var i=0; i< group.length; i++){
                group[i].deleteSimilarNodes();
            }
        },
        deleteSimilarContainers: function(group){
           for(var i=0; i< group.length; i++){
                group[i].deleteSimilarContainers();
            }
        },
        generateSecondLevel: function(){
            //Process to consider irregular width and weight
            boxGroupsClone = _.clone(this.boxGroups);
            var i = this.boxGroups.length;
            while(i--){
                element = this.boxGroups[i];
                if(_.contains(boxGroupsClone, element)){
                    boxGroupsClone.splice(boxGroupsClone.indexOf(element), 1);
                    var j = boxGroupsClone.length;
                    while(j--){
                        otherElement = boxGroupsClone[j];
                        for(var k = 1; k< this.numberOfPropertiesConsidered;k++){
                            element.looseProperty(otherElement, k);
                        }
                        if(element.looseProperty(otherElement)){
                            boxGroupsClone.splice(j, 1);
                        }
                    }
                }
            }
        },
        createBoxes: function(groups){
            var i = groups.length;
            while(i--){
                Box.createMulti(groups[i]);
            }
        },
        process: function(groups, level){
            for(var i= 0; i< groups.length; i++){
                groups[i].process(level);
            }
        }
    });