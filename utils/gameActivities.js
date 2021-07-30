var players = {},
  unmatched;

module.exports = {
    joinGame: (socket) => {

        //Creating Player object for new player
        players[socket.id] = {
            socket:socket,
            opponent:unmatched,
            symbol : 'X',
            turn:true,
            myMoves : [ false, false, false, false, false, false, false, false, false],
            myOpponentMoves : [ false, false, false, false, false, false, false, false, false],
            win:false,
            resign:false,
            draw:false
        }

        //This condition is for the first player who joins
        if(!unmatched)
        {
            unmatched = socket.id;
        }

        //This condition is for the opponent player who joins
        else{
            players[socket.id].symbol = 'O';

            //Updating first player opponent as it was undefined
            players[unmatched].opponent = socket.id;
            players[socket.id].turn = false;

            //This makes again available for the continuous process of pairing two players at a time.
            unmatched = null;
        }
    },

    getOpponent: (socket) => {

        //Check if opponent exists or not
        if(!players[socket.id].opponent)
            return;
        
        return players[players[socket.id].opponent].socket;
    },

    getPlayerSymbol : (socket) => {

        //Send player symbol
        return players[socket.id].symbol;
    },

    getPlayerSocket : (id) => {
        return players[id].socket
    },

    getPlayerTurn : (socket) => {

        //Send player turn
        return players[socket.id].turn;
    },

    changeTurn : (socket) => {
        players[socket.id].turn = false;
        players[players[socket.id].opponent].turn = true
    },

    setPlayerMoves : (socket,move) => {
        players[socket.id].myMoves[move-1] = true;
        players[players[socket.id].opponent].myOpponentMoves[move-1] = true;
    },

    getPlayerDetails : (socket) => {
        const { myMoves, myOpponentMoves, symbol } = players[socket.id];
        const opponentSymbol = players[players[socket.id].opponent].symbol;
        return {myMoves, myOpponentMoves, symbol, opponentSymbol}    
    },

    checkValidMove : (socket,move) => {

        if(move > 9 || move < 1)
        return {status:true, msg: 'Please Enter the move between 1 - 9 '}

        else if(players[socket.id].myMoves[move-1] === true || players[socket.id].myOpponentMoves[move-1] === true)
        return  {status:true, msg: 'This move is already played. Please play another move. '}

        else if(move <= 9 && move >= 1)
        return  {status:false, msg:'Valid move'}

        else
        return {status:true, msg: 'Please Enter the move between 1 - 9 '}


    },

    hasResigned: (socket,move) => {
        if(move === 'r')
        {
            players[players[socket.id].opponent].win = true;
            return {status:true, msg: 'Opponent has resigned the game. You win !'}
        }

    },

    isWinningMove : (socket) => {
        const a1 = players[socket.id].myMoves[0];
        const a2 = players[socket.id].myMoves[1];
        const a3 = players[socket.id].myMoves[2];
        const b1 = players[socket.id].myMoves[3];
        const b2 = players[socket.id].myMoves[4];
        const b3 = players[socket.id].myMoves[5];
        const c1 = players[socket.id].myMoves[6];
        const c2 = players[socket.id].myMoves[7];
        const c3 = players[socket.id].myMoves[8];

        if(a1 === true && a2 === true && a3 ===true)
        {
            players[socket.id].win = true;
            return true
        }

        else if(b1 === true && b2 === true && b3 ===true)
        {
            players[socket.id].win = true;
            return true
        }
        else if(c1 === true && c2 === true && c3 ===true)
        {
            players[socket.id].win = true;
            return true
        }
        else if(a1 === true && b1 === true && c1 ===true)
        {
            players[socket.id].win = true;
            return true
        }
        else if(a2 === true && b2 === true && c2 ===true)
        {
            players[socket.id].win = true;
            return true
        }
        else if(a3 === true && b3 === true && c3 ===true)
        {
            players[socket.id].win = true;
            return true
        }
        else if(a1 === true && b2 === true && c3 ===true)
        {
            players[socket.id].win = true;
            return true
        }
        else if(a3 === true && b2 === true && c1 ===true)
        {
            players[socket.id].win = true;
            return true
        }
        else
        return false

    },

    isMatchDraw: (socket) => {
        const { myMoves , myOpponentMoves } = players[socket.id];
        var flag = true;
        myMoves.map((move,index) => {
            if(move !== true && myOpponentMoves[index] !== true)
                flag = false;
        })

        if(flag){
        players[players[socket.id].opponent].draw = true;
        players[socket.id].draw = true;
        }


        return flag
    },

    makeWinner : (socket) => {
        players[players[socket.id].opponent].win = true;
    },

    isGameOver : (socket) => {
        if(players[players[socket.id].opponent].win === true || players[socket.id].win === true)
            return true
        
        if(players[players[socket.id].opponent].draw === true || players[socket.id].draw === true)
            return true
            
        if(players[players[socket.id].opponent].resign === true || players[socket.id].resign === true)
            return true
        
        else
        return false
    }



}