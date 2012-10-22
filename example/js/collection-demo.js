var testModel = new Class({

	Extends: Epitome.Model

});

var testCollectionProto = new Class({

	Extends: Epitome.Collection,

	model: testModel
});

var testCollection = new testCollectionProto([{
	id: '3',
	name: 'coda',
	surname: 'christoff',
	foo: {
		bar: 1
	}
}, {
	id: '4',
	name: 'not coda',
	surname: 'not christoff',
	foo: {
		bar: 2
	}
}, {
	id: '5',
	name: 'bob',
	surname: 'not christoff'
}]);


console.log(testCollection.find('[name=coda],[surname="not christoff"][id!=5]'));
console.log(testCollection.find('[name*=coda][surname^="christoff"]'));
console.log(testCollection.find('#5,[name=bob]'));
console.log(testCollection.findOne('[name=bob]'));
console.log('with tag and value of sub property', testCollection.find('foo[bar=1]'));
console.log('with tag only', testCollection.find('foo'));
