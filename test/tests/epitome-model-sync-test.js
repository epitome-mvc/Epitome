if (typeof require === 'function'){
	var Epitome = require('../../src/main'),
		buster = require('buster-sinon');
}

buster.testRunner.timeout = 1000;

buster.testCase('Epitome model sync >', {
	setUp: function(){
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
			onSync: function(responseObj, method, data){

			},
			defaults: {
				foo: 'not bar',
				name: 'bob'
			},
			headers: {
				'X-Requested-With': 'Epitome'
			}
		};

		this.model = new Epitome.Model.Sync(this.dataInitial, this.options);
	},

	tearDown: function(){
		this.model.off('change');
		this.model.off('sync');
		this.model.off('update');
		this.model.off('create');

		delete this.model.isNewModel;
		// this.model._attributes = {};
		this.server && this.server.restore();
	},

	'Expect the model to have a request >': function(){
		buster.assert.isTrue(instanceOf(this.model.request, Request));
	},

	'Expect the urlRoot to return correctly >': function(){
		buster.assert.equals(this.model.get('urlRoot'), this.dataInitial.urlRoot);
	},

	'Expect a fetch to return our model >': function(done){

		this.model.on('sync', function(response, method, data){
			buster.refute.isNull(response);
			done();
		});
		this.model.fetch();
	},

	'Expect model.isNew() to return false if the model has an id >': function(){
		// reset it.
		buster.refute.isTrue(this.model.isNew())
	},

	'Expect model.isNew() to return true if the model has no id and not sync\'d before >': function(){
		// reset it.
		this.model.set('id', null);
		buster.assert.isTrue(this.model.isNew());
	},

	'Expect a save to `create` our model when it is new >': function(done){
		// only works when the model has no id but this means it won't fire request anyway due to buster test
		// bed for the ajax. simulate it and rely on isNew to help
		this.model.isNewModel = true;

		this.model.on('create', function(){
			buster.assert(true);
			done();
		});
		this.model.save();
	},

	'Expect a second save to `update` our model >': function(done){
		var model = this.model;

		model.on({
			'update': function(){
				buster.assert(true);
				done();
			},
			'create': function(){
				this.save.delay(500, this);
			}
		});

		model.save();
	},

	'Expect a fetch to return our model id as per static response.json >': function(done){
		var id = this.model.get('id');

		this.model.on('sync', function(response, method, data){
			buster.assert.equals(response.id, id);
			done();
		});
		this.model.fetch();
	},

	'Expect a fetch update our model properties to as per static response.json and fire change events >': function(done){
		var oldFoo = this.model.get('foo');

		this.model.on('change:foo', function(newValue){
			buster.refute.equals(newValue, oldFoo);
			done();
		});

		// a change event will occur if foo differs after fetch
		this.model.fetch();
	},

	'Expect the pre-processing sync parser to be able to modify data before it is being sent >': function(done){

		var protoModel = new Class({

			Extends: Epitome.Model.Sync,

			preProcessor: function(obj){
				buster.assert(true);
				done();
				return obj;
			}
		});

		var protoInstance = new protoModel(this.dataInitial, this.options);
		protoInstance.save();
	},

	'Expect the post-processing parser to get the object before the model does after a sync >': function(done){

		var protoModel = new Class({

			Extends: Epitome.Model.Sync,

			postProcessor: function(obj){
				buster.assert(true);
				done();
			}
		});

		var protoInstance = new protoModel(this.dataInitial, this.options);
		protoInstance.fetch();
	},

	'Expect the post-processing parser to precede model sets/changes >': function(done){

		var spy = this.spy(),
			protoModel = new Class({

				Extends: Epitome.Model.Sync,

				postProcessor: function(obj){
					delete obj.foo;
					return obj
				}
			});

		var protoInstance = new protoModel(this.dataInitial, {
			onFetch: function(){
				buster.refute.called(spy);
				done();
			}
		});

		// it should change but for the processor disallowing it. mocker sends
		protoInstance.set('foo', 'changeme');

		// add the spy which should not work.
		protoInstance.on('change:foo', spy);

		// this will get an object with id and foo properties. if it works, should NOT change foo as pre-processor removes it
		protoInstance.fetch();
	},

	'Expect model.destroy() to fire the destroy method and delete the model >': function(done){
		this.model.on('destroy',function(){
			buster.assert(true);
			done();
		}).destroy();
	},

	'Expect onSync to fire after DELETE with response 204 and no data >': function(done){
		this.server = sinon.fakeServer.create();
		this.server.autoRespond = true;

		this.server.respondWith(
			'models/1/',
			[204, {"content-type": "application/json"}, '']
		);

		this.model = new Epitome.Model.Sync({
			urlRoot: 'models/',
			id: 1
		});

		this.model.on('sync', function(){
			buster.assert(true);
			done();
		});

		this.model.delete_();

		this.server.respond();
	},

	'Expect request headers to get passed to request instance >': function(){
		this.model = new Epitome.Model.Sync({
			urlRoot: 'models/',
			id: 1
		}, this.options);

		buster.assert.equals(this.model.request.headers['X-Requested-With'], 'Epitome');
	}

});