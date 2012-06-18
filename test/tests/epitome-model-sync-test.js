buster.testRunner.timeout = 1000;

buster.testCase('Epitome model sync >', {
    setUp: function() {
        this.dataInitial = {
            foo: 'bar',
            id: '1234-5123'
        };

        this.dataAfter = {
            bar: 'foo'
        };

        this.dataMany = {
            foo: 'one',
            bar: 'two',
            charlie: 'winning'
        };

        this.options = {
            onSync: function(responseObj, method, data) {

            },
            defaults: {
                foo: 'not bar',
                name: 'dimitar'
            }
        };

        this.syncEvents = false;

        this.model = new Epitome.Model.Sync(this.dataInitial, this.options);
    },

    tearDown: function() {
        this.model.removeEvents('change');
    }
});