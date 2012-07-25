// file for package.json npm inclusion of the whole project
define([
	'./epitome',
	'./epitome-isequal',
	'./epitome-storage',
	'./epitome-model',
	'./epitome-model-sync',
	'./epitome-collection',
	'./epitome-collection-sync',
	'./epitome-template',
	'./epitome-view',
	'./epitome-router'
], function(Epitome) {
	return Epitome;
});