var m = new Epitome.Model({
    foo: 'foo was here'
}, {
    onChange: function() {
        console.log(arguments);
    },
    'onChange:foo': function(value) {
        console.log('foo is happening!', value);
    }
});


m.set('foo', 'bar');
console.log(m.toJSON());