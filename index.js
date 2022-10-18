var width = 8;
var totalBombs = 10;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const totalBombsInput = document.getElementById("total-bombs")
const widthInput = document.getElementById("width")

canvas.width = window.innerHeight
canvas.height = window.innerHeight

var tileWidth = canvas.width / width;

class Tile {
    constructor() {
        this.isBomb = false;
        this.isRevealed = false;
        this.isFlagged = false;
    }
}

var board = []

var neighborCounts = []

var isGamePlaying = false;

var offsets = [
    -1 + -width,
    0 + -width,
    1 + -width,
    -1 + 0,
    1 + 0,
    -1 + width,
    0 + width,
    1 + width,
]

function CreateBlankBoard() {
    for (var i = 0; i < width * width; i++) {
        board[i] = new Tile()
    }
}

function CreateBoard(clickedIndex) {
    board = []

    // Pre-Populate empty array of tiles
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < width; y++) {
            board[y * width + x] = new Tile();
        }
    }

    // Create a copy, that can be modified
    var emptyTiles = []
    for (var i = 0; i < width * width; i++) {
        emptyTiles[i] = i;
    }

    emptyTiles.splice(clickedIndex, 1)

    for (var i = 0; i < totalBombs; i++) {
        var randIdx = Math.floor(Math.random() * emptyTiles.length)
        var idx = emptyTiles.splice(randIdx, 1);

        board[idx].isBomb = true;
    }

    // Generate the number of neighbours for each tile
    for (var i = 0; i < board.length; i++) {
        if (board[i].isBomb) {
            neighborCounts[i] = -1;
            continue;
        }

        var total = 0;

        var localY = Math.floor(i / width);
        var localX = i - localY * width;

        for (var x = -1; x <= 1; x++) {
            for (var y = -1; y <= 1; y++) {
                if (x + localX < 0 || x + localX == width) continue;
                if (y + localY < 0 || y + localY == width) continue;

                if (board[(y + localY) * width + x + localX].isBomb) total++;
            }
        }

        neighborCounts[i] = total;
    }
}

function DrawBoard() {
    ctx.clearRect(0, 0, width * tileWidth, width * tileWidth)

    for (var i = 0; i < board.length; i++) {
        var y = Math.floor(i / width);
        var x = i - y * width;
    
        ctx.beginPath();
        ctx.rect(x * tileWidth, y * tileWidth, tileWidth, tileWidth);
     
        if (!board[i].isRevealed && !board[i].isFlagged) ctx.fillStyle = "#625e61";
        else ctx.fillStyle = "#dcd7db";
    
        ctx.fill();
        ctx.stroke();

        var text = "";
        if (board[i].isFlagged) text = "🚩";
        else if (board[i].isBomb && board[i].isRevealed) text = "💣";
        else if (board[i].isRevealed && neighborCounts[i] != 0) text = neighborCounts[i];

        ctx.beginPath();

        if (neighborCounts[i] == 1) ctx.fillStyle = "#0000FF"
        else if (neighborCounts[i] == 2) ctx.fillStyle = "#007B00"
        else if (neighborCounts[i] == 3) ctx.fillStyle = "#FF0000"
        else if (neighborCounts[i] == 4) ctx.fillStyle = "#00007B"
        else if (neighborCounts[i] == 5) ctx.fillStyle = "#841818"
        else if (neighborCounts[i] == 6) ctx.fillStyle = "#007B7B"
        else if (neighborCounts[i] == 7) ctx.fillStyle = "#000000"
        else if (neighborCounts[i] == 8) ctx.fillStyle = "#7B7B7B"

        ctx.font = `bold  ${tileWidth / 2}px Arial`;

        ctx.fillText(text, x * tileWidth + tileWidth / 4, y * tileWidth + tileWidth - tileWidth / 4)
    }
}

function FloodFill(i) {
    var localY = Math.floor(i / width);
    var localX = i - localY * width;

    for (var x = -1; x <= 1; x++) {
        for (var y = -1; y <= 1; y++) {
            if (x + localX < 0 || x + localX == width) continue;
            if (y + localY < 0 || y + localY == width) continue;

            var idx = (y + localY) * width + x + localX
            if (board[idx].isRevealed) continue;

            board[idx].isRevealed = true;
            if (neighborCounts[idx] == 0) FloodFill(idx)
        }
    }
}

canvas.addEventListener("mousedown", (e) => {
    var x = Math.floor(e.clientX / tileWidth)
    var y = Math.floor(e.clientY / tileWidth)
    var i = y * width + x

    // Left Click
    if (e.button == 0) {
        if (!isGamePlaying) {
            CreateBoard(i);
            isGamePlaying = true
        }

        if (board[i].isFlagged) return;

        board[i].isRevealed = true;
        if (neighborCounts[i] == 0) FloodFill(i);
        
        if (board[i].isBomb) {
            isGamePlaying = false;
        }

        DrawBoard()
    }

    // Right Click
    else if (e.button == 2) {
        if (!isGamePlaying) return;
        if (board[i].isRevealed) return;
        board[i].isFlagged = !board[i].isFlagged;
        DrawBoard()
    }
})

canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault()
})

totalBombsInput.addEventListener("change", (e) => {
    totalBombs = totalBombsInput.value ?? 10;
    CreateBlankBoard()
    DrawBoard()
    isGamePlaying = false;
})

widthInput.addEventListener("change", (e) => {
    width = widthInput.value ?? 8;
    tileWidth = canvas.width / width;
    CreateBlankBoard()
    DrawBoard()
    isGamePlaying = false;
})

totalBombsInput.value = 10;
widthInput.value = 8;

CreateBlankBoard()
DrawBoard()