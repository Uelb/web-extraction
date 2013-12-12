var allElements;

function run(){
	allElements = $("body").find("*:not(:hidden)");
	Utils.filterUnrelevantElements(allElements);
	allElements.each(function(index){
		BoxGroup.findGroup($(this));
	});
	BoxGroup.deleteSimilarNodes(BoxGroup.boxGroups);
	BoxGroup.createBoxes(BoxGroup.boxGroups);
}

$(function(){
	run();
});