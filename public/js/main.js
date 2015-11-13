$('#incBut').click(function() {
    var text = new Date().getMilliseconds();
    console.log(text)
    $.ajax("/api/insert/" + text).then(function(response) {
        console.log(response);
        updateData()
    });
})


function updateData() {
    console.log('updating')

    $.ajax({
        type: "GET",
        url: "/api/getText",
        context: document.body
    }).then(function(data) {
        $('#data').html(data);
    });

}
updateData()

setInterval(updateData, 1500)
