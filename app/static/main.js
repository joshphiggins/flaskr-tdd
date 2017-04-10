var csrftoken = $('meta[name=csrf-token]').attr('content')

$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type)) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken)
        }
    }
})

$(document).ready(function(){
    console.log("ready!");
    $('#login').on('submit', function(event){
        event.preventDefault();
        console.log("login js activates");
        $.ajax({
            type: 'POST',
            url: '/login',
            contentType: 'application/json',
            dataType: 'json',
            data : JSON.stringify({'username' : $('#username').val(), 'password' : $('#password').val()}),
            success: function(json){
                if(json.result == true){
                $('#logged-out-view').addClass('hidden');
                $('#logged-in-view').removeClass('hidden');
                // add message json.message
                }else{
                //message
                alert('error with login');
            }},
            error : function(jqXHR){
                console.log('error w/ json')
                jsonValue = jQuery.parseJSON( jqXHR.responseText );
                console.log(jsonValue.Message);
            },
       });
    });

    $('#logged-in-view button').click(function(){
        var url = '/logout'
        $.post(url);
        window.location.href = "/";
        $('#flash').text('You were logged out')

    });

    $('#add-entry').on('submit', function(e){
        e.preventDefault();
        console.log("add entry js activates")
        $.ajax({
            type: 'POST',
            url: '/add',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({'title': $('#title').val(), 'text': $('#text').val()}),
            success: function(json){
                if(json.result == true){
                    console.log(json.message);
                    $('#title').val("");
                    $('#text').val("");
                    //update entries
                    get_all_entries()
                }else{
                    alert(json.message);
            }},
            error: function(jqXHR){
                console.log('error w/ json')
                jsonValue = jQuery.parseJSON( jqXHR.responseText );
                console.log(jsonValue.Message);
            },
        });
    });


    $('.entry').on('click', function(){
        var entry = this;
        var post_id = $(this).find('h2').attr('id');
        $.ajax({
            type: 'GET',
            url: '/delete' + '/' + post_id,
            context: entry,
            success:function(result){
                if(result.status == 1){
                    $(this).remove();
                    console.log(result);
                }
            }
        });
    });

});

// helper

function get_all_entries(){
    
    $.getJSON('/get_entries',function(json){
        console.log(json.entries);
        var entries = $('ul.entries');
        entries.empty();
        json.entries.forEach(function(value, index){
            var li = $('<li></li>')
                .addClass('entry')
                .text(value.text)
                .appendTo(entries);
            var header = $("<h2 id="+value.post_id+"></h2")
                .text(value.title)
                .prependTo(li);
        });
    });
}





//crsf boilerplate
//function getCookie(name) {
        //var cookieValue = null;
        //if (document.cookie && document.cookie != '') {
            //var cookies = document.cookie.split(';');
            //for (var i = 0; i < cookies.length; i++) {
                //var cookie = jQuery.trim(cookies[i]);
                //// Does this cookie string begin with the name we want?
                //if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    //cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    //break;
                //}
            //}
        //}
        //return cookieValue;
    //}
    //var csrftoken = getCookie('csrftoken');
//
    ///*
    //The functions below will create a header with csrftoken
    //*/
//
    //function csrfSafeMethod(method) {
        //// these HTTP methods do not require CSRF protection
        //return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    //}
    //function sameOrigin(url) {
        //// test that a given url is a same-origin URL
        //// url could be relative or scheme relative or absolute
        //var host = document.location.host; // host + port
        //var protocol = document.location.protocol;
        //var sr_origin = '//' + host;
        //var origin = protocol + sr_origin;
        //// Allow absolute or scheme relative URLs to same origin
        //return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            //(url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            //// or any other URL that isn't scheme relative or absolute i.e relative.
            //!(/^(\/\/|http:|https:).*/.test(url));
    //}
//
    //$.ajaxSetup({
        //beforeSend: function(xhr, settings) {
            //if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
                //// Send the token to same-origin, relative URLs only.
                //// Send the token only if the method warrants CSRF protection
                //// Using the CSRFToken value acquired earlier
                //xhr.setRequestHeader("X-CSRFToken", csrftoken);
            //}
        //}
    //});

