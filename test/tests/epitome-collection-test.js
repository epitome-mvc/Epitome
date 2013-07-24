if (typeof require === 'function'){
	var Epitome = require('../../src/main'),
		buster = require('buster');
}

buster.testRunner.timeout = 1000;

buster.testCase('Basic Epitome empty collection creation >', {
	setUp: function(){
		this.Collection = new Class({
			Extends: Epitome.Collection,

			foo: function(){

			},

			onChange: function(){
				console.log('hai')
			}
		});

		this.collection = new this.Collection();
		this.model = new Epitome.Model({
			hello: 'there'
		});

	},

	tearDown: function(){
		this.collection.off('add');
		this.collection.off('remove');
	},

	'Expect a collection to be created >': function(){
		buster.assert.isTrue(instanceOf(this.collection, Epitome.Collection));
	},

	'Expect a collection to have legth of 0 >': function(){
		buster.assert.equals(this.collection.length, 0);
	},

	'Expect adding models to collection to fire onAdd event >': function(){
		var self = this;
		this.collection.on('add', function(model){
			buster.assert.equals(model, self.model);
		});

		this.collection.addModel(this.model);
	},

	'Expect not to be able to add the same model twice to the collection >': function(){
		this.collection.addModel(this.model);
		this.collection.addModel(this.model);
		buster.assert.equals(this.collection.length, 1);
	},

	'Expect adding a model with the same cid twice to fire an add:error event >': function(){
		var spy = this.spy();
		this.collection.on('add:error', spy);
		this.collection.addModel(this.model);
		this.collection.addModel(this.model);
		buster.assert.calledWith(spy, this.model);
	},

	'Expect adding a model with the same cid with a replace flag to work >': function(){
		var spy = this.spy(),
			fakeModel = new Epitome.Model({
				id: 'hello'
			});

		this.model.set('id', 'hello');
		this.collection.addModel(this.model);
		this.collection.on('add', spy);
		this.collection.addModel(fakeModel, true);
		buster.assert.calledWith(spy, fakeModel);
	},

	'Expect reset to empty collection first and then add new models >': function(){
		this.collection.addModel(this.model);

		this.collection.reset({
			hello: 'again'
		});

		buster.assert.equals(this.model.collections.length, 0);
		buster.assert.equals(this.collection.length, 1);
	},

	'Expect adding a model via an object only to create a model and add it >': function(){
		var data = {
			id: 'hello'
		};

		this.collection.addModel(data);
		buster.assert.isTrue(instanceOf(this.collection.getModelByCID(data.id), this.collection.model));
	},

	'Expect adding a model to fire onReset >': function(){
		var data = {
			id: 'hello'
		}, spy = this.spy();

		this.collection.on('reset', spy);
		this.collection.addModel(data);
		buster.assert.called(spy);
	},

	'Expect removing a model to fire onReset >': function(){
		var spy = this.spy();
		this.collection.on('reset', spy);
		this.collection.removeModel(this.model);
		buster.assert.called(spy);
	},

	'Expect removing models to collection to fire onRemove event >': function(){
		var self = this;
		this.collection.addModel(this.model);
		this.collection.on('remove', function(model){
			buster.assert.equals(model, self.model);
		});
		this.collection.removeModel(this.model);
	},

	'Expect to be able to remove multiple models at the same time >': function(){
		var self = this,
			model2 = new Epitome.Model({
				hai: 'mum'
			});
		this.collection.addModel(this.model);
		this.collection.addModel(model2);
		this.collection.on('reset', function(models){
			buster.assert.equals(models.length, 2);
		});
		this.collection.removeModel([this.model, model2]);
	},

	'Expect to be able to add models to the collection >': function(){
		var models = this.collection.length;
		this.collection.addModel(this.model);
		buster.assert.equals(this.collection.length, models + 1);
	},

	'Expect to be able to remove models from the collection >': function(){
		var modelsCount = this.collection._models.length;
		this.collection.addModel(this.model);
		this.collection.removeModel(this.model);
		buster.assert.equals(this.collection.length, modelsCount);
	},

	'Expect to be able to get a model from collection by id': function(){
		var fakeModel = new Epitome.Model({
			id: 'hello'
		});

		this.collection.addModel(fakeModel);
		buster.assert.equals(fakeModel, this.collection.getModelById(fakeModel.get('id')));
	},

	'Expect to be able to get a model from collection by cid': function(){
		var fakeModel = new Epitome.Model({
			id: 'hello'
		});

		this.collection.addModel(fakeModel);
		buster.assert.equals(fakeModel, this.collection.getModelByCID(fakeModel.get('id')));
	}

});


buster.testCase('Basic Epitome collection with a model creation >', {
	setUp: function(){
		this.Collection = new Class({
			Extends: Epitome.Collection,

			options: {
				onChange: function(){
					this.change.apply(this, arguments)
				}
			},

			change: function(model, key){
				// console.log(model.cid, key, model.get(key));
			}
		});

		this.model = new Epitome.Model({
			hello: 'there'
		});

		this.models = [this.model];

		this.collection = new this.Collection(this.models);
	},

	tearDown: function(){
		this.collection.off('add');
		this.collection.off('remove');
	},

	'Expect models to be equal to number passed in constructor >': function(){
		buster.assert.equals(this.collection._models.length, this.models.length);
	},

	'Expect onChange on a model to fire for collection >': function(){
		var self = this;
		this.collection.on('change', function(model, props){
			buster.assert.equals(model, self.model);
		});
		this.model.set('foo', 'bar');
	},

	'Expect any Event on any model to fire for collection observer >': function(){
		var self = this,
			event = String.uniqueID();
		this.collection.on(event, function(model){
			buster.assert.equals(model, self.model);
		});
		this.model.trigger(event);
	},

	'Expect a model that has been destroyed to be removed from the collection >': function(){
		var temp = new Epitome.Model({
			id: 'hai'
		});

		this.collection.addModel(temp);
		temp.destroy();
		buster.refute.equals(temp, this.collection.getModelById('hai'));
	},

	'A model should be able to exist in 2 collections and the event emitter should work when removed from either one >': function(){
		var c2 = new this.Collection(this.models),
			spy = this.spy();
		this.collection.on('change', spy);
		c2.removeModel(this.model);
		this.model.set('foo', 'bar');
		buster.assert.called(spy);
	},

	'Adding a model to a collection should include the collection instance in the model.collections array >': function(){
		buster.assert.isTrue(this.model.collections.contains(this.collection));
	},

	'Removing a model from a collection should also remove the collection instance in the model.collections array >': function(){
		this.collection.removeModel(this.model);
		buster.refute.isTrue(this.model.collections.contains(this.collection));
	}

});


buster.testCase('Basic Epitome collection array methods >', {
	setUp: function(){
		this.Collection = new Class({
			Extends: Epitome.Collection
		});

		this.model = new Epitome.Model({
			hello: 'there'
		});

		this.models = [this.model];

		this.collection = new this.Collection(this.models);
	},

	tearDown: function(){
		this.collection.off();
	},

	'Expect toJSON to return an array of all models\' dereferenced objects >': function(){
		buster.assert.equals(this.collection.toJSON().length, this.collection.length);
	},

	'Expect Array method .each to work on the collection >': function(){
		var spy = this.spy();

		this.collection.each(spy);
		buster.assert.calledWith(spy, this.model, 0);
	},

	'Expect Array method .invoke to work on the collection >': function(){
		this.collection.invoke('set', {
			testing: 123
		});
		buster.assert.equals(this.model.get('testing'), 123);
	},

	'Expect Array method .map to work on the collection >': function(){
		this.collection.map(function(el, index){
			el.cid = index;
		});
		buster.assert.equals(this.model.cid, 0);
	},

	'Expect Array method .filter to work on the collection >': function(){
		var cid = 'testsftw';

		this.collection.addModel({
			id: cid
		});

		var models = this.collection.filter(function(el){
			return el.cid == cid;
		});

		buster.assert.equals(models.length, 1)
	},

	'Expect Array method .contains to work on the collection >': function(){
		buster.assert.isTrue(this.collection.contains(this.model));
	},

	'Expect Array method .indexOf to work on the collection >': function(){
		buster.assert.equals(this.collection.indexOf(this.model), 0);
	},

	'Expect Array method .getRandom to work on the collection >': function(){
		buster.assert.equals(this.collection.getRandom(), this.model);
	},

	'Expect Array method .reverse to reverse the order of models in the collection >': function(){
		this.collection.empty();

		this.collection.addModel({
			id: 300,
			name: 'A'
		});

		this.collection.addModel({
			id: 200,
			name: 'B'
		});

		this.collection.addModel({
			id: 400,
			name: 'C'
		});

		this.collection.reverse();

		var changed = this.collection.toJSON().map(function(el){
			return el.name;
		}).join(','); // should be "C,B,A"

		buster.assert.equals(changed, 'C,B,A');
	},

	'Expect .sort("key") to sort the collection by that model property >': function(){
		this.collection.empty();

		this.collection.addModel({
			id: 300,
			name: 'A'
		});

		this.collection.addModel({
			id: 200,
			name: 'B'
		});

		this.collection.addModel({
			id: 400,
			name: 'C'
		});

		var current = this.collection.toJSON().map(function(el){
			return el.name;
		}).join(','); // should be "A,B,C"

		this.collection.sort('id');

		var changed = this.collection.toJSON().map(function(el){
			return el.name;
		}).join(','); // should be "B,A,C"

		buster.refute.equals(current, changed);
	},

	'Expect .empty() to remove all models from collection >': function(){
		this.collection.empty();

		this.collection.addModel({
			id: 300,
			name: 'A'
		});

		this.collection.addModel({
			id: 200,
			name: 'B'
		});

		this.collection.addModel({
			id: 400,
			name: 'C'
		});

		this.collection.empty();
		buster.assert.equals(this.collection.length, 0);
	},


	'Expect .sort("key1,key2") to sort the collection by both model properties >': function(){
		this.collection.empty();

		this.collection.addModel({
			id: 300,
			name: 'B',
			type: 'one'
		});

		this.collection.addModel({
			id: 200,
			name: 'B',
			type: 'two'
		});

		this.collection.addModel({
			id: 10,
			name: 'A',
			type: 'one'
		});

		var current = this.collection.toJSON().map(function(el){
			return el.id;
		}).join(','); // should be "300,200,10"

		this.collection.sort('type,name,id:desc');

		var changed = this.collection.toJSON().map(function(el){
			return el.id;
		}).join(','); // should be "10,300,200"

		buster.refute.equals(current, changed);
	},


	'Expect .sort("key:desc") to sort the collection by that model property in reverse >': function(){
		this.collection.empty();

		this.collection.addModel({
			id: 300,
			name: 'A'
		});

		this.collection.addModel({
			id: 200,
			name: 'B'
		});

		this.collection.addModel({
			id: 400,
			name: 'C'
		});

		this.collection.sort('id:desc');

		var changed = this.collection.toJSON().map(function(el){
			return el.name;
		}).join(','); // should be "C,A,B"

		buster.assert.equals(changed, 'C,A,B');
	},

	'Expect .reverse to sort the array in reverse and fire a sort event >': function(done){
		this.collection.empty();

		this.collection.addModel({
			id: 300,
			name: 'A'
		});

		this.collection.addModel({
			id: 200,
			name: 'B'
		});

		this.collection.addModel({
			id: 400,
			name: 'C'
		});

		this.collection.on('sort', function(){
			var changed = this.toJSON().map(function(el){
				return el.name;
			}).join(','); // should be "C,B,A"

			buster.assert.equals(changed, 'C,B,A');
			done();
		});

		this.collection.reverse();
	}

});


buster.testCase('Basic Epitome collection.find >', {
	setUp: function(){
		this.Collection = new Class({
			Extends: Epitome.Collection
		});

		this.models = [
			{
				name: 'bob',
				surname: 'roberts',
				type: {
					role: 'admin'
				}
			},
			{
				name: 'robert',
				surname: 'roberts',
				type: {
					role: 'user'
				}
			},
			{
				name: 'Robert',
				surname: 'Roberts'
			},
			{
				name: 'just bob'
			},
			{
				id: 'special',
				surname: 'just roberts'
			}
		];

		this.collection = new this.Collection(this.models);
	},

	'Expect search by existence of a model attribute [attr] to return matching models >': function(){
		buster.assert.equals(this.collection.find('[name]').length, 4);
	},

	'Expect search by deeper object property for type to return matching models >': function(){
		buster.assert.equals(this.collection.find('type').length, 2);
	},

	'Expect search by deeper object property for type.role to return matchign models >': function(){
		buster.assert.equals(this.collection.find('type[role]').length, 2);
	},

	'Expect search by deeper object property for type.role=admin to return matchign models >': function(){
		buster.assert.equals(this.collection.find('type[role=admin]').length, 1);
	},

	'Expect search by existence of a model attribute [attr] not to return if not found >': function(){
		buster.assert.equals(this.collection.find('[foo]').length, 0);
	},

	'Expect search by existence of multiple model attributes [attr1][attr2] to return matching models >': function(){
		buster.assert.equals(this.collection.find('[name][surname]').length, 3);
	},

	'Expect search by exact model attributes [attr=value] to return matching models >': function(){
		buster.assert.equals(this.collection.find('[name=bob]').length, 1);
	},

	'Expect search by exact model attributes [attr=invalid] not to return a matching model >': function(){
		buster.assert.equals(this.collection.find('[name=invalid]').length, 0);
	},

	'Expect search by exact model attributes [attr=WrongCase] not to return a matching model >': function(){
		buster.assert.equals(this.collection.find('[name=Bob]').length, 0);
	},

	'Expect search by exact model multiple attributes [attr1=value][attr2=value] to return matching models >': function(){
		buster.assert.equals(this.collection.find('[name=bob][surname=roberts]').length, 1);
	},

	'Expect search by exact model multiple attributes via OR [attr1=value1],[attr1=value2] to return matching models >': function(){
		buster.assert.equals(this.collection.find('[name=bob],[name=robert]').length, 2);
	},

	'Expect search by excluding model attributes [attr!=value] to return all matching models >': function(){
		buster.assert.equals(this.collection.find('[surname!=roberts]').length, 2);
	},

	'Expect search by substring model attributes starts with [attr^=val] to return matching models >': function(){
		buster.assert.equals(this.collection.find('[name^=bob]').length, 1);
	},

	'Expect search by substring model attributes containing with [attr*=val] to return matching models >': function(){
		buster.assert.equals(this.collection.find('[name*=bob]').length, 2);
	},

	'Expect search by substring model attributes ending with [attr$=val] to return matching models >': function(){
		buster.assert.equals(this.collection.find('[name$=bob]').length, 2);
	},

	'Expect search by #id to return models matching that id >': function(){
		buster.assert.equals(this.collection.find('#special').length, 1);
	},

	'Expect search by #id and attribute with #id[attr*=value] to return models matching  >': function(){
		buster.assert.equals(this.collection.find('#special[surname*=roberts]').length, 1);
	},

	'Expect search via .findOne to return a single model >': function(){
		buster.assert.isTrue(instanceOf(this.collection.findOne('[name=bob]'), Epitome.Model));
	},

	'Expect search via .findOne when no match to return null >': function(){
		buster.assert.equals(this.collection.findOne('[name=notbob]'), null);
	}

});
