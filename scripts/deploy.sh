echo "Deploying ..."

# kill all instances of the chat server
killall node

rm -rf chat/

git clone https://github.com/0x6D70/chat.git

cd chat/

npm install
npm install -g forever

PORT=8080 nohup sudo -E forever server.js > server.log 2>&1 </dev/null & disown
