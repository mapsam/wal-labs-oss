function init() {
	fetch();
}

// ajax call to github api
function fetch() {
	$.ajax({
		type: "GET",
		url: "https://api.github.com/orgs/walmartlabs/repos",
		contentType: "application/json; charset=utf-8",
		format: "json",
		success: function(data) {
			console.log(data);
			run(data);

		}
	});
}

function run(data) {
	// populate filter controls and hide other elements

	// populate control elements
	controls(data);

	// populate repository elements
	repos(data);

	// build UI according to populated control list
	$('#controls ul').hide();
	$('#' + filters(data)).fadeIn(500);
	filters();
	langControls();

	// fade in repos
	$('#main ul').fadeIn(700);

	// hide the loading gif
	hideLoad();

}

// this dynamically fills the control buttons for the language section
// since we don't have different controls for 'time' and 'activity' we do
// not need to load anything for them
function controls(data) {
	var languages = ['All'];
	$.each(data, function(index, element) {
	
		// get element language to build language control section
		var lang = element.language,
			controls;
		// test if value is 'null'
		if ($.inArray(lang, languages) == -1) {
			if (!(element.language)) {
				controls = $('<li>', {
					'id': 'Undefined',
					'html': '<p>Undefined</p>'
				});
			} else if (element.language == 'C++') {
				controls = $('<li>', {
					'id': 'Cplus',
					'html': '<p>' + element.language + '</p>'
				});
			} else {
				controls = $('<li>', {
					'id': element.language,
					'html': '<p>' + element.language + '</p>'
				});
			}
			languages.push(lang);
		}
		// populate language-control section
		$('#languages-control').append(controls);
	});
	// control UI & action
	
}

function repos(data) { // populate repos
	$('#repos').html('');
	$.each(data, function(index, element) {
		var info = collectRepoInfo(element);
		// attach the element with the information to the repo container
		$('#repos').append(info);
	});
}

function filters(data) {
	var id = 'languages-control'
	$('#filters li').click( function() {
		$('#controls ul').hide();
		id = $(this).attr('id') + '-control';
		$('#' + id).fadeIn(200);
		// run specific control UI based on id
		if (id == 'languages-control') {
			return langControls();
		} else if (id == 'time-control') {
			return timeControls(data);
		} else { // activity-control
			return activityControls(data);
		}
	});
	// return id for use in gathering data
	return id;
}

function langControls() {
	$('#All').addClass('active');
	$('nav ul li').click(function(){
		// add/remove active class
		$('nav ul li').removeClass('active');
		$(this).addClass('active');

		// get class of clicked control
		var type = $(this).attr('id');
		if (type == 'All') {
			$('#main ul li').show();
		} else {
			$('#main ul li').hide();
			$('.'+type).show();
		}
		// use to show specific repos
	});
}

function timeControls(data) {
	// run recently updated first so something is active right away
	orderByRecent(data);
	console.log(orderByRecent(data));
	$('#recently-updated').addClass('active');
	
	// recently updated function call
	$('#recently-updated').click(function(){
		orderByRecent(data);
	});

	// oldest created function call
	$('#oldest').click(function(){
		orderByOldest(data);
	});

	// newest created function call
	$('#newest').click(function(){
		orderByNewest(data);
	});
}

function activityControls(data) {
	// run forks first so something is active right away
	orderByForks(data);
	$('#forks').addClass('active');

	// oldest created function call
	$('#forks').click(function(){
		orderByForks(data);
	});

	// newest created function call
	$('#watchers').click(function(){
		orderByWatchers(data);
	});
}

function orderByRecent(data) {
	$('#repos').html('');
	var recentArray = [];
	$.each(data, function(index, element) {
		recentArray.push(dateToInt(element.pushed_at)); // date to integer into array
	});
	recentArray = recentArray.sort(function(a, b) {return b-a} ); // b-a is high to low
	for (mug=0; mug < recentArray.length; mug++) {
		var repo = $.each(data, function(index, element) {
			var time = dateToInt(element.pushed_at);
			if (time == recentArray[mug]) {
				var info = collectRepoInfo(element);
				$('#repos').append(info); // attach the element with the information to the repo container
			}
		});
	}
}

function orderByOldest(data) {
	$('#repos').html('');
	var recentArray = [];
	$.each(data, function(index, element) {
		recentArray.push(dateToInt(element.created_at)); // date to integer into array
	});
	recentArray = recentArray.sort(function(a, b) {return a-b} ); // a-b is low to high
	for (mug=0; mug < recentArray.length; mug++) {
		var repo = $.each(data, function(index, element) {
			var time = dateToInt(element.created_at);
			if (time == recentArray[mug]) {
				var info = collectRepoInfo(element);
				// attach the element with the information to the repo container
				$('#repos').append(info);
			}
		});
	}
}

function orderByNewest(data) {
	$('#repos').html('');
	var recentArray = [];
	$.each(data, function(index, element) {
		recentArray.push(dateToInt(element.created_at)); // date to integer into array
	});
	recentArray = recentArray.sort(function(a, b) {return b-a} ); 
	for (mug=0; mug < recentArray.length; mug++) {
		var repo = $.each(data, function(index, element) {
			var time = dateToInt(element.created_at);
			if (time == recentArray[mug]) {
				var lang;
				var info = collectRepoInfo(element);
				// attach the element with the information to the repo container
				$('#repos').append(info);
			}
		});
	}
}

function orderByForks(data) {
	$('#repos').html('');
	var forksArray = [];
	$.each(data, function(index, element) {
		fork = element.forks;
		forksArray.push(fork);
	});
	forksArray = forksArray.sort(function(a, b) {return b-a} );
	var repoArray = []; // holding array to prevent duplicate repos that share same number of forks
	for (mug=0; mug < forksArray.length; mug++) {
		var repo = $.each(data, function(index, element) {
			fork = element.forks; // 
			repo = element.id; // used to identify unique repos
			if (fork == forksArray[mug]) {
				if ($.inArray(repo, repoArray) == -1) { // if repo has already been processed and added to the front, don't do this
					repoArray.push(repo);
					var info = collectRepoInfo(element);
					// attach the element with the information to the repo container
					$('#repos').append(info);
				}
			}
		});
	}
}

function orderByWatchers(data) {
	$('#repos').html('');
	var watchersArray = [];
	$.each(data, function(index, element) {
		watch = element.watchers;
		watchersArray.push(watch);
	});
	watchersArray = watchersArray.sort(function(a, b) {return b-a} );
	var repoArray = []; // holding array to prevent duplicate repos that share same number of forks
	for (mug=0; mug < watchersArray.length; mug++) {
		var repo = $.each(data, function(index, element) {
			watch = element.watchers; // 
			repo = element.id; // used for specific repos
			if (watch == watchersArray[mug]) {
				if ($.inArray(repo, repoArray) == -1) { // if repo has already been processed and added to the front, don't do this
					repoArray.push(repo);
					var info = collectRepoInfo(element);
					// attach the element with the information to the repo container
					$('#repos').append(info);
				}
			}
		});
	}
}

function collectRepoInfo(element) {
	// get language for card class
	var lang;
	if (!(element.language)) {lang = 'Undefined';}
	else if (element.language == 'C++') {lang = 'Cplus';}
	else {lang = element.language;}

	// create nice date format
	var created = dateToNice(element.created_at);
	var updated = dateToNice(element.pushed_at);

	// if description is longer than 175 characters, shorten it
	var desc = element.description;
	if (desc.length > 150) {
		desc = desc.substr(0,150) + '<a href="' + element.svn_url + '">...</a>';
	}

	// construct html for adding to <li> element
	var html = '<div class="repo-content"><h1><a target="_blank" href="' + element.svn_url + '">' + element.name + '</a></h1><p>' + desc + '</p></div>'
	+ '<div class="repo-meta">Updated: <strong>' + updated[0] + '</strong> | Created: <strong>' + created[0] + '</strong><br>&#9733; ' + element.watchers + '<img src="img/fork.png"> ' + element.forks + '</div>';
	var info = $('<li>', {
		'class': lang,
		'html': html
	});
	return info;
}

function dateToNice(string) {
	string = string.split("T");
	date = string[0].replace(/-/g, '/');
	year = date.substr(0,4);
	date = date.substr(5) + '/' + year;
	time = string[1].replace(/T/g, '').replace(/Z/g, '');
	return [date, time];
}

function dateToInt(string) {
	string = string.replace(/-/g, '');
	string = string.replace(/T/g, '');
	string = string.replace(/:/g, '');
	string = string.replace(/Z/g, '');
	timeInt = parseInt(string);
	return timeInt;
}

function hideLoad() {
	$('#loading').hide();
}

window.onLoad = init();