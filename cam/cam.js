var cv = require('opencv');
var fs = require('fs');
var request = require('request')
var http = require('http')
var port = process.argv[2] || 7777;
var ServerIP = "http://cyclesentry.xyz"
var ServerIP = "http://localhost:9999"
var n = 0
try {
    var camera = new cv.VideoCapture(0);
} catch (e) {
    console.log("Couldn't start camera:", e)
}

setInterval(function() {
    request(ServerIP + "/api/random", function(err, res, bod) {
        if (err) throw err

        camera.read(function(err, im) {
            if (err) throw err;
            // var filename = './tmp/'+Date.now().toString()+'.png'

            var filename = './tmp/' + n.toString() + '.png'
            var oldN = n
            n = (n + 1) % 100
            im.save(filename)
            console.log("got alarm, wrote: " + filename)
            fs.createReadStream("./tmp/test.txt").pipe(
            
            // fs.createReadStream(filename).pipe(
                request.put(ServerIP + '/api/upload/' + oldN.toString() + ".png",
                    function(err, res) {
                        if (err) throw err
                        console.log(res.body)
                    }))
        });

    })

    camera.read(function(err, im) {
        if (err) throw err;
    });
}, 5000);

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
