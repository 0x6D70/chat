echo "Deploying ..."

# kill all instances of the chat server
killall node

rm -rf chat/

git clone https://github.com/0x6D70/chat.git

cd chat/

npm install

PORT=80 nohup sudo node server.js > server.log 2>&1 </dev/null & disown
