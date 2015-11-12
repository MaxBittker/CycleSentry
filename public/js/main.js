$('#incBut').click(function() {
    $.ajax({
        type: "POST",
        url: "localhost:8080/api/insert/:text",
        data: '1',
        // success: success,
        // dataType: dataType
    }).then(function(response) {
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

setInterval(updateData, 500)
