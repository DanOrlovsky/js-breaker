'use strict';

function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}
var rowColors = [
    'green',
    'red',
    'orange',
    'blue',
    'steelblue',
];

var canvas = document.getElementById('breakoutCanvas');
var ctx = canvas.getContext("2d");
var ballRadius = 10;
var paddleHeight = 10;
var paddleWidth = 75;
var paddleX = (canvas.width - paddleWidth) / 2;
var paddleY = canvas.height - (canvas.height / 10);
var rightPressed = false;
var leftPressed = false;
let paddleHits = 0;
var brickRowCount = 4;
var brickColumnCount = 6;
var brickWidth = 75;
var brickHeight = 20;
var brickPadding = 10;
var brickOffsetTop = 30;
var paddleCurve = 1.5;
var brickOffsetLeft = (canvas.width - ((brickWidth + brickPadding) * brickColumnCount)) / 2;
var dx = 1.5;
var dy = -2;
var ballX = paddleX + (paddleWidth / 2); //canvas.width / 2;
var ballY = paddleY - ballRadius; //canvas.height / 2;
var ballMoving = false;
var bricks = [];
var paddleHit = './assets/sounds/paddleHit.wav';
var brickSmash = './assets/sounds/brickSmash.wav';
var playerScore = 0;


function resetBricks() {
    for (var c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (var r = 0; r < brickRowCount; r++) {
            var brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
            var brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
            var rowColor = rowColors[r];
            bricks[c][r] = {
                x: brickX,
                y: brickY,
                status: 1,
                color: rowColor
            };
        }
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);


function playSound(soundPath) {
    // creates an audio element (need jquery)
    var audioElement = document.createElement("audio"); //$('<audio></audio>').src = audioFile;
    // connects the element to the source
    audioElement.src = soundPath;
    // creates an event listener that will remove the element when finished
    audioElement.addEventListener("ended", function () {
        audioElement.remove();
    }, false);
    // plays the audio
    audioElement.play();
}

function keyDownHandler(e) {
    if (e.keyCode == 39 || e.keyCode == 68) {
        rightPressed = true;
    } else if (e.keyCode == 37 || e.keyCode == 65) {
        leftPressed = true;
    }
    if (!ballMoving) {
        if (e.keyCode == 32) {
            document.getElementById("gameover").style.display = "none";
            ballMoving = true;
        }
    }
}

function keyUpHandler(e) {
    if (e.keyCode == 39 || e.keyCode == 68) {
        rightPressed = false;
    } else if (e.keyCode == 37 || e.keyCode == 65) {
        leftPressed = false;
    }

}

function drawBricks() {
    for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
            var currBrick = bricks[c][r];
            if (currBrick.status == 1) {
                ctx.beginPath();
                ctx.rect(currBrick.x, currBrick.y, brickWidth, brickHeight);
                ctx.fillStyle = currBrick.color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function checkWin() {
    for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1) return false;
        }
    }
    return true;
}

function collisionDetection() {
    for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
            var b = bricks[c][r];
            if (bricks[c][r].status == 1) {
                if (ballX > b.x && ballX < b.x + brickWidth && ballY > b.y && ballY < b.y + brickHeight) {
                    dy *= -1;
                    bricks[c][r].status = 0;
                    playerScore += 10;
                    playSound(brickSmash);
                }
            }
        }
    }
    if (ballX + ballRadius > canvas.width || ballX - ballRadius <= 0) dx *= -1;
    if (ballY - ballRadius <= 0) dy *= -1;
    if (ballX + ballRadius >= paddleX && ballX - ballRadius <= paddleX + paddleWidth) {
        if ((ballY + ballRadius >= paddleY && ballY + ballRadius <= paddleY + paddleHeight) ||
            (ballY - ballRadius >= paddleY && ballY - ballRadius <= paddleY + paddleHeight)) {
            playSound(paddleHit);
            // Reverse the ball position
            dy *= -1;
            // Position the ball above the paddle so it doesn't hit it again.
            ballY = paddleY - ballRadius;
            // Check if we should bend the ball
            if (dx < 0) {
                if (rightPressed) {
                    dx -= paddleCurve;
                } else if (leftPressed) {
                    dx += paddleCurve;
                }
            } else if (dx > 0) {
                if (rightPressed) {
                    dx -= paddleCurve;
                } else if (leftPressed) {
                    dx += paddleCurve;
                }
            }
            // Speed the ball up.
            dx = dx < 0 ? dx - 0.25 : dx + 0.25;
            dy = dy < 0 ? dy - 0.25 : dy + 0.25;
        }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function updateHUD() {
    document.getElementById("score").innerHTML = playerScore;
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, paddleY, paddleWidth, paddleHeight);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
}

function handleInput() {
    if (rightPressed) {
        paddleX += 7;
    } else if (leftPressed) {
        paddleX -= 7;
    }
    paddleX = clamp(paddleX, 0, canvas.width - paddleWidth);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleInput();
    drawBall();
    drawBricks();
    drawPaddle();
    updateHUD();
    if (!checkWin()) {
        if (ballMoving) {
            collisionDetection();
            ballX += dx;
            ballY += dy;
        } else {
            ballX = paddleX + (paddleWidth / 2);
            ballY = paddleY - ballRadius;
        }

        if (ballY + ballRadius > canvas.height) {
            document.getElementById('gameover').style.dispay = 'block';
            playerScore = 0;
            startGame();
        }
    } else {
        // game won!
        gameLoop = clearInterval();
        startGame();
    }

}
var gameLoop;

function startGame() {
    ballMoving = false;
    dx = 1.5;
    dy = -2;
    resetBricks();
    gameLoop = setInterval(gameLoop, 10);
}