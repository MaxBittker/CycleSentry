var cv = require('opencv');
var fs = require('fs');
var request = require('request')
var http = require('http')
var port = process.argv[2] || 7777;
var ServerIP = "http://cyclesentry.xyz"
if (process.argv[2] === "local")
    ServerIP = "http://localhost:9999"

var n = 0
try {
    var camera = new cv.VideoCapture(0);
} catch (e) {
    console.log("Couldn't start camera:", e)
}

setInterval(function() {
    request(ServerIP + "/api/shouldAlarm", function(err, res, bod) {
        if (err)
            return
        if (bod !== '1')
            return

        var uploadName = Date.now().toString() + '.png'
        var sendN = ((n + 60) - 25) % 60
        var filename = './tmp/' + sendN.toString() + '.png'
        console.log("got alarm, send: " + filename)

        fs.createReadStream(filename).pipe(
            request.put(ServerIP + '/api/upload/' + uploadName,
                function(err, res) {
                    if (err) throw err
                    console.log(res.body)
                }))

    })

    camera.read(function(err, im) {
        if (err) throw err;
        var filename = './tmp/' + n.toString() + '.png'
        n = (n + 1) % 60
        im.save(filename)

    });
}, 500);

var server = http.createServer(function(req, res) {
    res.writeHead(200, {
        'content-type': 'image/png'
    })

    camera.read(function(err, im) {
        if (err) throw err;
        // var filename = './tmp/'+Date.now().toString()+'.png'
        var filename = './tmp/' + n.toString() + '.png'
        n = (n + 1) % 10
        im.save(filename)
        console.log("wrote: " + filename)
        fs.createReadStream(filename).pipe(res)
    });

})


server.listen(port)
