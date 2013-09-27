function init() {
	fetch();
}

// ajax call to github api
function fetch() {
	$.ajax({
		type: "GET",
		url: "https://api.github.com/users/svmatthews/repos",
		contentType: "application/json; charset=utf-8",
		format: "json",
		success: function(data) {
			console.log(data);
			run(data);
		}
	});
}

function run(data) {
	// populate control elements
	controls(data);
	// populate repository elements
	repos(data);
	// build UI according to populated control list
	interaction();
	// fade in repos
	$('#main ul').fadeIn(700);
	// hide the loading gif
	hideLoad();
}

function controls(data) {
	var languages = ['All'];
	$.each(data, function(index, element) {
	
		// populate control section with languages
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
		$('#controls').append(controls);
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

function interaction() {
	// control UI & action
	$('#all').addClass('active');
	$('nav ul li').click(function(){
		// add/remove active class
		$('nav ul li').removeClass('active');
		$(this).addClass('active');

		// get class of clicked control
		var type = $(this).attr('id');
		console.log(type);
		if (type == 'All') {
			$('#main ul li').show();
		} else {
			$('#main ul li').hide();
			$('.'+type).show();
		}
		// use to show specific repos
	});
}

function hideLoad() {
	$('#loading').hide();
}

window.onLoad = init();