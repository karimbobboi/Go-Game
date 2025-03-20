import { EMPTY, BLACK, WHITE } from './constants';
import { Region } from './region';
import { withoutNeutralPoints, withoutFalseEyes } from './utils';

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
        if (visited[tempX][tempY]) continue;
        
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

export function territoryScoring(board) {
    const withoutNeutralPointsBoard = withoutNeutralPoints(board);
    const withClearFalseEyesFilled = withoutFalseEyes(withoutNeutralPointsBoard);
    const territoryRegions = Region.getRegions(withClearFalseEyesFilled).filter(r => r.isTerritory());

    const territoryRegionsWithoutSeki = territoryRegions.filter(r => {
        const merged = Region.Merge(r.boardReg, territoryRegions, r);
        const eyes = merged.map(el => Math.ceil(el.numOfEyes()));
        return (eyes.length > 0 && eyes.reduce((a, b) => a + b) >= 2);
    });

    const blackRegions = territoryRegionsWithoutSeki.filter(r => r.territoryColour() == BLACK);
    const whiteRegions = territoryRegionsWithoutSeki.filter(r => r.territoryColour() == WHITE);
    
    const territoryControlledBlack = blackRegions.reduce((sum, region) => 
        sum + region.intersections.length, 0);
    const territoryControlledWhite = whiteRegions.reduce((sum, region) => 
        sum + region.intersections.length, 0);

    return {
        black: territoryControlledBlack,
        white: territoryControlledWhite
    };
}

export function countStones(board) {
    let count = {
        black: 0,
        white: 0
    };

    for (let row of board) {
        for (let cell of row) {
            if (cell === BLACK) {
                count.black++;
            } else if (cell === WHITE) {
                count.white++;
            }
        }
    }

    return count;
} 