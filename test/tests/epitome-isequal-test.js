buster.testCase('Epitome.isEqual assertions >', {

	'Expect no positives for objects with same length (bug in _.js)': function() {
		buster.refute.isTrue(Epitome.isEqual({length: 330}, {length: 330, plays: 1}));
	},

	'Expect two identically looking objects to be equal': function() {
		buster.assert.isTrue(Epitome.isEqual({length: 330}, {length: 330}));
	},

	'Expect two identically looking separate functions to not be equal': function() {
		buster.refute.isTrue(Epitome.isEqual(
			(function() { return 'hi';}),
			(function() { return 'hi';})
		));
	},

	'Expect two references to the same function to be equal': function() {
		var func = function() {
			return 'hi';
		};
		buster.assert.isTrue(Epitome.isEqual(func, func));
	},

	'Expect two references to the same referenced function to be equal': function() {
		var func = function() {
			return 'hi';
		}, func2 = func;
		buster.assert.isTrue(Epitome.isEqual(func, func2));
	},

	'Expect two date objects to be equal': function() {
		var date1 = new Date(2010, 6, 26, 0, 0, 0),
			date2 = new Date(2010, 6, 26, 0, 0, 0);

		buster.assert.isTrue(Epitome.isEqual(date1, date2));
	},

	'Expect two different dates not to be equal': function() {
		// this test fails! fucking hell.
		var date1 = new Date(2010, 6, 26, 0, 0, 0),
			date2 = new Date(2000, 6, 27, 0, 0, 0);

		buster.refute.isTrue(Epitome.isEqual(date1, date2));
	},

	'Expect two identical arrays to be equal': function() {
		buster.assert.isTrue(Epitome.isEqual([1,2,3], [1,2,3]));
	},

	'Expect two referenced arrays to be equal': function() {
		var a = [1,2,3,4],
			b = a;

		buster.assert.isTrue(Epitome.isEqual(a, b));
	},

	'Expect two regexes to be equal': function() {
		buster.assert.isTrue(Epitome.isEqual(new RegExp('\s'), new RegExp('\s')));
	},

	'Expect two different regexes not to be equal': function() {
		buster.refute.isTrue(Epitome.isEqual(new RegExp('\s'), new RegExp('\t')));
	}

});
