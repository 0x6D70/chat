const express = require('express');
const bodyParser = require('body-parser');
const ws = require('ws');
const http = require('http');

const hostname = '0.0.0.0';
const port = 8080;

const app = express();

app.use(express.static('public'));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

let messages_history = [];

const server = http.createServer(app);

websocketServer = new ws.Server({ server });

//when a websocket connection is established
websocketServer.on('connection', (webSocketClient) => {
    console.log("new connection");

    //send feedback to the incoming connection
    //webSocketClient.send('{ "connection" : "ok"}');

    // all messages must be send to the new client
    let allMessages = { messages: [] };

    messages_history.forEach(elem => {
        allMessages.messages.push(elem);
    });

    webSocketClient.send(JSON.stringify(allMessages));
    
    //when a message is received
    webSocketClient.on('message', (message) => {

        if (message == "ping") {
            webSocketClient.send("pong");
            return;
        }

        console.log("message: " + message);

        let received_message = JSON.parse(message).message;

        messages_history.push(received_message);

        //for each websocket client
        websocketServer
        .clients
        .forEach( client => {
            //send the client the current message
            //client.send(`{ "message" : ${message} }`);
            client.send(JSON.stringify({
                messages: [
                    received_message
                ]
            }, null, 4));
        });
    });
});

server.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});