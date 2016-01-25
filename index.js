var server = require('./server.js');
app = server(process.argv[2] || 80);
