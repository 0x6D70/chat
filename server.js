const express = require('express');
const bodyParser = require('body-parser');
const ws = require('ws');
const http = require('http');
const {MongoClient} = require('mongodb');


const hostname = '0.0.0.0';
const port = process.env.PORT || 8080;

const database_url = 'mongodb://localhost:27017/chat_app';
const db_client = new MongoClient(database_url);

let messages_history = [];

main().catch(console.error);

async function main() {

    try {
        // Connect to the MongoDB cluster
        await db_client.connect((err) => { // TODO: close database
            if (err) {
               throw err;
            } else {
                console.log("connected to mongo db");
            }
        });

        const db = await db_client.db("chat_app");

        //await db.listCollections().forEach(collection => { console.log(collection.name); });
        //let result = await db_client.db().collection("chats").insertOne({ messages: ["hallo", "test"] });
        //console.log(`New listing created with the following id: ${result.insertedId}`);

        result = await db.collection("chats").findOne();

        if (result) {
            console.log(result);

            messages_history = result.messages;
        } else {
            // no chat document exists -> create one
            await db.collection("chats").insertOne({ messages: [] });
        }
 
    } catch (e) {
        console.error(e);
    }

    const app = express();

    app.use(express.static('public'));
    app.use( bodyParser.json() );       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
    }));

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

            // update database
            updateMessages(db_client, received_message);

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
}

async function updateMessages(db_client, new_message) {
    
    let result = await db_client.db("chat_app").collection("chats").updateOne({}, {$push: {messages: new_message}});

    console.log("updated: " + result.modifiedCount);
}