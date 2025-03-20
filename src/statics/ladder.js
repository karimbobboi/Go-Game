import { EMPTY, BLACK, WHITE } from './constants';
import { getLibertiesAt } from './pieces';
import { neighboringPoints } from './utils';
import { Region } from './region';

function detectLadders(board) {
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
        if (!atari) return;

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

function ladder_configurations(ladder_prey, atari, board) {
    let config = {};
    const atariNeighbours = neighboringPoints(atari.x, atari.y, board);
    const emptyPoints = atariNeighbours.filter(point => board[point.x][point.y] == EMPTY);

    if(emptyPoints.length > 2) return -1;

    const [point1, point2] = emptyPoints;
    const directions = {
        top: { x: -1, y: 0 },
        bottom: { x: 1, y: 0 },
        left: { x: 0, y: -1 },
        right: { x: 0, y: 1 }
    };

    // Determine direction for first point
    let dir1 = Object.entries(directions).find(([_, dir]) => 
        point1.x - atari.x === dir.x && point1.y - atari.y === dir.y
    )?.[0];

    // Determine direction for second point
    let dir2 = Object.entries(directions).find(([_, dir]) => 
        point2.x - atari.x === dir.x && point2.y - atari.y === dir.y
    )?.[0];

    // Set configuration based on direction combinations
    const configs = {
        'bottom,left': { nx: 1, ny: -1 },
        'left,bottom': { nx: 1, ny: -1 },
        'bottom,right': { nx: 1, ny: 1 },
        'right,bottom': { nx: 1, ny: 1 },
        'top,left': { nx: -1, ny: -1 },
        'left,top': { nx: -1, ny: -1 },
        'top,right': { nx: -1, ny: 1 },
        'right,top': { nx: -1, ny: 1 }
    };

    const key = `${dir1},${dir2}`;
    return configs[key] || -1;
}

export function simulateLadder(board) {
    const copyBoard = board.map(innerArray => [...innerArray]);
    const [anyLadder, ataris, prey] = detectLadders(copyBoard);

    if(anyLadder.length < 1){
        return {board: copyBoard, successful: -1}; // no ladder sequence found
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