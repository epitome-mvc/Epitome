buster.testRunner.timeout = 1000;


buster.testCase('Epitome model sync >', {
    setUp: function() {
        this.dataInitial = {
            foo: 'bar',
            id: '1234-5123/response.json',
            urlRoot: 'example/data/'
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

        this.model = new Epitome.Model.Sync(this.dataInitial, this.options);
    },

    tearDown: function() {
        this.model.removeEvents('change');
    },

    'Expect the model to have a request >': function() {
        buster.assert.isTrue(instanceOf(this.model.request, Request));
    },

    'Expect the urlRoot to return correctly >': function() {
        buster.assert.equals(this.model.get('urlRoot'), this.dataInitial.urlRoot);
    },

    'Expect a fetch to return our model >': function(done) {

        this.model.addEvent('sync', function(response, method, data) {
            buster.assert(true);
            done();
        });
        this.model.fetch();
    }
});