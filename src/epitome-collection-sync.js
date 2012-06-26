;(function(exports) {

	var Epitome = typeof require == 'function' ? require('epitome-collection') : exports.Epitome;

	//this file is not functional.

	Epitome.Collection.Sync = new Class({

		Extends: Epitome.Collection


	});

	if (typeof define === 'function' && define.amd) {
		define('epitome-collection-sync', function() {
			return Epitome;
		});
	}
	else if (typeof module === 'object') {
		module.exports = Epitome;
	}
	else {
		exports.Epitome = Epitome;
	}
}(this));