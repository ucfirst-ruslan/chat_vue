var http = require('http');
var fs = require('fs');
var url = require('url');
var ws = require('ws');
var server = new http.Server();
server.on('request', (req, res) => {
    let urlObj = url.parse(req.url, true);
    //console.log(req.url);
    if (req.url === '/') {
        fs.readFile(__dirname + '/public/index.html', function(err, data) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(String(data));
            res.end();
        });
    } else if (req.url === '/css/style.css') {
        fs.readFile(__dirname + '/public/css/style.css', function(err, data) {
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.write(String(data));
            res.end();
        });
    } else {
        response.writeHead(404);
        response.end('File not found');
    }

    // fs.readFile('./public/index.html', (err, data) => {
    //     res.end(data);
    // });
})
server.listen(5000);
console.log("Server running in localhost at port 5000");

var clients = {};
var messages = require('./data/messages');
var counter = 0;
var wss = new ws.Server({ port: 5555 });
var dateCur = '';

wss.on('connection', (wsc, request) => {

    let id = counter++;
    clients[id] = wsc;
    wsc.on('message', (message) => {

        message = JSON.parse(message);

        let MyDate = new Date();
        message.date = getCurDate()

        console.log(message);
        if (message.user && message.mess) {
            messages.push(message);
            for (let cid in clients) {
                let client = clients[cid];
                client.send(JSON.stringify({
                    type: 'message',
                    message
                }));
            }
        }
        /* 
            wss.clients.forEach((client) => {
                client.send(JSON.stringify({
                    type: 'message',
                    message
                }));
            })
        */
    });

    wsc.on('close', () => {
        console.log('connect close');
        // clearInterval(timer);
        delete clients[id];
    })

    wsc.send(JSON.stringify({
        type: 'messages',
        messages
    }));


    /* let timer = setInterval(() => {
        wsc.send(JSON.stringify({
            type: 'memoryInfo',
            data: process.memoryUsage()
        }))
    }, 200) */

    // Example disconnect
    /* setTimeout(() => {
        wsc.close()
    }, 5000) */
})

function getCurDate() {
    let MyDate = new Date();
    let min = '';
    let month = '';
    month = MyDate.getMonth() + 1;

    month = (month < 10) ? '0' + month : month;
    min = (MyDate.getMinutes() < 10) ? '0' + MyDate.getMinutes() : MyDate.getMinutes()

    let dateRes = MyDate.getHours() + ':' + min + ', ' + MyDate.getDate() + '.' + month + '.' + MyDate.getFullYear();
    return dateRes;
};


setInterval(() => {
    fs.writeFile('./data/messages.json', JSON.stringify(messages), (err) => { if (err) console.log('error', err) });
}, 1000);