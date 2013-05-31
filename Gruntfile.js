module.exports = function(grunt){
	'use strict';

	// Project configuration.
	grunt.initConfig({

		// shared between tasks
		output: 'dist/docs',

		// Before generating any new files, remove any previously-created files.
		clean: {
			'dist/docs': ['<%= output%>']
		},

		// builds the docs via grunt-doctor-md task.
		doctor: {
			default_options: {
				options: {
					source: 'README.md',
					output: '<%= output%>',
					title: 'Epitome - MVC/MVP Framework for MooTools',
					twitter: 'D_mitar',
					analytics: 'UA-1199722-3',
					pageTemplate: 'dist/tpl/page.hbs',
					github: 'https://github.com/epitome-mvc/Epitome',
					travis: 'http://travis-ci.org/epitome-mvc/Epitome',
					images: 'dist/images',
					logo: 'images/epitome-logo-small.png',
					disqus: 'epitome-mvc'
				},
				files: {
					'<%= output%>/index.html': './README.md'
				},

				// via grunt-contrib-copy, move files to docs folder.
				copy: {
					doctor: {
						files: [{
							dest: '<%= output%>/js/',
							src: ['Epitome-min.js','dist/js/doctor.js'],
							expand: true,
							flatten: true
						}]
					}
				},

				// helps move some files through a template engine to docs folder. passes options as context
				assemble: {
					options: {
						engine: 'handlebars',
						flatten: false,
						name: 'epitome example',
						// files to embed in the example before running code, from /js
						jsIncludes: [],
						cssIncludes: []
					},
					doctor: {
						files: [{
							dest: '<%= output%>/js/blank.html',
							src: 'dist/tpl/blank.hbs'
						}]
					}
				}
			}
		}


	});

	// These plugins provide necessary tasks.
	// grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-doctor-md');

	// By default, clean and generate docs
	grunt.registerTask('default', ['clean','doctor']);
	grunt.registerTask('test', ['doctor']);
};