$('#incBut').click(function() {
    var name = $('#nameInput').val()
    var ID = $('#IDInput').val()

    console.log(name, ID)
    $.ajax("/api/insertUser/" + ID + '/' + name).then(function(response) {
        console.log(response);
        updateData()
    });
})

$('#sendPushBtn').click(function() {
    var ID = $('#pushIdInput').val();

    console.log(ID);
    $.ajax("/api/sendPush/" + ID).then(function(response) {
        console.log(response);
    });
})

var UserTemplate = _.template("<%= name %>&emsp;  <% print(signedIn? 'Yes': 'No') %><br>");

function updateData() {
    // console.log('updating')

    $.ajax({
        type: "GET",
        url: "/api/listUsers",
        context: document.body
    }).then(function(data) {
        // console.log(data)
        var UserString = ""
        JSON.parse(data).map(user => UserString += UserTemplate(user))
        $('#data').html(UserString);
    });

}
updateData()

setInterval(updateData, 1500)
