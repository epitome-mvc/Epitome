var m = new Epitome.Model.Sync({
    urlRoot: 'data/',
    id: '1231231'
}, {
    onChange: function() {
        console.log(arguments);
    },
    'onChange:foo': function(value) {
        console.log('foo is happening!', value);
    },
    onSync: function() {
        console.log('hi');
    }

});


m.set('foo', 'bar');
m.fetch();