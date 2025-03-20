import { EMPTY, BLACK, WHITE } from './constants';
import {numberedPieces} from './pieces';
import {placePiece} from './pieces';

export function init2DBoard(board, checkBoard) {
    for (let i = 0; i < window.boardSize; i++) {
        const row = [];
        for (let j = 0; j < window.boardSize; j++) {
            row.push('*');
        }
        board.push(row);
        checkBoard.push(row);
    }
}

export function drawBoard(canvas, ctx, scale) {
    const size = 800;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    canvas.width = size * scale;
    canvas.height = size * scale;
    const cellSize = (canvas.width / scale) / (window.boardSize + 1);
    ctx.scale(scale, scale);

    const cell = 800/(window.boardSize + 1);
    ctx.beginPath();
    for (let i = 2; i <= (window.boardSize - 1); i++) {
        // horizontal lines
        ctx.moveTo((cell), (i * cellSize));
        ctx.lineTo((canvas.width / scale) - cell, (i * cellSize));
        ctx.strokeStyle = '#000000';    
        ctx.lineWidth = "1";
        // vertical lines
        ctx.moveTo(i * cellSize, (1 * cell));
        ctx.lineTo(i * cellSize, (canvas.height / scale) - cell);
    }
    ctx.stroke();

    //draw four edge sides to make them darker
    ctx.beginPath();
    ctx.lineWidth = "2";
    ctx.strokeStyle = '#000000';
    
    ctx.moveTo((cell), (1 * cellSize)); // horizontal
    ctx.lineTo((canvas.width / scale) - cell, (1 * cellSize));
    ctx.moveTo(1 * cellSize, (1 * cell)); // vertical
    ctx.lineTo(1 * cellSize, (canvas.height / scale) - cell);

    ctx.moveTo((cell), (window.boardSize * cellSize)); // horizontal
    ctx.lineTo((canvas.width / scale) - cell, (window.boardSize * cellSize));
    ctx.moveTo(window.boardSize * cellSize, (1 * cell)); // vertical
    ctx.lineTo(window.boardSize * cellSize, (canvas.height / scale) - cell);
    
    ctx.stroke();
    
    ctx.beginPath();
    ctx.strokeStyle = "#CCA56D";
    ctx.rect(0, 0, (canvas.width / scale), (canvas.height / scale));
    ctx.stroke();
    drawHoshi(ctx, canvas, scale);
}

export async function redrawBoard(numbered, canvas, ctx, scale, board, pieceNumbers) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const size = 800;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    canvas.width = size * scale;
    canvas.height = size * scale;
    const cellSize = (canvas.width / scale) / (window.boardSize + 1);
    ctx.scale(scale, scale);
    const cell = 800/(window.boardSize + 1);

    for (let i = 1; i <= window.boardSize; i++) {
        // horizontal lines
        ctx.beginPath();
        ctx.moveTo((cell), (i * cellSize));
        ctx.lineTo((canvas.width / scale) - cell, (i * cellSize)); 
        ctx.strokeStyle = '#000000';
        if (i == 1 || i == window.boardSize)
            ctx.lineWidth = "2";
        else
            ctx.lineWidth = "1";
        ctx.stroke();
        // vertical lines
        ctx.beginPath();
        ctx.moveTo(i * cellSize, (1 * cell));
        ctx.lineTo(i * cellSize, (canvas.height / scale) - cell);
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.lineWidth = "80";
    ctx.strokeStyle = "#CCA56D";
    ctx.rect(0, 0, (canvas.width / scale), (canvas.height / scale));
    ctx.stroke();
    drawHoshi(ctx, canvas, scale);
    
    for (let i = 0; i < window.boardSize; i++) {
        for (let j = 0; j < window.boardSize; j++) {
            if (board[j][i] != EMPTY) {
                const pColour = (board[j][i] == "1") ? "white" : "black";
                try {
                    await placePiece(numbered, (i * cell) + (cell/2), (j * cell) + (cell/2), pColour, '', canvas, ctx, scale);
                }
                catch (error) {
                    console.error('Error placing piece:', error);
                }
            }
        }
    }

    if(!numbered) return;
    
    for(var i = 0; i < pieceNumbers.length; i++){
        var row = pieceNumbers[i][0];
        var col = pieceNumbers[i][1];
        var dead = pieceNumbers[i][2];
        if(dead) continue;
        
        const r = (row == cell) ? row - cell : (row - (cell/2)) / cell;
        const c = (col == cell) ? col - cell : (col - (cell/2)) / cell;
        
        if(board[c][r] != EMPTY){ 
            numberedPieces(ctx, row, col, (pieceNumbers.length) - i);
        }
    }
}

export function drawHoshi(ctx, canvas, scale) {
    const cellSize = (canvas.width / scale) / (window.boardSize + 1);
    const starSize = cellSize / 10;
    ctx.fillStyle = 'black';
    let positions;
    if(window.boardSize == 9)
        positions = [3, 7];
    else if(window.boardSize == 13)
        positions = [4, 10];
    else if (window.boardSize == 19)
        positions = [4, 10, 16];

    ctx.beginPath();
    for(var i = 0; i < positions.length; i++){
        for(var j = 0; j < positions.length; j++){
            const row = positions[i];
            const col = positions[j];
            ctx.moveTo(col * cellSize, (row * 40));
            ctx.arc(col * cellSize, row * cellSize, starSize, 0, 2 * Math.PI);
        }
    }
    if(window.boardSize == 9){
        ctx.moveTo(5 * cellSize, (5 * 40));
        ctx.arc(5 * cellSize, 5 * cellSize, starSize, 0, 2 * Math.PI);
    } else if(window.boardSize == 13){
        ctx.moveTo(7 * cellSize, (7 * 40));
        ctx.arc(7 * cellSize, 7 * cellSize, starSize, 0, 2 * Math.PI);
    } 
    ctx.fill();
}

export function update2DBoard(x, y, pColour, boardStack, board) {
    if (pColour == "star") {
        boardStack.pop();
        board[y][x] = EMPTY;
        return true;
    }
    else if (board[y][x] != '*') {
        return false;
    }
    else if (pColour == "white" || pColour == "black") {
        board[y][x] = (pColour == "white") ? '1' : '0';
        return true;
    }
    else {
        return false;
    }
}

export function cloneBoard(brd) {
    return brd.map(row => row.slice());
}

export function print2DBoard(brd) {
    console.log("");
    console.log("\n@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
    brd.forEach(v => console.log(...v));
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
} 