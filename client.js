var socket = require('socket.io-client')('http://localhost:5050');
  const repl = require('repl')
  const chalk = require('chalk');


  let current_player = null;

  // When users disconnects
  socket.on('disconnect', function() {
      socket.emit('disconnect')
  });

  //When user connects
  socket.on('connect', () => {

    //Display this message to the user
      process.argv[2] ? console.log(chalk.blue(`=== Welcome to Tic Tac Toe Game ${process.argv[2]}===`)) : console.log(chalk.blue('=== Welcome to Tic Tac Toe Game ==='))
      username = process.argv[2]
  })

  //Player 1 is waiting to join for the opponent
  socket.on('game.waitToJoin',() => {
    console.log('Waiting for opponent to join ..........')
  })  

  //When Both players are paired. Display message to start game 
  socket.on('game.begin',({symbol,player}) => {
      symbol === 'X' ? console.log('Game Started. You are Player '+ player) : console.log('Game Started. You are Player '+ player)
      current_player = player;
      console.log(chalk.green('General Description'))
      console.log('The Tic-Tac-Toe board is numbered like this :')
      console.log(chalk.green(' 1  2  3'))
      console.log(chalk.green(' 4  5  6'))
      console.log(chalk.green(' 7  8  9'))
      symbol === 'X' ? console.log(chalk.blue(' Its Your Turn. Please enter your position to move !')) : console.log(chalk.blue('Your Opponent Turn. Please wait untill he plays the move !'))
  })

//Game is over. Either player has won, draw or resigned.
  socket.on('game.over', () => {
    console.log(chalk.red('Game is over. Restart your game to play again !'));

})


  //Validation check on players move
  socket.on('game.move', (data) => {
    const { player, turn, symbol } = data

    //If the wrong player plays
    if(turn === false)
        console.log(chalk.red('Not your turn, Let your Opponent Play'));

    //If the right player plays his turn
    else
    {
        console.log(chalk.blue('Player '+ player + ' has played his move, Now its your turn to play. Your symbol is ' + symbol));
    }
})


//Display message for player waiting for opponent to play
socket.on('game.waiting',() => {
    console.log(chalk.blue('Waiting for opponent to play ..........'))
  })


//Display the current status of game
socket.on('game.status',({myMoves, myOpponentMoves, symbol, opponentSymbol}) => {
    let str = '';
     myMoves.map((move,index) => {
       const position = index+1
       if(move === true)
       {
            str = str + chalk.bgMagenta(symbol) + ' ';
            if(index === 2 || index === 5 )
                str = str +  '\n';
       }

       else if(myOpponentMoves[index] === true)
       {
            str = str + chalk.bgCyan(opponentSymbol) + ' ';
            if(index === 2 || index === 5 )
                str = str +  '\n';
       }
    
       else{
            str = str + position + ' ';
            if(index === 2 || index === 5 )
                str = str +  '\n';

       }


   })

   console.log(chalk.yellow('**************************'))

   console.log(str)

   console.log(chalk.yellow('**************************'))

})

//Display message for invalid move
socket.on('game.invalidMove',(msg) => {
    console.log(chalk.red(msg))
})


//Display Message for game won
socket.on('game.won', ({player }) => {
        console.log(chalk.green('Player '+ player + ' has won the Game'));
    
})


//Display Message for opponent resign
socket.on('game.opponentResign', () => {
    console.log(chalk.green('You won the Game, Your opponent has resigned the game.'));

})


//Display message for resigned player opponent's
socket.on('game.resign', () => {
    console.log(chalk.red('You lost the Game, Your have resigned the game.'));

})


//Display message for opponent left the game in between
socket.on('game.opponentLeft', () => {
    console.log(chalk.green('You won the game. Your opponent has left the game !'));

})


//Disply message for match draw
socket.on('game.draw', () => {
    console.log(chalk.green('Match Draw !'));

})


//Whenever users enters something in command line it send to the socket server with message event.
  repl.start({
      prompt: '',
      eval: (cmd) => {
          socket.send({cmd,player:current_player})
      }
  })