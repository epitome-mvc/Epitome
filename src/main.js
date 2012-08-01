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
], function(Epitome, isEqual, Storage, Model, ModelSync, Collection, CollectionSync, Template, View, Router) {
	// export it all under a single object
	Epitome.isEqual = isEqual;
	Epitome.Storage = Storage;
	Epitome.Model = Model;
	Epitome.Model.Sync = ModelSync;
	Epitome.Collection = Collection;
	Epitome.Collection.Sync = CollectionSync;
	Epitome.Template = Template;
	Epitome.View = View;
	Epitome.Router = Router;

	return Epitome;
});