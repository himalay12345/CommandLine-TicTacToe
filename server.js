const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const ticTacToeSockets = require('./config/ticTacToeSocket').ticTacToeSockets(server);

server.listen('5050',(err) => {
    console.log('Connected to 127.0.0.1 : 5050')
})