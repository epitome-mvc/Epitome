// file for package.json npm inclusion of the whole project
var Epitome = require('./epitome');

// go without sync by default.
require('./epitome-model');
require('./epitome-collection-sync');
require('./epitome-view');