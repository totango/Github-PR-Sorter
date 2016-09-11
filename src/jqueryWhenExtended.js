/**
 * Extending $.when to support array of promises
 */
(function ($) {
	var rawWhen = $.when;
	$.when = function (promise) {
		if ($.isArray(promise)) {
			var dfd = new jQuery.Deferred();
			rawWhen.apply($, promise).done(function () {
				dfd.resolve(Array.prototype.slice.call(arguments));
			}).fail(function () {
				dfd.reject(Array.prototype.slice.call(arguments));
			});
			return dfd.promise();
		} else {
			return rawWhen.apply($, arguments);
		}
	}
})($);