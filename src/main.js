// file for package.json npm inclusion of the whole project
var Epitome = require('./epitome');

// go without sync by default.
Epitome.Model = require('./epitome-model');
Epitome.Collection = require('./epitome-collection-sync');
Epitome.View = require('./epitome-view');