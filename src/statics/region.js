import { EMPTY, BLACK, WHITE } from './constants';
import { neighboringPoints } from './utils';
import { getLibertiesAt } from './pieces';

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

function isFalse(board, x, y) {
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

    const opposingOccupiedDiagonals = diagonals.filter(d => 
        board[d[0]][d[1]] != EMPTY && 
        board[d[0]][d[1]] != board[occupiedNeighbors[0].x][occupiedNeighbors[0].y]
    );
    
    if (onFirstLine) {
        return opposingOccupiedDiagonals.length >= 1;
    } else {
        return opposingOccupiedDiagonals.length >= 2;
    }
}

export class Region {
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
        return !(this.boardReg[point[0]][point[1]] == BLACK) && 
               !(this.boardReg[point[0]][point[1]] == WHITE) && 
               !this.isTerritory();
    }

    exterior() {
        let exteriorPoints = [];
    
        for (let i = 0; i < this.boardReg.length; i++) {
            for (let j = 0; j < this.boardReg[i].length; j++) {
                if (!this.intersections.some(el => el[0] == i && el[1] == j)) {
                    const neighbors = neighboringPoints(i, j, this.boardReg);
                    if (neighbors.some(neighbor => 
                        this.intersections.some(el => el[0] === neighbor.x && el[1] === neighbor.y)
                    )) {
                        exteriorPoints.push([i, j]);
                    }
                }
            }
        }
        return exteriorPoints;
    }

    boundaryStones() {
        return this.exterior().filter(i => 
            this.boardReg[i[0]][i[1]] != this.boardReg[this.intersections[0][0]][this.intersections[0][1]]
        );
    }

    expandedBoundaryStones() {
        const boundaryStones = this.boundaryStones();
        const regions = Region.getRegions(this.boardReg).filter(r => 
            r.intersections.some(i => 
                boundaryStones.some(el => el[0] == i[0] && el[1] == i[1])
            )
        );
        return regions.flatMap(r => r.intersections);
    }

    static Merge(board, regions, region) {
        let mergedRegions = [region];
        let length = -1; 
        while (mergedRegions.length != length) {
            length = mergedRegions.length;
            mergedRegions = regions.filter(r => {
                return r.boardReg[r.intersections[0][0]][r.intersections[0][1]] == EMPTY && 
                       r.isTerritory() && 
                       board[r.intersections[0][0]][r.intersections[0][1]] == board[region.intersections[0][0]][region.intersections[0][1]] && 
                       r.expandedBoundaryStones().some(stone => {
                           return mergedRegions.some(latestRegion => {
                               return latestRegion.expandedBoundaryStones().some(el => el[0] == stone[0] && el[1] == stone[1]);
                           });
                       });
            });
        }
        return mergedRegions;
    }

    numOfEyes() {
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

    territoryColour() {
        const point = this.intersections[0];
        const [_, boundaryPoints] = partitionTraverse(point[0], point[1], this.boardReg);
        let surroundingColors = [];
        boundaryPoints.forEach(el => {
            if (surroundingColors.indexOf(this.boardReg[el[0]][el[1]]) < 0) {
                surroundingColors.push(this.boardReg[el[0]][el[1]]);
            }
        });

        if (surroundingColors.length === 1 && surroundingColors[0] !== EMPTY) {
            return surroundingColors[0];
        } else {
            return -1;
        }
    }
} 