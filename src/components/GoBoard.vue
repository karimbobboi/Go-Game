<template>
  <div class="container-fluid d-flex justify-content-center align-items-center" style="width: 93vw; height: 95vh; margin: 0; padding: 0%;">
    <div class="row">
        <div class="col-sm-2" id="black_section">
            <div class="row timer_box my-3" >
                <Timer :stop="bStop" :isBlack="true" @timerRanOut="timerFinish"/>
                <div class="list-group-item d-flex justify-content-between align-items-center border border-black text-light fw-semibold mt-3 px-2 p-2 rounded" style="background-color: #2d2c2c">
                    Prisoners
                    <BBadge variant="light" class="fs-6" pill style="min-width: 40px; text-align: center;">{{ prisonersCounterB }}</BBadge>
                </div>
                <BButtonGroup class="my-3 w-100 p-0" vertical>
                    <BButton variant="primary" @click="toggleNumbered" class="border-bottom-0 border-black fw-semibold">Toggle numbers</BButton>
                    <BButton variant="primary" @click="undoMove" class="border-bottom-0 border-black fw-semibold" :disabled="lastColour !== 'black'">Undo</BButton>
                    <BButton variant="primary" @click="estimateScore" class="border-bottom-0 border-black fw-semibold" :disabled="lastColour !== 'white'">Estimate score</BButton>
                    <BButton variant="primary" @click="ladderEval" class="border-bottom-0 border-black fw-semibold" :disabled="lastColour !== 'white'">Evaluate ladder</BButton>
                    <BButton variant="danger" class="border-black fw-semibold" @click="passMove('black')" :disabled="lastColour !== 'white'">Pass</BButton>
                </BButtonGroup>
            </div>
        </div>
        <div class="col-sm-8 board">  
            <canvas ref="goBoard"></canvas>   
        </div>
        <div class="col-sm-2" id="white_section">
            <div class="row timer_box">
                <Timer :stop="wStop" :isBlack="false" @timerRanOut="timerFinish"/>
                <div class="list-group-item d-flex justify-content-between align-items-center fw-semibold bg-light mt-3 px-2 p-2 rounded">
                    Prisoners
                    <BBadge class="fs-6" pill style="min-width: 40px; text-align: center; background-color: #2d2c2c !important">{{ prisonersCounterW }}</BBadge>
                </div>
                <BButtonGroup class="my-3 w-100 p-0" vertical>
                    <BButton variant="primary" @click="toggleNumbered" class="border-bottom-0 border-black fw-semibold">Toggle numbers</BButton>
                    <BButton variant="primary" @click="undoMove" class="border-bottom-0 border-black fw-semibold" :v-show="undoAllowed" :disabled="lastColour !== 'white'">Undo</BButton>
                    <BButton variant="primary" @click="estimateScore" class="border-bottom-0 border-black fw-semibold" :disabled="lastColour !== 'black'">Estimate score</BButton>
                    <BButton variant="primary" @click="ladderEval" class="border-bottom-0 border-black fw-semibold" :disabled="lastColour !== 'black'">Evaluate ladder</BButton>
                    <BButton variant="danger" class="border-black fw-semibold" @click="passMove('white')" :disabled="lastColour !== 'black'">Pass</BButton>
                </BButtonGroup>
            </div>
        </div>

        <!-- Ladder Modal -->
        <BModal
            ok-only 
            centered
            v-model="ladderCheck" 
            hide-header-close
            @ok="ladderCheck = false"
            class="text-center" style="left: 35% !important"
            :title="ladderModalTitle"
        >
            <div ref="ladderModalBody" class="ladder_board" style="background-color: #CCA56D;">
            </div>
        </BModal>

        <!-- Score estimate Modal -->
        <BModal
            ok-only 
            centered
            hide-header-close
            v-model="estimateModal" 
            class="text-center" style="left: 35% !important"
            title ="Score estimate"
        >
            <p ref="estimateModalMessage" class="my-4"></p>
        </BModal>

        <!-- Gameover Modal -->
        <BModal
            ok-only 
            centered
            hide-header-close
            v-model="gameover" 
            @ok="reloadPage"
            class="text-center" style="left: 35% !important"
            title ="Game over!"
        >
            <p ref="modalMessage" class="my-4"></p>
        </BModal>
    </div>
</div> 
</template>

<script>
import Timer from './Timer.vue';

import { init2DBoard, numberedPieces, 
         print2DBoard, update2DBoard,
        drawHoshi, resetCheckBoard, getLiberties,
        toggleTimers, cloneBoard, drawBoard,
        placePiece, redrawBoard, calculateTerritory, 
        countStones, simulateLadder, territoryScoring, getLibertiesAt } from "../statics/functions.js";
    
import { BButtonGroup, BButton, BModal, BContainer, BBadge } from 'bootstrap-vue-next';
import black from '../../public/b.png';
import white from '../../public/w.png';

export default {
    components: {
        BButtonGroup, BButton, Timer, BModal, BContainer, BBadge
    },
    data() {
        return {
            lastColour: "white",
            boardSize:  9,
            board: [],
            boardStack: [],
            pieceNumbersStack: [],
            checkBoard: [],
            bStop: true,
            wStop: true,
            prisonersCounterB: 0,
            prisonersCounterW: 0,
            prisonersStack: [],
            checklib: [[0, 1], [0, -1], [1, 0], [-1, 0]],
            deadCells: [],
            pieceNumbers: [],
            isNumbered: false,
            lastMoveWasPassed: false,
            ladderCheck: false,
            ladderModalTitle: '',
            estimateModal: false,
            gameover: false
        };
    },
    mounted() {
        const canvas = this.$refs.goBoard;
        const ctx = canvas.getContext('2d');
        var scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
        this.drawBoard(canvas, ctx, scale);

        this.$refs.goBoard.addEventListener('mousedown', this.getMousePosition);
        this.init2DBoard(this.board, this.checkBoard);
        this.boardSize = window.boardSize;
        this.undoAllowed = window.undo;
    },
    methods: {
        init2DBoard,
        drawBoard,
        redrawBoard,
        drawHoshi,
        placePiece,
        numberedPieces,
        update2DBoard,
        print2DBoard,
        getLiberties,
        resetCheckBoard,
        cloneBoard,
        toggleTimers,
        calculateTerritory, simulateLadder, territoryScoring,
        countStones,
        getLibertiesAt,

        async getMousePosition(event) {
            const canvas = this.$refs.goBoard;
            const rect = canvas.getBoundingClientRect();
            const colour = (this.lastColour == "white") ? "black" : "white";
            let x = event.clientX - rect.left;
            let y = event.clientY - rect.top;
            const cell = 800/(this.boardSize + 1);
            if ((x % cell) > (cell/2)) {
                x = x + (cell - (x % cell));
            }
            else {
                x = x - (x % cell);
            }
            if ((y % cell) > (cell/2)) {
                y = y + (cell - (y % cell));
            }
            else {
                y = y - (y % cell);
            }
            
            // out of bounds checks
            if(x == 0 || y == 0)
                return;
            else if(x >= cell * (this.boardSize + 1) || y >= cell * (this.boardSize + 1))
                return;
            
            const r = Math.round((x == (cell/2)) ? x - (cell/2) : (x - cell) / cell);
            const c = Math.round((y == (cell/2)) ? y - (cell/2) : (y - cell) / cell);
            let newBoard = this.cloneBoard(this.board); 
            newBoard[c][r] = (colour == "white") ? '1' : '0';
            let lib = this.getLibertiesAt(c, r, newBoard);
            if (lib === 0){
                let lib2 = -1;

                for (const [dx, dy] of this.checklib) {
                    const pX = Number(r) + dx;
                    const pY = Number(c) + dy;

                    if (pX >= 0 && pY >= 0 && pX < newBoard[0].length && pY < newBoard.length) {
                        const currentPiece = newBoard[c][r];
                        const neighborPiece = newBoard[pY][pX];

                        if (neighborPiece !== "*" && neighborPiece !== currentPiece) {
                            lib2 = this.getLibertiesAt(pY, pX, newBoard);
                            if (lib2 === 0) {
                                break;
                            }
                        }
                    }
                }
                if(lib2 > 0){
                    alert("Suicide move not allowed.");
                    return;
                }
            }
            
            this.boardStack.unshift(this.cloneBoard(this.board)); // clone current board state into 2d stack
            this.pieceNumbersStack.unshift(this.pieceNumbers.map((el) => [el[0], el[1], el[2]]));

            this.prisonersStack.unshift([this.prisonersCounterB, this.prisonersCounterW]); // update prisioners counter for current board
            this.checkBoard = this.cloneBoard(this.board);
            var res = this.update2DBoard(r, c, colour, this.boardStack, this.board); // return true if successfully placed
            if (res) {
                try {
                    await this.placePiece(this.isNumbered, x - (cell/2), y - (cell/2), colour, this.boardStack.length, canvas, canvas.getContext('2d'), window.devicePixelRatio); // place on board
                    this.pieceNumbers.unshift([x - (cell/2), y - (cell/2), false]);
                    [this.wStop, this.bStop] =  this.toggleTimers(this.lastColour);
                }
                catch (error) {
                    console.error('Error placing piece:', error);
                }
                this.lastColour = colour;
                this.lastMoveWasPassed = false;
                
                // console.log("Coordinate x: " + x, "Coordinate y: " + y);
                this.checkBoard = this.cloneBoard(this.board);
                for (const [dx, dy] of this.checklib) {
                    const pX = Number(r) + dx;
                    const pY = Number(c) + dy;

                    if (pX >= 0 && pY >= 0 && pX < this.board[0].length && pY < this.board.length) {
                        const currentPiece = this.board[c][r];
                        const neighborPiece = this.board[pY][pX];

                        if (neighborPiece !== "*" && neighborPiece !== currentPiece) {
                            if (this.getLiberties(pX, pY, this.board, this.checkBoard, this.deadCells) === 0) {
                                var prisonerCount = this.resetCheckBoard(true, this.checkBoard, this.board);

                                // update prisoner counter
                                if(colour == "black")
                                    this.prisonersCounterB += prisonerCount;
                                else
                                    this.prisonersCounterW += prisonerCount;
                                
                                this.pieceNumbers.forEach(el => {
                                    const elX = Math.round((el[0] == (cell/2)) ? el[0] - (cell/2) : (el[0] - cell) / cell);
                                    const elY = Math.round((el[1] == (cell/2)) ? el[1] - (cell/2) : (el[1] - cell) / cell);
                                    if(!(el[2]) && this.board[elY][elX] == '*')
                                        el[2] = true;
                                });
                                // redraw board    
                                this.redrawBoard(this.isNumbered, canvas, canvas.getContext('2d'), 
                                                 window.devicePixelRatio, this.board, this.pieceNumbers);
                            } else { 
                                this.resetCheckBoard(false, this.checkBoard, this.board);
                            }
                        }
                    }
                }

                let end = true;
                for (let row of this.board) {
                    for (let cell of row) {
                        if(cell === '*') {
                            end = false;
                            break;
                        }
                    }
                    if(!end)
                        break;
                }

                if (end) {
                    this.endGame(false, false);
                }
            }
        },
        undoMove() {
            if (this.boardStack.length > 0) {
                this.board = this.boardStack[0];
                this.pieceNumbers = this.pieceNumbersStack[0];

                this.prisonersCounterB = this.prisonersStack[0][0];
                this.prisonersCounterW = this.prisonersStack[0][1];
                this.boardStack.shift();
                this.pieceNumbersStack.shift();
                this.prisonersStack.shift();
                // this.pieceNumbers.shift();
                this.lastColour = (this.lastColour == "white") ? "black" : "white";

                const canvas = this.$refs.goBoard;
                this.redrawBoard(this.isNumbered, canvas, canvas.getContext('2d'), 
                                 window.devicePixelRatio, this.board, this.pieceNumbers);

                const colour = (this.lastColour == "white") ? "black" : "white";
                [this.wStop, this.bStop] = this.toggleTimers(colour);
            } else {
                console.log("stack empty")
            }
        },
        passMove(color){
            if(this.lastMoveWasPassed == true){
                this.endGame(false, false);
            }
            else if(color != this.lastColour){
                this.lastColour = (this.lastColour == "white") ? "black" : "white";
                const colour = (this.lastColour == "white") ? "black" : "white";
                [this.wStop, this.bStop] = this.toggleTimers(colour);
                
                this.lastMoveWasPassed= true;
            }
        },
        toggleNumbered(){
            const canvas = this.$refs.goBoard;
            this.isNumbered = this.isNumbered ? false : true;
            this.redrawBoard(this.isNumbered, canvas, canvas.getContext('2d'), 
                             window.devicePixelRatio, this.board, this.pieceNumbers);
        },
        estimateScore() {
            let gameDetails = {
                bg: {
                    black: '',
                    white: ''
                },
                scores: {
                    black: 0,
                    white: 0
                },
                territory: {
                    black: 0,
                    white: 0
                }
            };
            let tableBlack = '';
            let tableWhite = '';

            let stones = this.countStones(this.board);
            if(window.scoring == "Area"){
                gameDetails.territory = calculateTerritory(this.board);

                gameDetails.scores.black = gameDetails.territory.black + stones.black;
                gameDetails.scores.white = gameDetails.territory.white + stones.white + parseFloat(window.komi);

                tableBlack = 
                    `<table class="table table-bordered">
                        <thead>
                            <tr>
                                <th class="fw-bold" scope="col">Score</th>
                                <th class="fw-bold" scope="col">Stones</th>
                                <th class="fw-bold" scope="col">Territory</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row" class="fw-semibold">${gameDetails.scores.black}</th>
                                <td>${stones.black}</td>
                                <td>${gameDetails.territory.black}</td>
                            </tr>
                        </tbody>
                    </table>`

                tableWhite = `
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th class="fw-bold" scope="col">Score</th>
                                <th class="fw-bold" scope="col">Stones</th>
                                <th class="fw-bold" scope="col">Territory</th>
                                <th class="fw-bold" scope="col">Komi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                            <th scope="row" class="fw-semibold">${gameDetails.scores.white}</th>
                                <td>${stones.white}</td>
                                <td>${gameDetails.territory.white}</td>
                                <td>${window.komi}</td>
                            </tr>
                        </tbody>
                    </table>`
            }
            else if(window.scoring == "Territory"){
                gameDetails.territory = territoryScoring(this.board);

                gameDetails.scores.black = gameDetails.territory.black + this.prisonersCounterB;
                gameDetails.scores.white = gameDetails.territory.white + this.prisonersCounterW + parseFloat(window.komi);

                tableBlack = 
                    `<table class="table table-bordered">
                        <thead>
                            <tr>
                                <th class="fw-bold" scope="col">Score</th>
                                <th class="fw-bold" scope="col">Prisoners</th>
                                <th class="fw-bold" scope="col">Territory</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row" class="fw-semibold">${gameDetails.scores.black}</th>
                                <td>${this.prisonersCounterB}</td>
                                <td>${gameDetails.territory.black}</td>
                            </tr>
                        </tbody>
                    </table>`

                tableWhite = `
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th class="fw-bold" scope="col">Score</th>
                                <th class="fw-bold" scope="col">Prisoners</th>
                                <th class="fw-bold" scope="col">Territory</th>
                                <th class="fw-bold" scope="col">Komi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                            <th scope="row" class="fw-semibold">${gameDetails.scores.white}</th>
                                <td>${this.prisonersCounterW}</td>
                                <td>${gameDetails.territory.white}</td>
                                <td>${window.komi}</td>
                            </tr>
                        </tbody>
                    </table>`
            }
            
            this.estimateModal = true;
            let blackScoreHTML = `
                <div class="card mb-3">
                    <div class="row g-0">
                        <div class="col-4 d-flex justify-content-center align-items-center">
                            <img src="${black}" class="img-fluid my-auto" alt="..." style="max-height: 50px; max-width: 80px;">
                        </div>
                        <div class="col-md-8">
                            <div class="card-body p-0 border-top-0">
                                ${tableBlack}
                            </div>
                        </div>
                    </div>
                </div>`

            let whiteScoreHTML = `
                <div class="card mb-3">
                    <div class="row g-0">
                        <div class="col-4 d-flex justify-content-center align-items-center">
                            <img src="${white}" class="img-fluid my-auto" alt="..." style="max-height: 50px; max-width: 80px;">
                        </div>
                        <div class="col-md-8">
                            <div class="card-body p-0 border-top-0">
                                ${tableWhite}
                            </div>
                        </div>
                    </div>
                </div>`;

            let html = `
                <div class="vstack gap-2 mt-3">
                    <div class="p-2">${blackScoreHTML}</div>
                    <div class="p-2">${whiteScoreHTML}</div>
                </div>`;
            this.$refs.estimateModalMessage.innerHTML = html;
        },
        ladderEval(){
            const ladderResult = this.simulateLadder(this.board);
            if(ladderResult.successful >= 0){
                this.ladderModalTitle = ladderResult.successful ? "Ladder successful for Hunter" : "Ladder unsuccessful for Hunter";
                this.ladderCheck = true;

                const ladderBoardWidth = (window.boardSize < 10) ? 25 : 50;
                const boardText = ladderResult.board.map(row => {
                    row = row.join(' ')
                    return `<div class="w-${ladderBoardWidth} mx-auto border border-dark" style="background-color: #CCA56D;">${row}</div>`}).join(' ');
                this.$refs.ladderModalBody.innerHTML = boardText;
            }
            else if(ladderResult.successful === -1){
                alert("Ladder sequence not found.");
            }
            else {
                alert("An error occurred during ladder evaluation");
                return;
            }
        },
        endGame(timerExhausted, isBlack){
            if(timerExhausted){
                const color = isBlack ? "Black" : "White";
                const winner = isBlack ? "White" : "Black";
                let html = `
                    '<h3>${color}'s timer exhausted<br>${winner} won the game</h3>'`;

                this.gameover = true;
                this.$refs.modalMessage.innerHTML = html;
                return;
            }

            let gameDetails = {
                winner: "<h3>The game ended in a Draw</h3>",
                bg: {
                    black: '',
                    white: ''
                },
                scores: {
                    black: 0,
                    white: 0
                },
                territory: {
                    black: 0,
                    white: 0
                }
            };
            let tableBlack = '';
            let tableWhite = '';

            let stones = this.countStones(this.board);
            if(window.scoring == "Area"){
                gameDetails.territory = calculateTerritory(this.board);

                gameDetails.scores.black = gameDetails.territory.black + stones.black;
                gameDetails.scores.white = gameDetails.territory.white + stones.white + parseFloat(window.komi);

                tableBlack = 
                    `<table class="table table-bordered">
                        <thead>
                            <tr>
                                <th class="fw-bold" scope="col">Score</th>
                                <th class="fw-bold" scope="col">Stones</th>
                                <th class="fw-bold" scope="col">Territory</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row" class="fw-semibold">${gameDetails.scores.black}</th>
                                <td>${stones.black}</td>
                                <td>${gameDetails.territory.black}</td>
                            </tr>
                        </tbody>
                    </table>`

                tableWhite = `
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th class="fw-bold" scope="col">Score</th>
                                <th class="fw-bold" scope="col">Stones</th>
                                <th class="fw-bold" scope="col">Territory</th>
                                <th class="fw-bold" scope="col">Komi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                            <th scope="row" class="fw-semibold">${gameDetails.scores.white}</th>
                                <td>${stones.white}</td>
                                <td>${gameDetails.territory.white}</td>
                                <td>${window.komi}</td>
                            </tr>
                        </tbody>
                    </table>`
            }
            else if(window.scoring == "Territory"){
                gameDetails.territory = territoryScoring(this.board);

                gameDetails.scores.black = gameDetails.territory.black + this.prisonersCounterB;
                gameDetails.scores.white = gameDetails.territory.white + this.prisonersCounterW + parseFloat(window.komi);

                tableBlack = 
                    `<table class="table table-bordered">
                        <thead>
                            <tr>
                                <th class="fw-bold" scope="col">Score</th>
                                <th class="fw-bold" scope="col">Prisoners</th>
                                <th class="fw-bold" scope="col">Territory</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row" class="fw-semibold">${gameDetails.scores.black}</th>
                                <td>${this.prisonersCounterB}</td>
                                <td>${gameDetails.territory.black}</td>
                            </tr>
                        </tbody>
                    </table>`

                tableWhite = `
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th class="fw-bold" scope="col">Score</th>
                                <th class="fw-bold" scope="col">Prisoners</th>
                                <th class="fw-bold" scope="col">Territory</th>
                                <th class="fw-bold" scope="col">Komi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                            <th scope="row" class="fw-semibold">${gameDetails.scores.white}</th>
                                <td>${this.prisonersCounterW}</td>
                                <td>${gameDetails.territory.white}</td>
                                <td>${window.komi}</td>
                            </tr>
                        </tbody>
                    </table>`
            }
            
            [this.wStop, this.bStop] = [true, true];
            this.gameover = true;
            if(gameDetails.scores.white < gameDetails.scores.black){
                gameDetails.winner = '<h3>Black won the game</h3>';
                gameDetails.bg.white = 'bg-danger';
                gameDetails.bg.black = 'bg-success';
            } else if(gameDetails.scores.white > gameDetails.scores.black){
                gameDetails.winner = "<h3>White won the game</h3>";
                gameDetails.bg.black = 'bg-danger';
                gameDetails.bg.white = 'bg-success';
            }
            let blackScoreHTML = `
                <div class="card mb-3">
                    <div class="row g-0">
                        <div class="col-4 d-flex justify-content-center align-items-center + ${gameDetails.bg.black}">
                            <img src="${black}" class="img-fluid my-auto" alt="..." style="max-height: 50px; max-width: 80px;">
                        </div>
                        <div class="col-md-8">
                            <div class="card-body p-0 border-top-0">
                                ${tableBlack}
                            </div>
                        </div>
                    </div>
                </div>`

            let whiteScoreHTML = `
                <div class="card mb-3">
                    <div class="row g-0">
                        <div class="col-4 d-flex justify-content-center align-items-center + ${gameDetails.bg.white}">
                            <img src="${white}" class="img-fluid my-auto" alt="..." style="max-height: 50px; max-width: 80px;">
                        </div>
                        <div class="col-md-8">
                            <div class="card-body p-0 border-top-0">
                                ${tableWhite}
                            </div>
                        </div>
                    </div>
                </div>`;

            let html = `
                ${gameDetails.winner} 
                <div class="vstack gap-2 mt-3">
                    <div class="p-2">${blackScoreHTML}</div>
                    <div class="p-2">${whiteScoreHTML}</div>
                </div>`;
            this.$refs.modalMessage.innerHTML = html;
        },
        reloadPage() {
            window.location.reload();
        },
        timerFinish(isBlack){
            this.endGame(true, isBlack);
        }
    }
};
</script>

<style scoped>
canvas {
  border: 0px solid black;
  background-color: #CCA56D;
}

.board {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #CCA56D;
    border: 1px solid black;
}

#black_section, #white_section {
    background-color: #CCA56D;
    border: 1px solid black;
}

.timer_box {
    height: 50%;
    padding-top: 20px;
}

.ladder_board {
    display: flex;
    flex-direction: column;
}
</style>