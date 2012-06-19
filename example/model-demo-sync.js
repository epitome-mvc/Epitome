// define a prototype for our model. You can just make an instance of Model but this is cleaner
var testModel = new Class({

    Extends: Epitome.Model.Sync,

    options: {
        defaults: {
            urlRoot: 'data/',
            id: '1231231'
        }
    }
});



var testInstance = new testModel({
    initial: 'data'
}, {
    onChange: function() {
        console.log(arguments);
    },
    'onChange:foo': function(value) {
        console.log('foo is happening!', value);
    },
    onSync: function(resp, method) {
        console.log('hi, you just did a ' + method);
    },
    onSave: function() {
        console.log('saved');
    },
    onUpdate: function() {
        console.log('updated');
        // final data...
        console.log(this.toJSON())
    },
    onCreate: function() {
        console.log('created for the first time');
    }
});


console.log(testInstance.toJSON())

// careful - here be dragons. shared single request instance
// this should be event-driven and not chained, but it's an example of the api.

// get a model from the server
testInstance.fetch();

// do some changes
testInstance.set('foo', 'bar');

// first save, should fire a create
testInstance.save.delay(1000, testInstance);

// second save is an update
testInstance.save.delay(3000, testInstance);