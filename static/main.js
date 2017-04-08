var csrftoken = $('meta[name=csrf-token]').attr('content')

$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type)) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken)
        }
    }
})

$(function() {
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
                console.log(json.result)
                //
            },
            error : function(jqXHR){
                console.log('error w/ json')
                jsonValue = jQuery.parseJSON( jqXHR.responseText );
                console.log(jsonValue.Message);
            },
       });
    });
});

$(document).ready(function(){
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