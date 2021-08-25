echo "Deploying ..."

# kill all instances of the chat server
killall node

rm -rf chat/

git clone https://github.com/0x6D70/chat.git

cd chat/

npm install

nohup sudo node server.js & disown
