;(function(exports) {

	var Epitome = typeof require == 'function' ? require('./epitome') : exports.Epitome;

	// improve the default substitute so it's deep.
	String.implement({
		substitute: function(object, regexp) {
			return String(this).replace(regexp || (/\\?\{([^{}]+)\}/g), function(match, name) {
				if (match.charAt(0) == '\\') return match.slice(1);
				if (object[name] != null) return object[name];

				var retStr = "",
					path = name.split('.'),
					length = path.length,
					sub = object,
					i = 0;

				if (length <= 1)
					return retStr;

				for (;i < length; i++) {
					if((sub = sub[path[i]]) == null) return retStr;
				}
				return sub;
			});
		}
	});

	Epitome.Template = {
		// return a compiled template via string sub.
		compile: function(html, data) {
			return html.substitute(data);
		}
	};

	if (typeof define === 'function' && define.amd) {
		define('epitome-template', function() {
			return Epitome;
		});
	}
	else if (typeof module === 'object') {
		module.exports = Epitome;
	}
	else {
		exports.Epitome = Epitome;
	}
}(this));
