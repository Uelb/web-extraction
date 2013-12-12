var allElements;

function run(){
	allElements = $("body").find("*");
	Utils.filterUnrelevantElements(allElements);
	allElements.each(function(index){
		BoxGroup.findGroup($(this));
	});
	BoxGroup.deleteSimilarNodes(BoxGroup.boxGroups);
	BoxGroup.generateSecondLevel(BoxGroup.boxGroups);
	BoxGroup.deleteSimilarNodes(BoxGroup.irregularHeightBoxGroups);
	BoxGroup.deleteSimilarNodes(BoxGroup.irregularWidthBoxGroups);
	BoxGroup.createBoxes(BoxGroup.boxGroups);
	BoxGroup.process(BoxGroup.boxGroups, 1);
}

$(function(){
	run();
	BoxGroup.printGroups(BoxGroup.irregularWidthBoxGroups);
});