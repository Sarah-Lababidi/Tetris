const container = document.querySelector('.container');
const grid = document.querySelector('#grid');
const displayGrid = document.querySelector('#displayNext');
const startButton = document.querySelector('button#start-btn');
const pScore = document.querySelector('p#score');
const screenDisplay = document.querySelector('section.display');
const pauseScreen = document.querySelector('section.display div.pauseScreen');
const gameoverScreen = document.querySelector('section.display div.gameover');
const resetBtns = document.querySelectorAll('button.reset');
const pauseBtn = document.querySelector('button#pause');

let score = 0;
let time = 500;

// Add divs to the display grid
for (let i = 0; i < 49; i++) {
    displayGrid.innerHTML += `<div></div>`
}

// add divs to the game grid
for (let i = 0; i < 900; i++) {
    grid.innerHTML += `<div></div>`
}
// Add 30 divs to mark the end of the game grid
for (let i = 900; i < 930; i++) {
    grid.innerHTML += `<div class="taken hidden"></div>`
}

const squares = Array.from(document.querySelectorAll('#grid div'));
const displaySquares = Array.from(document.querySelectorAll('#displayNext div'));
const width = 30;
let timerId;

const colors = ["#f77f00", "#40916c", "#fcbf49", "#118ab2", "#e63946"];


const lTetromino = [
    [1, width + 1, width * 2 + 1, 2],
    [width, width + 1, width + 2, width * 2 + 2],
    [1, width + 1, width * 2 + 1, width * 2],
    [width, width * 2, width * 2 + 1, width * 2 + 2]
];

const zTetromino = [
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1]
];

const tTetromino = [
    [1, width, width + 1, width + 2],
    [1, width + 1, width + 2, width * 2 + 1],
    [width, width + 1, width + 2, width * 2 + 1],
    [1, width, width + 1, width * 2 + 1]
];

const oTetromino = [
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1]
];

const iTetromino = [
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3]
];

const tetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];


let currentPosition = 14;
let currentRotation = 0;
let rand = Math.floor(Math.random() * tetrominoes.length);
let current = tetrominoes[rand];
let currentIndex = rand;


// --------------------------------------- Choosing and displaying the next tetromino ---------------------------------------------
let displayWidth = 7;
let displayTetrominoes = [[1, displayWidth + 1, displayWidth * 2 + 1, 2],
[0, displayWidth, displayWidth + 1, displayWidth * 2 + 1],
[1, displayWidth, displayWidth + 1, displayWidth + 2],
[0, 1, displayWidth, displayWidth + 1],
[1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1]
];
let upNext = Math.floor(Math.random() * displayTetrominoes.length);
let displayTetromino = displayTetrominoes[upNext];
let nextTetromino = tetrominoes[upNext];

function displayNext() {
    // determine the offset according to the shape (L, Z, T, O, i)
    let offset = 0;
    switch (upNext) {
        case 0:
            offset = 16;
            break;
        case 1:
            offset = 17;
            break;
        case 2:
            offset = 16;
            break;
        case 3:
            offset = 17;
            break;
        case 4:
            offset = 9;
            break;
        default:
            offset = 0;
    }
    displayTetromino.forEach(index => {
        let id = index + offset;
        displaySquares[id].classList.add('tetromino');
        displaySquares[id].style.backgroundColor = colors[upNext];
    })
}

displayNext();

// ------------------------------------- Draw, Undraw and freeze -----------------------------------------------------------------

function draw() {
    current[currentRotation].forEach(value => {
        let id = currentPosition + value;
        squares[id].classList.add('tetromino');
        squares[id].style.backgroundColor = colors[currentIndex];
    })
}

function undraw() {
    current[currentRotation].forEach(value => {
        let id = currentPosition + value;
        squares[id].classList.remove('tetromino');
        squares[id].style.backgroundColor = "";
    })
}

function freeze() {
    // check if any of the future cells of the current tetromino will touch the end
    if (current[currentRotation].some(index => squares[currentPosition + width + index].classList.contains('taken'))) {
        // mark the current position of this tetromino as taken
        current[currentRotation].some(index => squares[currentPosition + index].classList.add('taken'));
        checkRows();

        // start a new tetromino
        currentPosition = 14;
        current = nextTetromino;
        currentIndex = upNext;
        currentRotation = 0;
        // choose and display the next and current tetromino
        upNext = Math.floor(Math.random() * displayTetrominoes.length);
        displayTetromino = displayTetrominoes[upNext];
        nextTetromino = tetrominoes[upNext];
        displaySquares.forEach(square => {
            square.classList.remove('tetromino');
            square.style.backgroundColor = "";
        });
        gameover();
        displayNext();
        draw();
    }
}


// --------------------------------------- Movement Functions --------------------------------------------------------------------

function moveDown() {
    undraw();
    currentPosition += width;
    draw();
    freeze();
}

function moveLeft() {
    undraw();
    const isAtLeftEdge = current[currentRotation].some(index => (currentPosition + index) % width === 0)
    // check if the neighboring cells are taken
    if (!isAtLeftEdge && !current[currentRotation].some(index => squares[currentPosition + index - 1].classList.contains('taken')))
        currentPosition -= 1;
    draw();
}

function moveRight() {
    undraw();
    const isAtRightEdge = current[currentRotation].some(index => (currentPosition + index) % width === width - 1)
    // check if the neighboring cells are taken
    if (!isAtRightEdge && !current[currentRotation].some(index => squares[currentPosition + index + 1].classList.contains('taken')))
        currentPosition += 1;
    draw();
}

function rotate() {
    let location = "right";
    let isAtEdges = false;
    undraw();
    currentRotation++;
    // we only have four rotations
    if (currentRotation > 3)
        currentRotation = 0;
    // check for any collisions at the edges
    if (currentPosition % width >= 0 && currentPosition % width <= (width / 2)) {
        location = "left";
    }
    if (location === "right") {
        // If the location is at the right, check if any of the cells will be at the left (cells [0->4])
        isAtEdges = current[currentRotation].some(index => {
            return (((currentPosition + index) % width >= 0) && ((currentPosition + index) % width < 5));
        })
    } else {
        // If the location is at the left, check if any of the cells will be at the right (cells [25->29] because width=30)
        isAtEdges = current[currentRotation].some(index => {
            return (((currentPosition + index) % width > 24) && ((currentPosition + index) % width <= 29));
        })
    }
    // if there are any collisions -> do not rotate
    if (isAtEdges)
        currentRotation--;
    // if the original rotation was at 3 and there is a collision -> bring it back to 3
    if (currentRotation === -1)
        currentRotation = 3;
    draw();
}

function control(e) {
    switch (e.keyCode) {
        case 37:
            moveLeft();
            break;
        case 39:
            moveRight();
            break;
        case 40:
            moveDown();
            break;
        case 38:
            rotate();
            break;
        default:

    }
}

startButton.addEventListener('click', () => {
    // if the game is running -> pause
    if (timerId) {
        gameoverScreen.classList.add('hidden');
        pauseScreen.classList.remove('hidden');
        screenDisplay.classList.remove('hidden');
        container.classList.add('blur');


        clearInterval(timerId);
        timerId = null;
        // prevent movement
        document.removeEventListener("keyup", control);
    } else {
        resume();
    }
})

// ------------------------------------- check winning row -----------------------------------------------------------------
function checkRows() {
    for (let i = 0; i < 900; i += 30) {
        let row = squares.slice(i, i + width);

        if (row.every(cell => cell.classList.contains('tetromino'))) {
            let targetSquares = squares.splice(i, width);
            targetSquares.forEach(square => {
                square.classList.remove('tetromino');
                square.classList.remove('taken');
                square.style.backgroundColor = "";
            });
            squares.splice(0, 0, ...targetSquares);
            squares.forEach(square => grid.appendChild(square));
            score += 30;
            // increase speed
            if((time-5)>100)
                time-=5;
            pScore.innerText = score;
        }
    }
}

// ------------------------------------- check game over -----------------------------------------------------------------
function gameover() {
    let condition = current[currentRotation].some(index => squares[currentPosition + index + width].classList.contains('taken'))
    if (condition) {
        clearInterval(timerId);
        timerId = null;
        // prevent movement
        document.removeEventListener("keyup", control);
        startButton.disabled = true;
        container.classList.add('blur');
        screenDisplay.classList.remove('hidden');
    }
}

// ------------------------------------- Reset Game -----------------------------------------------------------------
function resetGame() {
    console.log("In reset game")
    screenDisplay.classList.add('hidden');
    container.classList.remove('blur');
    startButton.disabled = false;
    squares.slice(0, 900).forEach(square => {
        square.classList.remove('tetromino');
        square.classList.remove('taken');
        square.style.backgroundColor = "";
    });

    displaySquares.forEach(square => {
        square.classList.remove('tetromino');
        square.style.backgroundColor = "";
    });

    score = 0;
    pScore.innerText = score;

    currentPosition = 14;
    currentRotation = 0;
    rand = Math.floor(Math.random() * tetrominoes.length);
    current = tetrominoes[rand];
    currentIndex = rand;

    upNext = Math.floor(Math.random() * displayTetrominoes.length);
    displayTetromino = displayTetrominoes[upNext];
    nextTetromino = tetrominoes[upNext];

    displayNext();
}

resetBtns.forEach(btn => {
    btn.addEventListener('click', resetGame);
})

// ------------------------------------- Resume Function -----------------------------------------------------------------
pauseBtn.addEventListener('click', resume);
function resume() {
    pauseScreen.classList.add('hidden');
    screenDisplay.classList.add('hidden');
    gameoverScreen.classList.remove('hidden');
    container.classList.remove('blur');

    // resume game
    timerId = setInterval(moveDown, time);
    document.addEventListener("keyup", control);
}