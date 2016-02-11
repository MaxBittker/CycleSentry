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

var UserTemplate = _.template("<div class='userCard'><h4><%= name %>&emsp;ID: <%= UID %>&emsp; tags:</h4><ul>"); //<%= tagInfo.length%>");
var TagTemplate = _.template("<li><%=type%> <%= TagID%> <%= name%>: <%=locationMap[state.location]%></li>")

var locationMap = {
    "-2": "Missing",
    "-1": "Signed Out",
    "1": "Checked in"
}

function updateData() {
    console.log('updating')
    var users = []

    $.ajax({
        type: "GET",
        url: "/api/listUsers",
        context: document.body
    }).then(function(data) {
        // $('#data').html("")
        users = JSON.parse(data)

        var tagInfo = {}
        var userDataList = []
        users.forEach((user) => {
            $.ajax({
                url: "/api/getUserInfo/" + user.UID,
                type: "GET",
                context: document.body
            }).then((userData) => {
                tagInfo[userData.UID] = []
                userDataList.push(userData)
                userData.tagInfo.forEach(function(tag) {
                    tagInfo[userData.UID].push(tag)
                })
                if (userDataList.length === users.length) {
                    render(userDataList, tagInfo)
                }

            })
        })
    });

    $.ajax({
        type: "GET",
        url: "/api/shouldAlarm",
        // url: "/api/random",
        context: document.body
    }).then(function(data) {
        if (data === 1) {
            $('#alarmState').show()

        } else{
            $('#alarmState').hide()
        }

    });

}

function render(userList, tagInfo) {
    var newContent = ""
    userList.sort((a, b) => a.UID - b.UID)
    userList.forEach(user => {
        newContent += UserTemplate(user)
        tagInfo[user.UID].forEach(tag => {
            newContent += TagTemplate(tag)
        })
        newContent += "</ul></div>"
    })
    $('#data').html(newContent)
}

updateData()

setInterval(updateData, 1500)
