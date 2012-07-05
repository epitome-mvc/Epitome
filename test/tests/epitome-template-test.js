if (typeof require === 'function') {
	var Epitome = require('../../src/epitome'),
		buster = require('buster');
}

buster.testRunner.timeout = 500;

buster.testCase('Basic Epitome template test >', {
	setUp: function() {

		// 2 types, simple and logic
		this.dataSimple = {
			name: 'template',
			type: 'test'
		};

		this.dataLogic = {
			type: 'template logic',
			doThis: true,
			test: 'test'
		};

		this.templateSimple = 'This is a <%=name%> <%=type%><%=foo%>';
		this.templateLogic = 'This is <% if (obj.doThis) { %>a <%=type%><% } else { %>not a <%=type%><% } %> <%=test%>';

		this.expectSimple = 'This is a template test';
		this.expectLogic = 'This is a template logic test';

		this.templateEngine = new Epitome.Template();
	},

	'Expect template engine to be instantiated >': function() {
		buster.assert.isTrue(instanceOf(this.templateEngine, Epitome.Template));
	},

	'Expect simple variables to display and no exceptions when missing keys >': function() {
		var compiled = this.templateEngine.template(this.templateSimple, this.dataSimple);
		buster.assert.equals(compiled, this.expectSimple);
	},

	'Expect logic in templates to display correctly >': function() {
		var compiled = this.templateEngine.template(this.templateLogic, this.dataLogic);
		buster.assert.equals(compiled, this.expectLogic);
	}

});