$('#addUser').click(function() {
    var name = $('#nameInput').val()
    var ID = $('#IDInput').val()
    var PW = $('#PwInput').val()
    if (PW && ID && name) {
        $.ajax("/api/insertUser/" + ID + '/' + name + '/' + PW).then(function(response) {
            console.log(response);
            updateData()
        });
    }
})

$('#addTag').click(function() {
    var name = $('#tagNameInput').val()
    var UID = $('#tagUIDInput').val()
    var TID = $('#tagIDInput').val()
    var type = $('#typeSelect').val()
    if (type && TID && UID && name) {
        $.ajax("/api/insertTag/" + UID + '/' + TID + '/' + type + '/' + name).then(function(response) {
            console.log(response);
            updateData()
        });
    }
})

$('#sendPushBtn').click(function() {
    var ID = $('#pushIdInput').val();

    console.log(ID);
    $.ajax("/api/sendPush/" + ID).then(function(response) {
        console.log(response);
    });
})

// var UserTemplate = _.template("<%= name %>&emsp; <%= UID %><br>");
var UserTemplate = _.template("<%= name %>&emsp; <%= UID %> #tags:<%= tagInfo.length%><ul>");
var TagTemplate = _.template("<li><%= TagID%> <%= name%> <%= state.location%></li>")

function updateData() {
    console.log('updating')
    $('#data').html("")

    $.ajax({
        type: "GET",
        url: "/api/listUsers",
        context: document.body
    }).then(function(data) {
        JSON.parse(data).forEach(function(user) {
                $.ajax({
                    url: "/api/getUserInfo/" + user.UID,
                    type: "GET",
                    context: document.body
                }).then(function(userData) {
                    // console.log(userData)
                    $('#data').append(UserTemplate(userData))
                    userData.tagInfo.forEach(function(tag) {
                        $('#data').append(TagTemplate(tag))
                    })
                    $('#data').append("</ul>")

                })
            })
    });

}
updateData()

setInterval(updateData, 1500)
