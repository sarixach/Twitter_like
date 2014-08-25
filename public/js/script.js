$(document).ready(function() {

	$("#nav li:nth-child(1)").on('click', function() {
		location.href = '/index.html';
	});

	$("#nav li:nth-child(2)").on('click', function() {
		location.href = '/notification.html';
	});

	$('.twitter_icon').on('click', function() {
		location.href = '/index.html';
	});

	$("#nav li:nth-child(1)").hover(function() { //home 
		$('.home').animate({'opacity': '0'}, 200);
		$('.home1').animate({'opacity': '1'}, 200);
	}, function() {
		$('.home1').animate({'opacity': '0'}, 200);
		$('.home').animate({'opacity': '1'}, 200);
	});

	$("#nav li:nth-child(2)").hover(function() { //nptification
		$('.notification').animate({'opacity': '0'}, 200);
		$('.notification1').animate({'opacity': '1'}, 200);
	}, function() {
		$('.notification1').animate({'opacity': '0'}, 200);
		$('.notification').animate({'opacity': '1'}, 200);
	});


	//for navigation active hover
	$('#nav li').each(function() {
	    var href = $(this).find('a').attr('href');
	    if (href === window.location.pathname) {
			$(this).css({
				color: '#0084B4',
				'border-bottom': '4px solid #0084b4',
				height: '25px'
			});
	    }
    });

    if (window.location.pathname === "/") {
    	$('#nav li:nth-child(1)').css({
			color: '#0084B4',
			'border-bottom': '4px solid #0084b4',
			height: '25px'
		});
    }

	$('form').submit(function() {
		if (!$('.textarea').val()) {
			return false;
		} else {
			$('.tweet_pic').css('display', 'none');
			$('.loader').css('display', 'block');
			return true;
		}
	});

	//close button click
	$('.close').on('click', function() {
		$('.error').fadeOut(500);
	});

	//deleting note
	$('.notification_center').hover(function() {
		$(this).children('.delete').css('display', 'block');
	}, function() {
		$(this).find('.delete').css('display', 'none');
	});

	$('.delete').click(function(e) {
		var self = $(this);
		var target = e.target;
		var id = target.getAttribute('data_id');
		$.ajax({
			url: '/delete',
			type: "POST",
			data: {id: id},
			success: function(data) {
				if (data === "deleted") {
					// location.href = location.pathname;
					self.parent('.notification_center').fadeOut(300);
				}
			}
		});
	});

});