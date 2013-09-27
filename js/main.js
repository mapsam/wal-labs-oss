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
	$('#' + filters()).show();
	filters();

	// fade in repos
	$('#main ul').fadeIn(700);

	// hide the loading gif
	hideLoad();

}

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
}

function repos(data) { // populate repos
	$.each(data, function(index, element) {
		// test if value is null or C++ since '+' doesn't work in CSS class strings
		var lang;
		if (!(element.language)) {
			lang = 'Undefined';
		} else if (element.language == 'C++') {
			lang = 'Cplus';
		} else {
			lang = element.language;
		}
		// html to be appended to <li> element
		var html = 	'<div class="repo-content"><h1><a target="_blank" href="' + element.svn_url + '">' + element.name + '</a></h1><p>' + element.description + '</p></div>'
					+ '<div class="repo-meta">&#9733; ' + element.watchers + '<img src="img/fork.png"> ' + element.forks + '</div>';
		// create the list element
		var info = $('<li>', {
			'class': lang,
			'html': html
		});
		// attach the element with the information to the repo container
		$('#repos').append(info);
	});
}

function filters() {
	var id = 'languages-control'
	$('#filters li').click( function() {
		$('#controls ul').hide();
		id = $(this).attr('id') + '-control';
		console.log(id);
		$('#' + id).fadeIn(100);
		// run specific control UI based on id
		if (id == 'languages-control') {
			return langControls();
		} else if (id == 'time-control') {
			return timeControls();
		} else { // activity-control
			return activityControls();
		}
	});
	// return id for use in gathering data
	return id;
}

function langControls() {
	// control UI & action
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

function timeControls(){}
function activityControls(){}

function hideLoad() {
	$('#loading').hide();
}

window.onLoad = init();