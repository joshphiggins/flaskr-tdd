var csrftoken = $('meta[name=csrf-token]').attr('content')

$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type)) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken)
        }
    }
})
window.onload = function() {
  get_all_entries();
};

$(document).ready(function(){
    console.log("ready!");

    $('li.entry').on('click', function(){
        console.log('click working')
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
                console.log(json);
                if(json.result == true){
                $('#logged-out-view').addClass('hidden');
                $('#logged-in-view').removeClass('hidden');
                $('#username').val("");
                $('#password').val("");
                get_all_entries();
                console.log(json.message);
                show_msg(json.message);
                }else{
                show_msg('error with login');
            }},
            error : function(jqXHR){
                console.log('error w/ json');
                jsonValue = jQuery.parseJSON( jqXHR.responseText );
                console.log(jsonValue.Message);
            },
       });
    });

    $('#logged-in-view button').click(function(e){
        e.preventDefault();
        $.ajax({
            type: 'POST',
            url: '/logout',
            contentType: 'application/JSON',
            success: function(response){
                $('#logged-in-view').addClass('hidden');
                $('#logged-out-view').removeClass('hidden');
                show_msg(response.response);
            },
            error: function(err){
                console.log("error: " + err);
            }
        })
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
                    show_msg(json.message);
            }},
            error: function(jqXHR){
                console.log('error w/ json')
                jsonValue = jQuery.parseJSON( jqXHR.responseText );
                console.log(jsonValue.Message);
            },
        });
    });


});

// helper

function get_all_entries(){
    $.getJSON('/get_entries',function(json){
        var entries = $('ul.entries');
        var entries_count = Object.keys(json.entries).length;
        if(entries_count == 0){
            entries.append("<li><em>No entries here so far</em></li>")
        }else{
            entries.empty();
            json.entries.forEach(function(value, index){
                var li = $('<li></li>')
                    .addClass('entry')
                    .text(value.text)
                    .appendTo(entries);
                var header = $("<h2 id="+value.post_id+"></h2")
                    .text(value.title)
                    .prependTo(li);
            })
        }
    });
}

function show_msg(msg){
    $('.flash').text(msg);

}
