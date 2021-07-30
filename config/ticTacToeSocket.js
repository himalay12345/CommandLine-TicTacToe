const socketio = require('socket.io')
const { joinGame, getOpponent, getPlayerSymbol, getPlayerTurn, changeTurn, setPlayerMoves, getPlayerDetails, checkValidMove, isWinningMove, isMatchDraw, hasResigned, makeWinner, isGameOver } = require('../utils/gameActivities')

module.exports = {
    ticTacToeSockets : async(socketServer) => {

        //Connect to socket.io 
        const io = socketio(socketServer);

        //Fired once users connects
        io.sockets.on('connection', (socket) => {

            console.log('New Connection recieved',socket.id);

            //Join Game
            joinGame(socket);

            //Check whether opponent exists for the game to pair
            const opponent_socket = getOpponent(socket);

            //If opponent exists start the game or wait for the opponent to join the game
            if(opponent_socket)
            {
                //Get Players symbol
                const player_symbol = getPlayerSymbol(socket)  //Player 2
                const opponent_symbol = getPlayerSymbol(opponent_socket) //Player 1

                //Emit the event to start Player 2 game
                socket.emit('game.begin',{
                    symbol:player_symbol,
                    player:2
                })

                 //Emit the event to start Player 1 game
                 opponent_socket.emit('game.begin',{
                    symbol:opponent_symbol,
                    player:1
                })
            }

            //No opponent has joined the game
            else{
                socket.emit('game.waitToJoin')
            }

        //Emit when user enters any command in command line
        socket.on('message', (cmd) => {

            //To know whether it is chance of the player who is trying to play
            turn = getPlayerTurn(socket)

            //To check whether the game is not over yet
            if(!isGameOver(socket))
            {

                //Wrong player move
                if(!turn)
                    socket.emit('game.move', {...cmd,turn})

                //Right player move
                else{
                    const opponent_socket = getOpponent(socket)    
                    const move = cmd.cmd.split('\n');

                    //Check whether user is entering a valid key or move
                    const {status, msg} = checkValidMove(socket,move[0]);
                    
                    //When user enters the valid key or move
                    if(!status)
                    {
                        //Set the move in players data
                        setPlayerMoves(socket,move[0])

                        //Chek whether the move played is the winning move
                        if( !isWinningMove(socket)){

                            //Check whether the move played is drawing the match
                            if(!isMatchDraw(socket)){

                                //Show status of game to both the players
                                socket.emit('game.status',getPlayerDetails(socket));
                                opponent_socket.emit('game.status',getPlayerDetails(opponent_socket))

                                const symbol = getPlayerSymbol(opponent_socket)

                                //Display message to both the users letting them know who have the next turn
                                opponent_socket.emit('game.move', {...cmd,turn,symbol})
                                socket.emit('game.waiting')

                                //Change Turn of the player
                                changeTurn(socket)

                            }

                            //
                            else{
                                socket.emit('game.status',getPlayerDetails(socket));
                                opponent_socket.emit('game.status',getPlayerDetails(opponent_socket))
                                socket.emit('game.draw')
                                opponent_socket.emit('game.draw')
                            }
                        }

                        else{
                            socket.emit('game.status',getPlayerDetails(socket));
                            opponent_socket.emit('game.status',getPlayerDetails(opponent_socket))
                            socket.emit('game.won',cmd)
                            opponent_socket.emit('game.won',cmd)
                        }
                    }

                    //If user has not played valid move i.e 1-9
                    else
                    {
                        //Check whether player has entered r key to resign
                        if(hasResigned(socket,move[0])){
                            socket.emit('game.resign')
                            opponent_socket.emit('game.opponentResign')
                        }

                        else
                        socket.emit('game.invalidMove',msg)

                    }
                }
            }

            //Game Over
            else{
                socket.emit('game.over')
            }
        })

        //When users disconnects
        socket.on('disconnect',() => {
            const opponent_socket = getOpponent(socket)
            opponent_socket.emit('game.opponentLeft')

            //Make winner to the opponent of player who left
            makeWinner(socket)
        });

    });
    }
}
