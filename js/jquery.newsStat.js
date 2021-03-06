	(function($){
		$.fn.news_stat = function(opts){
		opts = $.extend({}, $.fn.news_stat.defaults, opts);
			return this.each(function(){
				$.fn.news_stat.instances[$(this).attr('id')] = new NewsStat(this, opts, $(this).attr('id') );
				return $.fn.news_stat.instances[$(this).attr('id')];
			});
		};

		$.fn.news_stat.instances = new Object();
		$.fn.news_stat_refresh = function(){
			
		};

		// default options
		$.fn.news_stat.defaults = {
			'viewsStatContainer' : 'viewsStat',
			'commentsStatContainer' : 'commentsStat',
			'headerContainer' : 'header',
			'viewsGraphContainer' : 'viewsStatGraph',
			'commentsGraphContainer' : 'commentsStatGraph',
			'topItemClass' : 'statConainer-top-list-item',
			'topItemHeight' : 30,
			'todayCountClass' : 'statConainer-today-count',
			'yesterdayCountClass' : 'statConainer-yesterday-count',
			'recordCountClass' : 'recordCount',
			'lowCountClass' : 'lowCount',
			'newestItemClass' : 'newestItemClass',
			'oddClass' : 'odd',
			'perfectClass' : 'perfect',
			'perfectDarkClass' : 'perfectOdd',
			'animationSpeed' : 250,
			'feedContainer' : 'feed',
			'header' : 'head',
			'headerClass' : 'pageTitle',
			'statData' : [],
			'feedData' : [],
			'feed' : 'feed',
			'feedItemClass' : 'feed-list-item',
			'feedItemHeight' : 50,
			'graphOptions' : {
				width: 640,
				height: 480,
				vAxis: {title: ""},
				hAxis: {title: "дата"},
				seriesType: "bars",
				series: {1: {type: "line"}},
				animation:{
					duration: 1000,
					easing: 'out'
				},
				colors:['#D1DBBC','#004411']
			},
			'currentSectionId' : '',
			'currentSectionName' : '',
			'refreshStatInterval' : 10000,
			'refreshFeedInterval' : 15000,
			'reloadPageInterval' : 3600
			
		};

		var NewsStat = function(obj, o, instance_id){
		    var header = $("#"+o.headerContainer).find("h1");
		    var viewsStatContainer = $("#"+o.viewsStatContainer);
		    var viewsGraph = false;
		    var viewsCurrent = $(viewsStatContainer).find(".statConainer-current");
		    var viewsTop = $(viewsStatContainer).find(".statConainer-top-list");

		    var commentsStatContainer = $("#"+o.commentsStatContainer);
		    var commentsGraph = false;
		    var commentsCurrent = $(commentsStatContainer).find(".statConainer-current");
		    var commentsTop = $(commentsStatContainer).find(".statConainer-top-list");
		    
		    var feedContainer = $("#"+o.feed).find(".feed-list");
		    
		    var statData = o.statData;
		    var feedData = o.feedData;
		    
		    var currentSectionId = o.currentSectionId;
		    var currentSectionName = o.currentSectionName;

		    var refreshFeed = function () {
                $.ajax({
                    url: '?action=updateFeed',
                    type: 'post',
                    data: {},
                    dataType: 'json',
                    success: function(data) {
                    	updateFeed(data, feedContainer);
                    }
                });
		    }
		    
		    var gotoNextSection = function () {
                $.ajax({
                    url: '?currentSectionId='+currentSectionId+'&action=next',
                    type: 'post',
                    data: {},
                    dataType: 'json',
                    success: function(data) {
                    	refreshStat(data);
                    }
                });

		    }
		    
		    var refreshStat = function (data) {
			    currentSectionId = data.currentSectionId;
			    currentSectionName = data.currentSectionName;

			    refreshHeader(currentSectionName);
			    refreshCurrent(data, viewsCurrent, 'views');
			    refreshCurrent(data, commentsCurrent, 'comments');
		    	refreshGraph(data['viewsStat'], viewsGraph, 'views');
		    	refreshGraph(data['commentsStat'], commentsGraph, 'comments');
		    	refreshTop(data['viewsTop'], viewsTop, 'views');
		    	setTimeout (function(){
			    	refreshTop(data['commentsTop'], commentsTop, 'comments');
		    	}, o.animationSpeed);
		    }
		    
		    var refreshHeader = function (newName) {
		    	headerContainer = $("#"+o.header).find("."+o.headerClass);
		    	
		    	div1 = $("<h1>");
				div1.addClass(o.headerClass);
				div1.addClass('newItem');
				div1.css('height', '1px');
				div1.html(currentSectionName);
				headerContainer.after(div1);

		    	newHeader = headerContainer.next();
				height = headerContainer.css('height');

				$(headerContainer).animate({
				    height: 'toggle'
				  }, o.animationSpeed*2).delay(o.animationSpeed*2).remove();

				newHeader.removeClass('newItem');
				newHeader.animate({
   					    height: height
   					  }, o.animationSpeed*2);
		    }		    
		    var refreshCurrent = function (data, obj, type) {
		    	type = type ? type : 'views';
		    	if (type == 'views')
		    	{
		    		todayIndex = 'todayViews';
		    		yesterdayIndex = 'yesterdayViews';
		    	}
		    	else
		    	{
		    		todayIndex = 'todayComments';
		    		yesterdayIndex = 'yesterdayComments';
		    	}
		    	
		    	todayCount = data[todayIndex];
		    	yesterdayCount = data[yesterdayIndex];
		    	yesterdayCount = Math.abs(yesterdayCount);
		    	todayCount = Math.abs(todayCount);

		    	
		    	todayCountContainer = $(obj).find("."+o.todayCountClass);
		    	yesterdayCountContainer = $(obj).find("."+o.yesterdayCountClass);
		    	
		    	div1 = $("<div>");
				div1.addClass('newItem');
				div1.addClass(o.todayCountClass);
				div1.css('height', '1px');
				htmlCode = todayCount;
				if (todayCount > yesterdayCount)
					addClass = o.recordCountClass;
				else
					addClass = o.lowCountClass;
				div1.addClass(addClass);
				
				div1.html(formatThousands(htmlCode));
				$(todayCountContainer).after(div1);
		    	toggleCurrentRow(obj, o.todayCountClass );
		    	
		    	div2 = $("<div>");
				div2.addClass('newItem');
				div2.addClass(o.yesterdayCountClass);
				div2.css('height', '1px');
				htmlCode = yesterdayCount;
				if (todayCount > yesterdayCount)
					addClass = o.lowCountClass;
				else
					addClass = o.recordCountClass;
				div2.addClass(addClass);
				
				div2.html(formatThousands(htmlCode));
				$(yesterdayCountContainer).after(div2);
				setTimeout(function(){
			    	toggleCurrentRow(obj, o.yesterdayCountClass);
				}, o.animationSpeed*2);

		    }
		    
		    var toggleCurrentRow = function(obj, className, height) {
		    	oldRow = $(obj).find("."+className).eq(0);
		    	newRow = oldRow.next();
				height = $(yesterdayCountContainer).css('height');

				oldRow.animate({
				    height: 'toggle'
				  }, o.animationSpeed*2).delay(o.animationSpeed*2).remove();

		    	newRow.removeClass('newItem');
    			newRow.animate({
   					    height: height
   					  }, o.animationSpeed*2);
		    }
		    
		    var refreshGraph = function (statData, obj, type) {
		    	var data = [];
		    	type = type ? type : 'views';
		    	if (type == 'views')
		    		var rowData1 = [['день', 'просмотров', 'динамика']];
		    	else
		    		var rowData1 = [['день', 'комментариев', 'динамика']];
		    	if (statData)
		    	{
		    		for (i in statData)
		    		{
		    			rowData1.push([statData[i]['date'], statData[i]['count'], statData[i]['average']]); 
		    		}
		    	}
		    	
		    	data[0] = google.visualization.arrayToDataTable(rowData1);

		    	var current = 0;
		    	obj.draw(data[current], o.graphOptions);
		    }

		    var refreshTop = function (data, obj, type) {
		    	type = type ? type : 'views';
		    	$rows = $(obj).find("."+o.topItemClass);
		    	m = $rows.length;
		    	odd = true;
		    	for (i=0; i<m; i++)
		    	{
		    		if ($rows.eq(i))
		    		{
		    			if (data[i])
		    			{
		    				todayCount = type == 'views' ? data[i]['views'] : data[i]['comments'];
		    				allCount = type == 'views' ? data[i]['totalViews'] : data[i]['totalComments'];
		    				todayCount = Math.abs(todayCount);
		    				allCount = Math.abs(allCount);
		    				li = $('<div>');
		    				li.addClass('newItem');
		    				li.addClass(o.topItemClass);
		    				if (allCount > todayCount)
		    				{
			    				if (odd)
				    				li.addClass(o.perfectDarkClass);
			    				else
			    					li.addClass(o.perfectClass);
		    				}
		    				else if (odd)
			    				li.addClass(o.oddClass);
		    						
		    				li.css('height', '1px');
		    				htmlCode = '<div class="statConainer-top-list-today">+'+formatThousands(todayCount)+'</div>';
		    				htmlCode += '<div class="statConainer-top-list-all">'+formatThousands(allCount)+'</div>';
		    				htmlCode += '<a class="statConainer-top-list-link" href="'+data[i]['link']+'">'+data[i]['title']+'</a>';
		    				li.html(htmlCode);
		    				$($rows.eq(i)).after(li);
		    				odd = odd ? false : true;
		    			}
		    		}
		    	}
		    	
		    	if (m < data.length)
		    	{
			    	for (i=m; i<data.length; i++)
			    	{
		    			if (data[i])
		    			{
		    				todayCount = type == 'views' ? data[i]['views'] : data[i]['comments'];
		    				allCount = type == 'views' ? data[i]['totalViews'] : data[i]['totalComments'];
		    				todayCount = Math.abs(todayCount);
		    				allCount = Math.abs(allCount);
		    				li = $('<div>');
		    				li.addClass('newItem');
		    				li.addClass(o.topItemClass);
		    				if (allCount > todayCount)
		    				{
			    				if (odd)
				    				li.addClass(o.perfectDarkClass);
			    				else
			    					li.addClass(o.perfectClass);
		    				}
		    				else if (odd)
			    				li.addClass(o.oddClass);

		    				li.css('height', '1px');
		    				htmlCode = '<div class="statConainer-top-list-today">+'+formatThousands(todayCount)+'</div>';
		    				htmlCode += '<div class="statConainer-top-list-all">'+formatThousands(allCount)+'</div>';
		    				htmlCode += '<a class="statConainer-top-list-link" href="'+data[i]['link']+'">'+data[i]['title']+'</a>';
		    				li.html(htmlCode);
		    				$rows = $(obj).append(li);
		    				odd = odd ? false : true;
		    			}
			    	}
		    	}
		    	
		    	
		    	$rows = $(obj).find("."+o.topItemClass);
		    	$rows.addClass('inProgress');
	    		updateTopRow(obj);
		    }
		    
		    var updateTopRow = function(obj) {
		    	$rows = $(obj).find(".inProgress");
		    	if ($rows.length)
		    	{
		    		if ($rows.eq(0).hasClass('newItem'))
		    		{
		    			$rows.eq(0).removeClass('newItem');
		    			$rows.eq(0).animate({
    					    height: o.topItemHeight+'px'
    					  }, o.animationSpeed);
		    			$rows.eq(0).removeClass('inProgress');
		    		}
		    		else
		    		{
		    			$rows.eq(0).animate({
    					    height: 'toggle'
    					  }, o.animationSpeed);
		    			$rows.eq(0).addClass('processed');
		    			$rows.eq(0).removeClass('inProgress');
		    			nextRow = $rows.eq(0).next();
		    			if (nextRow)
		    			{
		    				if (nextRow.hasClass('newItem'))
		    				{
		    					nextRow.removeClass('newItem');
		    					nextRow.animate({
		    					    height: o.topItemHeight+'px'
		    					  }, o.animationSpeed);
		    					nextRow.removeClass('inProgress');
		    				}
		    			}
		    		}
		    		setTimeout(function(){updateTopRow(obj);}, o.animationSpeed);
		    	}
		    	else
		    	{
			    	$(obj).find(".processed").remove();
		    	}
		    }
		    
		    var updateFeed = function (data, obj) {
		    	$rows = $(obj).find("."+o.feedItemClass);
		    	m = $rows.length;
		    	md5_ar = [];
		    	for (i=0; i<m; i++)
		    	{
		    		if ($rows.eq(i))
		    		{
		    			md5_ar[$rows.eq(i).attr("md5")] = 1;
		    		}
		    	}
		    	
		    	for (i=0; i<m; i++)
		    	{
		    		if ($rows.eq(i))
		    		{
		    			if (data[i])
		    			{
		    				sourceName = data[i]['sourceName'];
		    				sourceLink = data[i]['sourceLink'];
		    				title = data[i]['title'];
		    				link = data[i]['link'];
		    				date = data[i]['date'];
		    				li = $('<li>');
		    				li.addClass('newItem');
		    				li.addClass(o.feedItemClass);
		    				if (md5_ar.length > 0 && !md5_ar[data[i]['md5']])
			    				li.addClass(o.newestItemClass);
		    				li.attr("md5", data[i]['md5']);
		    				li.css('height', '1px');
		    				htmlCode = '<a class="feed-list-itemLink" href="'+link+'">'+title+'</a>';
		    				htmlCode += '<div class="feed-list-itemSource"><span class="feed-list-itemDate">'+date+'</span><a href="'+sourceLink+'">'+sourceName+'</a></div>';
		    				li.html(htmlCode);
		    				$($rows.eq(i)).after(li);
		    			}
		    		}
		    	}
		    	
		    	if (m < data.length)
		    	{
			    	for (i=m-1; i<data.length; i++)
			    	{
		    			if (data[i])
		    			{
		    				sourceName = data[i]['sourceName'];
		    				sourceLink = data[i]['sourceLink'];
		    				title = data[i]['title'];
		    				link = data[i]['link'];
		    				date = data[i]['date'];
		    				li = $('<li>');
		    				li.addClass('newItem');
		    				li.addClass(o.feedItemClass);
		    				if (md5_ar.length > 0 && !md5_ar[data[i]['md5']])
			    				li.addClass(o.newestItemClass);
		    				li.attr("md5", data[i]['md5']);
		    				li.css('height', '1px');
		    				htmlCode = '<a class="feed-list-itemLink" href="'+link+'">'+title+'</a>';
		    				htmlCode += '<div class="feed-list-itemSource"><span class="feed-list-itemDate">'+date+'</span><a href="'+sourceLink+'">'+sourceName+'</a></div>';
		    				li.html(htmlCode);
		    				$rows = $(obj).append(li);
		    			}
			    	}
		    	}
		    	
		    	
		    	$rows = $(obj).find("."+o.feedItemClass);
		    	$rows.addClass('inProgress');
		    	
		    	updateFeedRow(obj);
		    }
		    
		    var updateFeedRow = function(obj) {
		    	$rows = $(obj).find(".inProgress");
		    	if ($rows.length)
		    	{
		    		if ($rows.eq(0).hasClass('newItem'))
		    		{
		    			$rows.eq(0).removeClass('newItem');
		    			$rows.eq(0).animate({
    					    height: o.feedItemHeight+'px'
    					  }, o.animationSpeed);
		    			$rows.eq(0).removeClass('inProgress');
		    		}
		    		else
		    		{
		    			$rows.eq(0).animate({
    					    height: 'toggle'
    					  }, o.animationSpeed);
		    			$rows.eq(0).removeClass('inProgress');
		    			$rows.eq(0).addClass('processed');
		    			nextRow = $rows.eq(0).next();
		    			if (nextRow)
		    			{
		    				if (nextRow.hasClass('newItem'))
		    				{
		    					nextRow.removeClass('newItem');
		    					nextRow.animate({
		    					    height: o.feedItemHeight+'px'
		    					  }, o.animationSpeed);
		    					nextRow.removeClass('inProgress');
		    				}
		    			}
		    		}
		    		setTimeout(function(){updateFeedRow(obj);}, o.animationSpeed);
		    	}
		    	else
		    	{
			    	$(obj).find(".processed").remove();
		    	}
		    }

		    var initViewsGraph = function (statData) {
		    	var data = [];
		    	var rowData1 = [['день', 'просмотров', 'динамика']];
		    	if (statData)
		    	{
		    		for (i in statData)
		    		{
		    			rowData1.push([statData[i]['date'], statData[i]['count'], statData[i]['average']]); 
		    		}
		    	}
		    	
		    	data[0] = google.visualization.arrayToDataTable(rowData1);

		    	var current = 0;
		    	viewsGraph = new google.visualization.ComboChart(document.getElementById(o.viewsGraphContainer));
		    	
		    	viewsGraph.draw(data[current], o.graphOptions);
		   }

		    var initCommentsGraph = function (statData) {
		    	var data = [];
		    	var rowData1 = [['день', 'комментариев', 'динамика']];
		    	if (statData)
		    	{
		    		for (i in statData)
		    		{
		    			rowData1.push([statData[i]['date'], statData[i]['count'], statData[i]['average']]); 
		    		}
		    	}
		    	
		    	data[0] = google.visualization.arrayToDataTable(rowData1);

		    	var current = 0;
		    	commentsGraph = new google.visualization.ComboChart(document.getElementById(o.commentsGraphContainer));
		    	commentsGraph.draw(data[current], o.graphOptions);
		    }

		    function formatThousands (val){
		    	//val = new Number(this);
		    	if (val < 1000)
		    		return val;
		    	val = (val > 0) ? Math.ceil(val) : Math.floor(val);
		    	var arr = val.round(0).toFixed(0).split('.');
		    	arr[0] = (val < 0 ? '-' : '') + String.leftPad((val < 0 ? arr[0].substring(1) : arr[0]), 1, '0');
		    	arr[0] = Number.injectIntoFormat(arr[0].reverse(), '000 0', true).reverse();
		    	return arr.join('.');
		    }

		    // init
		    initViewsGraph (statData['viewsStat']);
		    initCommentsGraph (statData['commentsStat']);
		    setInterval(function(){gotoNextSection();}, o.refreshStatInterval);
		    setInterval(function(){refreshFeed();}, o.refreshFeedInterval);
		    refreshStat(o.statData);
		    updateFeed(o.feedData, feedContainer);
		    setInterval(function(){
		    	window.location.reload();
		    }, o.reloadPageInterval);

		};
	})(jQuery);

