(function (window, $) {
	var sorter = new PRSorter(window, $);

	var $divLoaderBar = $("#js-pjax-loader-bar");
	var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.attributeName === "class") {
				var attributeValue = $(mutation.target).prop(mutation.attributeName);
				if (attributeValue.indexOf('is-loading') === -1) {

					sorter.bindEvents();
				} else {

					sorter.unbindEvents();
				}
			}
		});
	});

	observer.observe($divLoaderBar[0], {
		attributes: true
	});

	sorter.bindEvents();

})(window, $);