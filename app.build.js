({
	baseUrl: './src/',
	optimize: 'uglify2',
	out:'./Epitome-min.js',
	name:'epitome',
	include:[
		'epitome',
		'epitome-isequal',
		'epitome-model',
		'epitome-model-sync',
		'epitome-storage',
		'epitome-collection',
		'epitome-collection-sync',
		'epitome-template',
		'epitome-view',
		'epitome-router'
	]
})