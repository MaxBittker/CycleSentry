var cv = require('opencv');
var fs = require('fs');

var http = require('http')
var port = process.argv[2] || 7777;

var n = 0
var server = http.createServer(function(req, res) {
    res.writeHead(200, {
        'content-type': 'text/plain'
    })

    try {
        var camera = new cv.VideoCapture(0);
        camera.read(function(err, im) {
            if (err) throw err;
            // var fileName = './tmp/'+Date.now().toString()+'.png'
            var fileName = './tmp/' + n + '.png'
            n = (n+1)%50
            im.save(filename)
            console.log("wrote: " + filename)
            fs.createReadStream(filename).pipe(res)
        });

    } catch (e) {
        console.log("Couldn't start camera:", e)
    }

})


server.listen(port)
