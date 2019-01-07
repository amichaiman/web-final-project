function getRandomInt(min, max) {
    return Math.round(Math.random() * (max - min + 1)) + min;
}

var mousePos = {};
var sizeInt = 100;


$(window).mousemove(function(e) {
    mousePos.x = e.pageX;
    mousePos.y = e.pageY;
    $('.follower').css({
        left: mousePos.x,
        top: mousePos.y,
    });
});

$(window).mouseleave(function(e) {
    mousePos.x = -1;
    mousePos.y = -1;
});

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};
function createGameObject() {
    colors = ['white', 'lightblue', 'lightgray', 'yellow'];
    attributes = {
        "height": "50px",
        "width": "50px",
        "background-color": colors[getRandomInt(0,colors.length-2)],
        "border-radius" : "50%",
        "display": "inline-block",
    };
    $("#gameObject").css(attributes);
}
$(document).ready(function(){
    if (getUrlParameter("cameFrom") !== "login") {
        location.href = "login.html";
    }
    createGameObject();
    $('.follower').css({
        left: getRandomInt(0,1000),
        top: getRandomInt(0,500),
    });
});


