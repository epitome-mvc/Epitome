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
}]);


testCollection.find('name=christoff');
testCollection.find('[name=christoff],[surname]');


