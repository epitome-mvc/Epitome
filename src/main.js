// file for package.json npm inclusion of the whole project
define([
	'./epitome-events',
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
], function(Events, Epitome, isEqual, Storage, Model, ModelSync, Collection, CollectionSync, Template, View, Router){
	'use strict';
	// export it all under a single object
	Epitome.Events = Events;
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