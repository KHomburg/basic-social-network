$( document ).ready(function() {
    console.log("document ready");

    $( "#post__reply" ).click(function() {
        $( "#comment-form" ).slideToggle();
    });
    
    $( "#close-comment-form" ).click(function() {
        $( "#comment-form" ).slideUp();
    });


});