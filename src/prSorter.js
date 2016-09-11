function PRSorter (window, $) {
	var lis = [];
	var originalLis = [];
	var sortAsc = true;
	var numOfPagesDirty = undefined;
	var numOfMorePagesInput 	= '<div class="float-left select-menu js-menu-container js-select-menu">' +
									'<input class="form-control subnav-search-input" type="number" min="0" id="morePages" placeholder="# of additional pages" style="width: 145px; margin-top: 7px; padding: 0 5px;" />' +
								  '</div>';
	var sortButton 				= '<div id="sortByMerged" class="float-left select-menu js-menu-container js-select-menu">' +
									'<button class="btn-link" style="color: #090; margin-left: 5px;">Sort by Merged</button>' +
								  '</div>';

	function bindEvents () {
		if (window.location.pathname.indexOf('/pulls') > -1) {
			lis = [];
			sortAsc = true;

			var buttonsBox = $('.table-list-header .table-list-header-toggle:eq(1)');
			buttonsBox.prepend(sortButton);
			buttonsBox.prepend(numOfMorePagesInput);

			$('#sortByMerged').on('click', onSortByMerged);

			var ul = $('ul.Box-body');
			originalLis = ul.children('li').clone();
		}
	}

	function unbindEvents () {
		$('#sortByMerged').off('click', onSortByMerged);
	}

	function onSortByMerged () {
		$('ul.Box-body').empty();
		var pagesToLoad = parseInt($('#morePages').val()) || 0;

		if (pagesToLoad !== numOfPagesDirty) {

			numOfPagesDirty = pagesToLoad;
			lis = originalLis.clone();
			sortAsc = false;

		} else {

			sortAsc = !sortAsc;
			pagesToLoad = 0;
		}

		if (pagesToLoad > 0) {

			loadMorePages(pagesToLoad)
				.then(function () {
					sortLis();
				});

		} else {
			sortLis();
		}
	}

	function sortLis () {
		lis.detach().sort(function(a, b) {
			var aDatetime = $(a).find('relative-time').attr('datetime');
			var bDatetime = $(b).find('relative-time').attr('datetime');

			if (sortAsc) {
				return moment(aDatetime, "YYYY-MM-DDTHH:mm:ss").valueOf() - moment(bDatetime, "YYYY-MM-DDTHH:mm:ss").valueOf();
			} else {
				return moment(bDatetime, "YYYY-MM-DDTHH:mm:ss").valueOf() - moment(aDatetime, "YYYY-MM-DDTHH:mm:ss").valueOf();
			}
		});

		var ul = $('ul.Box-body');
		ul.append(lis);
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

	return {
		bindEvents: bindEvents,
		unbindEvents: unbindEvents
	};
}