$('#addUser').click(function() {
    var name = $('#nameInput').val()
    var ID = $('#IDInput').val()
    var PW = $('#pwInput').val()
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
var UserTemplate = _.template("<%= name %>&emsp; <%= UID %> #tags:<%= tagInfo.length%>");
var TagTemplate = _.template("<li><%= TagID%> <%= name%> <%= state.location%></li>")

function updateData() {
    console.log('updating')
    $.ajax({
        type: "GET",
        url: "/api/listUsers",
        context: document.body
    }).then(function(data) {
        // $('#data').html("")
        var newContent = ""
        JSON.parse(data).forEach((user) => {
            $.ajax({
                url: "/api/getUserInfo/" + user.UID,
                type: "GET",
                context: document.body
            }).then((userData) => {
                // console.log(userData)
                newContent += (UserTemplate(userData))

                // $('#data').append(UserTemplate(userData))
                userData.tagInfo.forEach(function(tag) {
                    newContent += (TagTemplate(tag))
                    $('#data').html(newContent)

                    // $('#data').append(TagTemplate(tag))
                })

            })
        })
    });

}
updateData()

setInterval(updateData, 1500)
