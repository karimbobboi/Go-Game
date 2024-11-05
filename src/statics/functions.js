import white from '../assets/w.png';
import black from '../assets/b.png';

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

// initial redrawing of the canvas
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

// for redrawing the entire canvas
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

    if(!numbered){
        return;
    }
    
    for(var i = 0; i < pieceNumbers.length; i++){
        var row = pieceNumbers[i][0];
        var col = pieceNumbers[i][1];
        var dead = pieceNumbers[i][2];
        if(dead)
          continue;
        const r = (row == cell) ? row - cell : (row - (cell/2)) / cell;
        const c = (col == cell) ? col - cell : (col - (cell/2)) / cell;
        
        if(this.board[c][r] != EMPTY){ 
            numberedPieces(ctx, row, col, (pieceNumbers.length) - i);
        }
    }
}

// draws the star points
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

// numbers a piece
export function numberedPieces(ctx, row, col, num){
    const fontSize = window.boardSize < 19 ? '1.5rem' : '1rem';
    const cell = Math.round((800/(window.boardSize + 1))/2);
    ctx.font = `${fontSize} Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#E9190F';
    ctx.fillText(num, row + cell, col + cell);
}

// add to 2d Go board
export function update2DBoard(x, y, pColour, boardStack, board) {
    if (pColour == "star") {
    }
    if (pColour == "star") {
        boardStack.pop(); // add current board state to stack
        board[y][x] = EMPTY;print2DBoard(board)
        return true;
    }
    else if (this.board[y][x] != '*') {
        return false;
    }
    else if (pColour == "white" || pColour == "black") {
        this.board[y][x] = (pColour == "white") ? '1' : '0';
        return true;
    }
    else {
        return false;
    }
}

export function print2DBoard(brd) {
    console.log("");
    console.log("\n@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
    brd.forEach(v => console.log(...v));
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
}

export function getLiberties(x, y, board, checkBoard, deadCells) {
    if(board[y][x] === '*'){ 
        return -1;
    }
     if(checkBoard[y][x] === "@" || checkBoard[y][x] === "£" ){ // if already checked, assume no liberties
        return 0;
    }
    checkBoard[y][x] = "@";

    var checklib = [[0, 1], [0, -1], [1, 0], [-1, 0]]
    var count = 0; // count liberties

    for(var i = 0; i < 4; i++) {
        var pX = Number(x) + checklib[i][0];
        var pY = Number(y) + checklib[i][1];

        if((pX > -1 && pY > -1) && (pX < window.boardSize && pY < window.boardSize)) { //valid position
            if(board[pY][pX] === EMPTY) {
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

// resets board for keeping track of checked intersections when counting liberties (checkBoard)
export function resetCheckBoard(redraw, checkBoard, board) {
    var count = 0;
    for(var i = 0; i < window.boardSize; i++) {
        for(var j = 0; j < window.boardSize; j++) {
            if(redraw && (checkBoard[j][i] === "@" || checkBoard[j][i] === "£")){
                board[j][i] = EMPTY;
                redraw = true;
                count++;
            }
            checkBoard[j][i] = EMPTY;
        }
    }
    return count
}

export function cloneBoard(brd) {
    return brd.map(row => row.slice());
}

export function toggleTimers(lastColour){
    if(lastColour == "white"){
        return [false, true]
    } else {
        return [true, false]
    }
}

const EMPTY = '*';
const BLACK = '0';
const WHITE = '1';

function isOnBoard(x, y, size) {
    return x >= 0 && x < size && y >= 0 && y < size;
}

function floodFill(board, x, y, size, visited) {
    let queue = [[x, y]];
    let territory = [];
    let bordersBlack = false;
    let bordersWhite = false;

    while (queue.length > 0) {
        let [tempX, tempY] = queue.pop();
        if (visited[tempX][tempY]) {
          continue;
        };
        visited[tempX][tempY] = true;
        territory.push([tempX, tempY]);

        let neighbors = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (let [dx, dy] of neighbors) {
            let nx = tempX + dx;
            let ny = tempY + dy;

            if (isOnBoard(nx, ny, size)) {
                if (board[nx][ny] === EMPTY && !visited[nx][ny]) {
                    queue.push([nx, ny]);
                } else if (board[nx][ny] === BLACK) {
                    bordersBlack = true;
                } else if (board[nx][ny] === WHITE) {
                    bordersWhite = true;
                }
            }
        }
    }

    return {territory, bordersBlack, bordersWhite};
}

export function calculateTerritory(board) {
  const size = window.boardSize;
    let visited = new Array(size).fill(null).map(() => new Array(size).fill(false));
    let blackTerritory = 0;
    let whiteTerritory = 0;

    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            if (board[x][y] === EMPTY && !visited[x][y]) {
                let { territory, bordersBlack, bordersWhite } = floodFill(board, x, y, size, visited);

                // check if territory is completely surrounded by only one colour
                if (bordersBlack && !bordersWhite) {
                    blackTerritory += territory.length;
                } else if (bordersWhite && !bordersBlack) {
                    whiteTerritory += territory.length;
                }
            }
        }
    }
    return {
      black: blackTerritory,
      white: whiteTerritory
    };
}

function neighboringPoints(x, y, board) {
  const neighbors = [];
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  directions.forEach(([dx, dy]) => {
    const nx = x + dx, ny = y + dy;
    if (nx >= 0 && nx < board.length && ny >= 0 && ny < board[0].length) {
      neighbors.push({x: nx, y: ny});
    }
  });
  return neighbors;
}

function partitionTraverse(startX, startY, board) {
  let boundaries = [];
  let checked = [];
  let pointsToCheck = [[startX, startY]];
  const startColor = board[startX][startY];

  while (pointsToCheck.length > 0) {
    const [x, y] = pointsToCheck.pop();
    if (!checked.some(p => p[0] === x && p[1] === y)) {
      checked.push([x, y]);
      let allNeighbors = neighboringPoints(x, y, board);

      allNeighbors.forEach(neighbor => {
        if (!checked.some(p => p[0] === neighbor.x && p[1] === neighbor.y)) {
          if (board[neighbor.x][neighbor.y] === startColor) {
            pointsToCheck.push([neighbor.x, neighbor.y]);
          } else {
            boundaries.push([neighbor.x, neighbor.y]);
          }
        }
      });
    }
  }

  let uniqueBoundaries = [];
  boundaries.forEach(el => {
    if (!uniqueBoundaries.some(p => p[0] === el[0] && p[1] === el[1])) {
      uniqueBoundaries.push(el);
    }
  });

  return [checked, uniqueBoundaries];
}

class Region {
  constructor(board, intersections) {
    this.boardReg = board;
    this.intersections = intersections;
    Object.freeze(this);
  }

  static getRegions(board) {
    let checked = [];
    const regions = [];

    for (let x = 0; x < board.length; x++) {
      for (let y = 0; y < board[0].length; y++) {
        if (!checked.some(p => p[0] === x && p[1] === y)) {
          const [regionPoints, _] = partitionTraverse(x, y, board);
          const newReg = new Region(board, regionPoints);
          regions.push(newReg);
          checked = [...checked, ...regionPoints];
        }
      }
    }

    return regions;
  }

  isTerritory() {
    const point = this.intersections[0];
    if (this.boardReg[point[0]][point[1]] != EMPTY) {
      return false;
    }

    const [_, boundaryPoints] = partitionTraverse(point[0], point[1], this.boardReg);
    let surroundingColors = [];
    boundaryPoints.forEach(el => {
      if (surroundingColors.indexOf(this.boardReg[el[0]][el[1]]) < 0) {
        surroundingColors.push(this.boardReg[el[0]][el[1]]);
      }
    });
    return (surroundingColors.length === 1 && surroundingColors[0] !== EMPTY);
  }

  isNeutral() {
    const point = this.intersections[0];
    return !(this.boardReg[point[0]][point[1]] == BLACK) && !(this.boardReg[point[0]][point[1]] == WHITE) && !this.isTerritory();
  }

  exterior() {
    let exteriorPoints = [];
  
    for (let i = 0; i < this.boardReg.length; i++) {
      for (let j = 0; j < this.boardReg[i].length; j++) {
        if (!this.intersections.some(el => el[0] == i && el[1] == j)) {
          const neighbors = neighboringPoints(i, j, this.boardReg);
          if (neighbors.some(neighbor => this.intersections.some(el => el[0] === neighbor.x && el[1] === neighbor.y))) {
            exteriorPoints.push([i, j]);
          }
        }
      }
    }
    return exteriorPoints;
  }
  boundaryStones() {
    const boundaryStones = this.exterior().filter(i => this.boardReg[i[0]][i[1]] != this.boardReg[this.intersections[0][0]][this.intersections[0][1]]);
    return boundaryStones;
  }
  expandedBoundaryStones() {
    const boundaryStones = this.boundaryStones();
    const regions = Region.getRegions(this.boardReg).filter(r => r.intersections.some(i => boundaryStones.some(el => el[0] == i[0] && el[1] == i[1])));
    return flatMap(regions, r => r.intersections);
  }
  static Merge(board, regions, region) {
    let mergedRegions = [region];
    let length = -1; 
    while (mergedRegions.length != length) {
      length = mergedRegions.length;
      mergedRegions = regions.filter(r => {
        return r.boardReg[r.intersections[0][0]][r.intersections[0][1]] == EMPTY && r.isTerritory() 
        && board[r.intersections[0][0]][r.intersections[0][1]] == board[region.intersections[0][0]][region.intersections[0][1]] 
        && r.expandedBoundaryStones().some(stone => {
          return mergedRegions.some(latestRegion => {
            return latestRegion.expandedBoundaryStones().some(el => el[0] == stone[0] && el[1] == stone[1]);
          });
        });
      });
    }
    return mergedRegions;
  };

  numOfEyes(){
    const point = this.intersections[0];
    if (this.boardReg[point[0]][point[1]] != EMPTY) {
      return -1;
    }

    let boundaryLength = 0;
    const borderPoints = this.intersections.filter(i => {
      return i[1] === 0 || i[1] === window.boardSize - 1 || i[0] === 0 || i[0] === window.boardSize - 1;
    });
    const cornerPoints = this.intersections.filter(i => {
      return i[1] % window.boardSize - 1 === 0 && i[0] % window.boardSize - 1 === 0;
    });

    boundaryLength = this.boundaryStones().length + borderPoints.length + cornerPoints.length;
    if (boundaryLength >= 10) {
      return 2;
    } else if (boundaryLength <= 6 && boundaryLength > 1) {
      return 1;
    } else if (boundaryLength == 7) {
      return 1.5;
    } else {
      return -1;
    }
  }

  territoryColour(){
    const point = this.intersections[0];
    const [_, boundaryPoints] = partitionTraverse(point[0], point[1], this.boardReg);
    let surroundingColors = [];
    boundaryPoints.forEach(el => {
      if (surroundingColors.indexOf(this.boardReg[el[0]][el[1]]) < 0) {
        surroundingColors.push(this.boardReg[el[0]][el[1]]);
      }
    });

    if (surroundingColors.length === 1 && surroundingColors[0] !== EMPTY){
      return surroundingColors[0];
    } else {
      return -1  ;
    }
  }
}

function flatMap (ary, condition) {
  return Array.prototype.concat.apply([], ary.map(condition));
}

function isFalse(board, x, y){
  if (board[x][y] != EMPTY) {
    return false;
  }

  let possibleX = [];
  let possibleY = [];
  if (x > 0) {
    possibleX.push(x - 1);
  }

  if (x < (window.boardSize - 1)) {
    possibleX.push(x + 1);
  }

  if (y > 0) {
    possibleY.push(y - 1);
  }

  if (y < (window.boardSize - 1)) {
    possibleY.push(y + 1);
  }

  const diagonals = [];
  possibleX.forEach(x => {
    possibleY.forEach(y => {
      diagonals.push([x, y]);
    });
  });

  const onFirstLine = diagonals.length < 3;
  const occupiedNeighbors = neighboringPoints(x, y, board).filter(i => board[i.x][i.y] != EMPTY);
  if (onFirstLine && occupiedNeighbors.length < 1) {
    return false;
  } else if (!onFirstLine && occupiedNeighbors.length < 2) {
    return false;
  }

  const opposingOccupiedDiagonals = diagonals.filter(d => board[d[0]][d[1]] != EMPTY && board[d[0]][d[1]] != board[occupiedNeighbors[0].x][occupiedNeighbors[0].y]);
  if (onFirstLine) {
    return opposingOccupiedDiagonals.length >= 1;
  } else {
    return opposingOccupiedDiagonals.length >= 2;
  }
}

function getLiberties2(x, y, board, checkBoard) {
  if(board[x][y] === EMPTY){ 
      return -1;
  }
   if(checkBoard[x][y] === "@" || checkBoard[x][y] === "£" ){ // if already checked, assume no liberties
      return 0;
  }
  checkBoard[x][y] = "@";

  var checklib = [[0, 1], [0, -1], [1, 0], [-1, 0]]
  var count = 0; // count liberties

  for(var i = 0; i < 4; i++) {
      var pX = Number(x) + checklib[i][0];
      var pY = Number(y) + checklib[i][1];

      if((pX > -1 && pY > -1) && (pX < window.boardSize && pY < window.boardSize)) { //valid position
          if(board[pX][pY] === EMPTY && checkBoard[pX][pY] == EMPTY) {
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

export function getLibertiesAt(x, y, board){
  let checkBoard = cloneBoard(board);
  return getLiberties2(x, y, board, checkBoard);
}

function withoutNeutralPoints(board) {
  const regions = Region.getRegions(board);
  const neutralRegions = regions.filter(el => el.isNeutral());
  if ((regions.length == 0 || neutralRegions.length == 0)) {
    return board;
  }
  const replacements = [];
  neutralRegions.forEach(el => {
    let startingX = null;
    let startingY = null;
    el.intersections.forEach(intersection => {
      startingX = startingX || intersection[0];
      startingY = startingY || intersection[1];
      const manhattanDistance = Math.abs(intersection[1] - startingY) + Math.abs(intersection[0] - startingX);
      replacements[intersection[0]] = replacements[intersection[0]] || [];
      replacements[intersection[0]][intersection[1]] = [BLACK, WHITE][manhattanDistance % 2]; //creates an alternating pattern
    });
  });

  let newBoard = board.map(row => row.slice());
  for (let x = 0; x < replacements.length; x++) {
    if (replacements[x]) { 
      for (let y = 0; y < replacements[x].length; y++) {
        if (replacements[x][y]) {
          newBoard[x][y] = replacements[x][y];
        }
      }
    }
  }
  return newBoard;
};

function withoutFalseEyes(board){
  const territoryRegions = Region.getRegions(board).filter(el => el.isTerritory());
  const falseEyePoints = flatMap(territoryRegions, el => el.intersections).filter(i => isFalse(board, i[0], i[1]));

  let pointsNeighboringAtari = []
  for(let i = 0; i < falseEyePoints.length; i++){
    const el = falseEyePoints[i];
    const neighbors = neighboringPoints(el[0], el[1], board);
    for(let j = 0; j < neighbors.length; j++){
      const n = neighbors[i];
      const liberties = getLibertiesAt(n.x, n.y, board);
      if(liberties == 1){
        if(pointsNeighboringAtari.indexOf(el) < 0){ pointsNeighboringAtari.push(el) }
      }
    }
  }

  let neutralAtariUpdatedState = board;
  while (pointsNeighboringAtari.length > 0){
    let newPoints = [];
    for(let x = 0; x < neutralAtariUpdatedState.length; x++){
      for(let y = 0; y < neutralAtariUpdatedState.length; y++){
        const is_point = pointsNeighboringAtari.some(el => {
          return el[0] === x && el[1] === y;
        });

        if(is_point){
          const neighbors = neighboringPoints(x, y, neutralAtariUpdatedState);
          const fillColor = neutralAtariUpdatedState[neighbors[0].x][neighbors[0].y]
          newPoints.push([x, y, fillColor]);
        }
      }
    }

    newPoints.forEach(([x, y, fillColor]) => {
      if (x < neutralAtariUpdatedState.length && y < neutralAtariUpdatedState[x].length) {
        neutralAtariUpdatedState[x][y] = fillColor;
      }
    });

    const board = withoutNeutralPoints(neutralAtariUpdatedState);
    const territoryRegions = Region.getRegions(board).filter(el => el.isTerritory());
    const falseEyePoints = flatMap(territoryRegions, el => el.intersections).filter(i => isFalse(board, i[0], i[1]));
    pointsNeighboringAtari = falseEyePoints.filter(i => {
      const el = falseEyePoints[i];
      return neighboringPoints(el[0], el[1], board).some(neighbor => {
        return getLibertiesAt(neighbor.x, neighbor.y, board) == 1;
      });
    });
  }

  return neutralAtariUpdatedState;
}

export function territoryScoring(board){
  const withoutNeutralPointsBoard = withoutNeutralPoints(board);
  const withClearFalseEyesFilled = withoutFalseEyes(withoutNeutralPointsBoard);
  const territoryRegions = Region.getRegions(withClearFalseEyesFilled).filter(el => el.isTerritory());

  const territoryRegionsWithoutSeki = territoryRegions.filter(r => {
    const merged = Region.Merge(r.boardReg, territoryRegions, r); //merge r with adjacent regions based on boundarystones and if shared territory
    const eyes = merged.map(el => Math.ceil(el.numOfEyes())); // checks for likelihood of eyes. not necessarily precise. doesnt have to be.
    return (eyes.length > 0 && eyes.reduce((a, b) => a + b) >= 2); // sum all eyes; and if less than 2, then seki.
  });

  const blackRegions = territoryRegionsWithoutSeki.filter(r => r.territoryColour() == BLACK);
  const whiteRegions = territoryRegionsWithoutSeki.filter(r => r.territoryColour() == WHITE);
  let territoryControlledBlack = 0;
  for (let i = 0; i < blackRegions.length; i++) {
    territoryControlledBlack += blackRegions[i].intersections.length;
  }
  let territoryControlledWhite = 0;
  for (let i = 0; i < whiteRegions.length; i++) {
    territoryControlledWhite += whiteRegions[i].intersections.length;
  }

  return {
    black: territoryControlledBlack,
    white: territoryControlledWhite
  };
}

function detectLadders(board){
  const regions = Region.getRegions(board);
  let ladder_sequences = []

  regions.forEach(el => {
    const intersections = el.intersections[0];
    const lib = getLibertiesAt(intersections[0], intersections[1], board);
    if(lib == 1){
      ladder_sequences.push(el);
    }
  });

  let ataris = [];
  let prey;
  ladder_sequences.forEach(seqs => {
    const atari = seqs.boundaryStones().find(el => board[el[0]][el[1]] == EMPTY);
    if (!atari)
      return;

    const neighbours = neighboringPoints(atari[0], atari[1], board);
    let blackStones = 0;
    let whiteStones = 0;
    let emptyPoints = 0;
    neighbours.forEach(point => {
      const pointColour = board[point.x][point.y];
      if(pointColour == BLACK)
        blackStones += 1;
      else if(pointColour == WHITE)
        whiteStones += 1;
      else if(pointColour == EMPTY)
        emptyPoints += 1;
    })
    if(blackStones == 1 && whiteStones == 1 && emptyPoints == 2){
      ataris.push(atari);
      prey = neighbours.find(point => {
        const lib = getLibertiesAt(point.x, point.y, board);
        return lib == 1;
      });
    }
  })
  
  return [ladder_sequences, ataris, prey];
}

function ladder_configurations(ladder_prey, atari, board){
  let config = new Object();
  const atariNeighbours = neighboringPoints(atari.x, atari.y, board);
  const emptyPoints = atariNeighbours.filter(point => board[point.x][point.y] == EMPTY);

  if(emptyPoints.length > 2){
    return -1;
  } 
  let top = false;
  let bottom = false;
  let left = false;
  let right = false;

  // top
  if((emptyPoints[0].x < atari.x) && (emptyPoints[0].y == atari.y))
    top = true;
  // bottom
  if((emptyPoints[0].x > atari.x) && (emptyPoints[0].y == atari.y))
    bottom = true;
  // left
  if((emptyPoints[0].x == atari.x) && (emptyPoints[0].y < atari.y))
    left = true;
  // right
  if((emptyPoints[0].x == atari.x) && (emptyPoints[0].y > atari.y))
    right = true;

  let top2 = false;
  let bottom2 = false;
  let left2 = false;
  let right2 = false;

  // top
  if((emptyPoints[1].x < atari.x) && (emptyPoints[1].y == atari.y))
    top2 = true;
  // bottom
  if((emptyPoints[1].x > atari.x) && (emptyPoints[1].y == atari.y))
    bottom2 = true;
  // left
  if((emptyPoints[1].x == atari.x) && (emptyPoints[1].y < atari.y))
    left2 = true;
  // right
  if((emptyPoints[1].x == atari.x) && (emptyPoints[1].y > atari.y))
    right2 = true;

  // Moving down-left 
  if((bottom && left2) || (bottom2 && left)){
    config.nx = 1;
    config.ny = -1
  }

  // Moving down-right 
  if((bottom && right2) || (bottom2 && right)){
    config.nx = 1;
    config.ny = 1;
  }

  // Moving up-left 
  if((top && left2) || (top2 && left)){
    config.nx = -1;
    config.ny = -1;
  }

  // Moving up-right 
  if((top && right2) || (top2 && right)){
    config.nx = -1;
    config.ny = 1;
  }

  return config;
}

export function simulateLadder(board){
  const copyBoard = board.map(innerArray => [...innerArray]);
  const [anyLadder, ataris, prey] = detectLadders(copyBoard);

  if(anyLadder.length < 1){
    return {board: copyBoard, successful: -1};// no ladder sequence found
  }

  let lib = getLibertiesAt(prey.x, prey.y, copyBoard);

  const preyColour = copyBoard[prey.x][prey.y]
  const hunterColour = preyColour == BLACK ? WHITE : BLACK;
  let atari = prey;
  let firstAtari = {x: ataris[0][0], y: ataris[0][1]}

  const config = ladder_configurations(atari, firstAtari, copyBoard);

  while(lib == 1){
    const neighbours = neighboringPoints(atari.x, atari.y, copyBoard);
    atari = neighbours.find(el => copyBoard[el.x][el.y] == EMPTY);
    copyBoard[atari.x][atari.y] = preyColour;
    
    if(getLibertiesAt(atari.x, atari.y, copyBoard) < 3){
      const neighboringAtari = neighboringPoints(atari.x, atari.y, copyBoard);
      const hunterPiece = neighboringAtari.find(el => {
        const newX = ((el.x) + (config.nx) >= 0) && ((el.x) + (config.nx) < window.boardSize) ? (el.x) + (config.nx) : el.x;
        const newY = ((el.y) + (config.ny) >= 0) && ((el.y) + (config.ny) < window.boardSize) ? (el.y) + (config.ny) : el.y;
        return (copyBoard[el.x][el.y] == hunterColour) && copyBoard[newX][newY] == EMPTY
      });
      if(hunterPiece)
        copyBoard[(hunterPiece.x) + (config.nx)][(hunterPiece.y) + (config.ny)] = hunterColour;
    }

    lib = getLibertiesAt(atari.x, atari.y, copyBoard);
  }
  if(lib == 0){
    return {board: copyBoard, successful: 1} // successful
  } else if(lib > 0){
    return {board: copyBoard, successful: 0} // unsuccessful
  } 
  return {board: copyBoard, successful: -2}; // error
}

export function countStones(board) {
  let count = {
    black: 0,
    white: 0
  };

  for (let row of board) {
    for (let cell of row) {
      if (cell === '0') {
        count.black++;
      } else if (cell === '1') {
        count.white++;
      }
    }
  }

  return count;
}
