(function (window) {
	var lis = [];
	var sortDesc = true;
	var numOfMorePages = '<div class="float-left select-menu js-menu-container js-select-menu">' +
						'<input class="form-control subnav-search-input" type="number" min="0" id="morePages" placeholder="# of additional pages" style="width: 180px; margin-top: 7px;" />' +
					 '</div>';
	var sortButton = '<div id="sortByMerged" class="float-left select-menu js-menu-container js-select-menu">' +
						'<button class="btn-link js-menu-target" style="color: #090; margin-left: 5px;">Sort by Merged</button>' +
					 '</div>';


	var $divLoaderBar = $("#js-pjax-loader-bar");
	var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.attributeName === "class") {
				var attributeValue = $(mutation.target).prop(mutation.attributeName);
				if (attributeValue.indexOf('is-loading') === -1) {

					bindEvents();
				} else {
					unbindEvents();
				}
			}
		});
	});
	observer.observe($divLoaderBar[0], {
		attributes: true
	});

	bindEvents();

	function bindEvents () {
		if (window.location.pathname.indexOf('/pulls') > -1) {
			lis = [];
			sortDesc = true;

			var buttonsBox = $('.table-list-header .table-list-header-toggle:eq(1)');
			buttonsBox.prepend(sortButton);
			buttonsBox.prepend(numOfMorePages);

			$('#sortByMerged').on('click', sortByMerged);
		}
	}

	function unbindEvents () {
		$('#sortByMerged').off('click', sortByMerged);
	}

	function sortByMerged () {
		sortDesc = !sortDesc;

		if (lis.length === 0) {
			initLis();

			var numOfMorePages = parseInt($('#morePages').val()) || 0;
			if (numOfMorePages > 0) {
				loadMorePages(numOfMorePages)
					.then(function () {
						sortLis();
					});

			} else {
				sortLis();
			}
		} else {
			sortLis();
		}
	}

	function sortLis () {
		lis.detach().sort(function(a, b) {
			var aDatetime = $(a).find('relative-time').attr('datetime');
			var bDatetime = $(b).find('relative-time').attr('datetime');

			if (sortDesc) {
				return moment(aDatetime, "YYYY-MM-DDTHH:mm:ss").valueOf() - moment(bDatetime, "YYYY-MM-DDTHH:mm:ss").valueOf();
			} else {
				return moment(bDatetime, "YYYY-MM-DDTHH:mm:ss").valueOf() - moment(aDatetime, "YYYY-MM-DDTHH:mm:ss").valueOf();
			}
		});

		var ul = $('ul.Box-body');
		ul.append(lis);
	}

	function initLis() {
		var ul = $('ul.Box-body');
		lis = ul.children('li');
	}

	function loadMorePages (numOfPages) {
		var promises = [];

		for (var i = 0; i < numOfPages; i++) {
			promises.push(loadPage(i + 2));
		}

		return $.when(promises);
	}

	function loadPage (pageNumber) {
		var url = $('a.next_page').attr('href');
		url = url.replace('page=2', 'page=' + pageNumber);

		return $.get(url)
			.then(function (response) {
				var sortedHiddenDivStr = "<div style='display: none;' id='sortedHiddenDiv-"+ pageNumber +"'></div>";
				$('body').append(sortedHiddenDivStr);
				var sortedHiddenDiv = $('#sortedHiddenDiv-' + pageNumber);
				sortedHiddenDiv.append($(response));
				var moreLis = sortedHiddenDiv.find('ul.Box-body li');
				moreLis.detach();

				$.each(moreLis, function (i, li) {
					lis.push(li);
				});

				sortedHiddenDiv.remove();
			});
	}


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

})(window);