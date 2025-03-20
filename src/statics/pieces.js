import white from '../assets/w.png';
import black from '../assets/b.png';

export async function placePiece(numbered, row, col, colour, num, canvas, ctx, scale) {
    return new Promise((resolve, reject) => {
        const cellSize = (canvas.width / scale) / (window.boardSize + 1);
        const pieceImage = new Image();
        const pieceColour = colour;
        pieceImage.src = (pieceColour == "white") ? white : black;
        pieceImage.onload = () => {
            ctx.drawImage(pieceImage, row, col, cellSize, cellSize);
            if(numbered)
              numberedPieces(ctx, row, col, num)
            resolve();
        };
        pieceImage.onerror = (error) => {
            reject(error);
        };
    });
}

export function numberedPieces(ctx, row, col, num) {
    const fontSize = window.boardSize < 19 ? '1.5rem' : '1rem';
    const cell = Math.round((800/(window.boardSize + 1))/2);
    ctx.font = `${fontSize} Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#E9190F';
    ctx.fillText(num, row + cell, col + cell);
}

export function getLiberties(x, y, board, checkBoard, deadCells) {
    if(board[y][x] === '*'){ 
        return -1;
    }
    if(checkBoard[y][x] === "@" || checkBoard[y][x] === "£" ){ 
        return 0;
    }
    checkBoard[y][x] = "@";

    var checklib = [[0, 1], [0, -1], [1, 0], [-1, 0]]
    var count = 0;

    for(var i = 0; i < 4; i++) {
        var pX = Number(x) + checklib[i][0];
        var pY = Number(y) + checklib[i][1];

        if((pX > -1 && pY > -1) && (pX < window.boardSize && pY < window.boardSize)) {
            if(board[pY][pX] === '*') {
                count++;
            } else if(board[pY][pX] === board[y][x]) {
                var friendCount = getLiberties(pX, pY, board, checkBoard, deadCells);
                checkBoard[pY][pX] = "@";
                count += friendCount;
            }
        }
    }
    if(count === 0){
        checkBoard[y][x] = '£';
        deadCells.push([x, y, "%"]);
    }
    return count;
}

export function getLibertiesAt(x, y, board) {
    let checkBoard = board.map(row => row.slice());
    return getLiberties2(x, y, board, checkBoard);
}

function getLiberties2(x, y, board, checkBoard) {
    if(board[x][y] === '*'){ 
        return -1;
    }
    if(checkBoard[x][y] === "@" || checkBoard[x][y] === "£" ){ 
        return 0;
    }
    checkBoard[x][y] = "@";

    var checklib = [[0, 1], [0, -1], [1, 0], [-1, 0]]
    var count = 0;

    for(var i = 0; i < 4; i++) {
        var pX = Number(x) + checklib[i][0];
        var pY = Number(y) + checklib[i][1];

        if((pX > -1 && pY > -1) && (pX < window.boardSize && pY < window.boardSize)) {
            if(board[pX][pY] === '*' && checkBoard[pX][pY] == '*') {
                count++;
                checkBoard[pX][pY] = '£';
            } else if(board[pX][pY] === board[x][y]) {
                var friendCount = getLiberties2(pX, pY, board, checkBoard);
                checkBoard[pX][pY] = "@";
                count += friendCount;
            }
        }
    }
    return count;
}

export function resetCheckBoard(redraw, checkBoard, board) {
    var count = 0;
    for(var i = 0; i < window.boardSize; i++) {
        for(var j = 0; j < window.boardSize; j++) {
            if(redraw && (checkBoard[j][i] === "@" || checkBoard[j][i] === "£")){
                board[j][i] = '*';
                redraw = true;
                count++;
            }
            checkBoard[j][i] = '*';
        }
    }
    return count;
} 