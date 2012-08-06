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
	surname: 'christoff'
}, {
	id: '4',
	name: 'not coda',
	surname: 'not christoff'
}, {
	id: '5',
	name: 'bob',
	surname: 'not christoff'
}]);


console.log(testCollection.find('[name=coda],[surname="not christoff"][id5]'));
console.log(testCollection.find('[name=coda][surname="christoff"]'));


