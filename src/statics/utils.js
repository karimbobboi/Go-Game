import { EMPTY, BLACK, WHITE } from './constants';
import { Region } from './region';
import { getLibertiesAt } from './pieces';

export function toggleTimers(lastColour) {
    if(lastColour == "white"){
        return [false, true]
    } else {
        return [true, false]
    }
}

export function neighboringPoints(x, y, board) {
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

export function flatMap(ary, condition) {
    return Array.prototype.concat.apply([], ary.map(condition));
}

export function withoutNeutralPoints(board) {
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
            replacements[intersection[0]][intersection[1]] = [BLACK, WHITE][manhattanDistance % 2];
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
}

export function withoutFalseEyes(board) {
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
                if(pointsNeighboringAtari.indexOf(el) < 0){ 
                    pointsNeighboringAtari.push(el) 
                }
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