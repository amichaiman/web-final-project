function getRandomInt(min, max) {
    return Math.round(Math.random() * (max - min + 1)) + min;
}

colors = ['white', 'lightblue', 'lightgray', 'yellow', 'blue', 'green', 'red', 'pink'];
var mousePos = {};
var updateLocationInterval;
var tryToEatPlayerInterval;
var addStaticBubblesInterval;
var radius;
var staticBubbleRadius=20;
var START_SIZE = 0;
var rootRef;


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

function createStaticBubble(id, x, y, radius, name) {
    if ($("#"+id).length !== 0 && radius === staticBubbleRadius) {
        return;
    }
    var attributes;
    attributes = {
        "height": radius+"px",
        "width": radius+"px",
        "border-radius" : "50%",
        "position" : "absolute",
        "margin-top": y+"px",
        "margin-left": x+"px",
        "padding-top":  radius/2-10 + "px",
    };
    if ($("#"+id).length === 0) {
        var type = radius === staticBubbleRadius ? 'static-bubble' : 'player';
        $("#main").append("<div class='"+type+" text-center' id='"+id+"'>" + (name===undefined ? "" : name) + "</div>");
        attributes["background-color"] = colors[getRandomInt(0,colors.length-2)];
    }
    $("#"+id).css(attributes);
}
function createGameObject() {
    attributes = {
        "height": radius+"px",
        "width": radius+"px",
        "background-color": colors[getRandomInt(0,colors.length-2)],
        "border-radius" : "50%",
        "display": "inline-block",
    };
    $("#gameObject").css(attributes);
}

function updateLocation() {
    rootRef.child('players').child(sessionStorage.id.toString()).set({
        x : $("#gameObject").offset().left,
        y : $("#gameObject").offset().top,
        radius : radius,
        name : sessionStorage.name
    });
}

function updateSize() {
    attributes = {
        "height": radius + "px",
        "width":  radius + "px",
        "padding-top":  radius/2-10 + "px",
        "transition-duration": (radius*3+1200)+"ms"
    };
    $("#score").html(radius*2);
    $("#gameObject").css(attributes);
}

function addStaticBubbles() {
    const height = $(window).height();
    const width = $(window).width();
    var staticBubblesRef = rootRef.child('static-bubbles');
    staticBubblesRef.push().set({
        x:getRandomInt(0,width),
        y:getRandomInt(0,height)
    });
}

function distance(x1,y1,x2,y2){
    return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
}

function tryToEatPlayer() {
    $(".static-bubble").each(function(){
        const x = $("#gameObject").offset().left + radius/2;
        const y = $("#gameObject").offset().top + radius/2;
        var thisRadius = $(this).css('height');
        thisRadius = thisRadius.substr(0,thisRadius.length-2)/2;
        if (distance(x,y,$(this).offset().left+thisRadius,$(this).offset().top+thisRadius) < radius/2) {
            $(this).remove();
            rootRef.child('static-bubbles').child($(this).attr('id')).remove();
            radius+=0.5;
            updateSize();
        }
    });

    $(".player").each(function(){
        const x = $("#gameObject").offset().left + radius/2;
        const y = $("#gameObject").offset().top + radius/2;
        var thisRadius = $(this).css('height');
        thisRadius = thisRadius.substr(0,thisRadius.length-2)/2;
        if (distance(x,y,$(this).offset().left+thisRadius,$(this).offset().top+thisRadius) <= Math.max(radius/2, thisRadius)) {
            if (thisRadius < radius/2) {
                radius+=Math.floor(thisRadius/2);
                updateSize();
                $(this).remove();
                rootRef.child('players').child($(this).attr('id')).remove();
            } else {
                clearInterval(updateLocationInterval);
                clearInterval(tryToEatPlayerInterval);
                clearInterval(addStaticBubblesInterval);
                $("#main").html('<div class="container d-flex justify-content-center vertical-center text-center lose-game"> <p>you lose!</p></div>');
                jQuery("#main").fadeOut(4000, function() {
                    location.href = "login.html";
                });
            }
        }
    });
}

$(document).ready(function(){
    rootRef = firebase.database().ref();
    if (sessionStorage.cameFrom !== 'login') {
        location.href = "login.html";
    }
    $("#gameObject").html(sessionStorage.name);
    $("#title-in-game").append(" " + sessionStorage.name + "?");
    $('.follower').css({
        left: getRandomInt(0,1000),
        top: getRandomInt(0,500),
    });
    if (sessionStorage["id"] === undefined) {
        var addStore = function(){
            sessionStorage.id  = rootRef.child('players').push().key;
            rootRef.child('players').child(sessionStorage.id.toString()).once('value').then(function(snapshot) {
                if (snapshot.val().radius !== START_SIZE) {
                    radius = snapshot.val().radius;
                    updateSize();
                }
            });
            updateLocationInterval = setInterval(updateLocation, 5);
        };
        addStore()
    } else {
        updateLocationInterval = setInterval(updateLocation, 5);
    }
    addStaticBubblesInterval = setInterval(addStaticBubbles, 4000);
    tryToEatPlayerInterval = setInterval(tryToEatPlayer, 5);

    createGameObject();
    radius = 50;
    updateSize();

    rootRef.child('static-bubbles').on('child_removed', function(oldChildSnapshot) {
        $("#"+oldChildSnapshot.key).remove();
    });

    rootRef.child('players').on('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            if (childSnapshot.key !== sessionStorage.id) {
                createStaticBubble(childSnapshot.key, childSnapshot.val().x, childSnapshot.val().y, childSnapshot.val().radius, childSnapshot.val().name);
            }
        });
    });
    rootRef.child('static-bubbles').on('child_added', function(newChildSnapshot) {
        createStaticBubble(newChildSnapshot.key, newChildSnapshot.val().x, newChildSnapshot.val().y, staticBubbleRadius);
    });
    rootRef.child('players').on('child_removed', function(oldChildSnapshot) {
        $("#"+oldChildSnapshot.key).remove();
    });
});

function endGame() {
    clearInterval(updateLocationInterval);
    rootRef.child('players').child(sessionStorage.id).remove(function(error) {
        console.log(error.message);
    }).then(function() {
        location.href = "login.html";
    });
}


window.addEventListener("beforeunload", function () {
    endGame();
});
