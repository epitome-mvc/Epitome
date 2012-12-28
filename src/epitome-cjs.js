(function(){
	require('mootools');

	var Epitome = {};

	Epitome.isEqual = require('./epitome-isequal').isEqual;
	Epitome.model = require('./epitome-model').Model;

	module.exports.Epitome = exports.Epitome = Epitome;

	/*
	 model-sync': require('./epitome-model-sync'),
	 'isequal': require('./epitome-isequal'),
	 'template': require('./epitome-template'),
	 'router': require('./epitome-router'),
	 'view': require('./epitome-view'),
	 'collection': require('./epitome-collection'),
	 'collection-sync': require('./epitome-collection-sync'),
	 'storage': require('./epitome-storage')
	 */

}());
