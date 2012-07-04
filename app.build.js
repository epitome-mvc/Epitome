({
	baseUrl: './src/',
	optimize: 'uglify',
	out:'./build/Epitome.js',
	name:'epitome',
	include:[
		'epitome',
		'epitome-isequal',
		'epitome-model',
		'epitome-model-sync',
		'epitome-collection',
		'epitome-collection-sync',
		'epitome-template',
		'epitome-view',
		'epitome-router'
	]
})