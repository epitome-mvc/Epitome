buster.testRunner.timeout = 1000;

buster.testCase('Basic Epitome model collection creation >', {
    setUp: function() {
        this.collection = new Epitome.Collection();
    },

    tearDown: function() {

    },

    'Expect a collection to be created >': function() {
        buster.assert.isTrue(instanceOf(this.collection, Epitome.Collection));
    }
});