//Check for Notifications
function updatePage(){
    fetch(href="/notification/check")
        .then(function(response) {
            return response.json();
        })
        .then(function(myJson) {
            if (myJson.toString() == "false" && document.getElementById("notify-icon").style.color == "red"){
                document.getElementById("notify-icon").style.color = "grey"
            } else if (myJson.toString() == "true" && document.getElementById("notify-icon").style.color == "grey"){
                document.getElementById("notify-icon").style.color = "red"
            }else{}
        });
    }
setInterval(updatePage, 3000);