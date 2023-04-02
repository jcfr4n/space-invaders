// jshint esversion: 6

// Board
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns; // 32 x 16 = 512px
let boardHeight = tileSize * rows; // 32 x 16 = 512px
let context;

// Ship
let shipWidth = tileSize * 2; // 64px
let shipHeight = tileSize; // 32px
let shipX = boardWidth / 2 - tileSize;
let shipY = boardHeight - tileSize * 2;

let ship = {
    x: shipX,
    y: shipY,
    width: shipWidth,
    height: shipHeight,
};
let shipImg;
let shipVelocityX = tileSize;

// Aliens
let alienVista = {
    "0": "alien.png",
    "1": "alien-yellow.png",
    "2": "alien-magenta.png",
    "3": "alien-cyan.png",
};
let alienArray = [];
let alienWidth = tileSize * 2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0;
let alienVelocityX = 1;

// Bullets

let bulletArray = [];
let bulletVelocityY = -10;

let score = 0;
let gameOver = false;


window.onload = () => {
    board = document.getElementById("board");
    board.width  = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); // use for paint the board

    // Load images
    shipImg = new Image();
    shipImg.src = "./img/ship.png";
    shipImg.onload = () => {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    };

    createAliens();

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);



};

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    alienArray.forEach(alien => {
        if (alien.alive) {
            alien.x += alienVelocityX;
            if (alien.x + alien.width >= board.width ||  alien.x <= 0) {
                alienVelocityX *= -1; 
                alien.x += alienVelocityX*2; // I can't see the utility of this line

                //move all aliens one row down
                alienArray.forEach(alien2 => {
                    alien2.y += alienHeight;
                });
            }
            context.drawImage(alien.img, alien.x, alien.y, alien.width, alien.height);
            if (alien.y >= ship.y){
                gameOver = true;
            }
        }
    });

    bulletArray.forEach(bullet => {
        bullet.y += bulletVelocityY;
        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.whidth, bullet.height);

        // bullet collision with aliens
        alienArray.forEach(alien => {
            if (!bullet.used && alien.alive && detectCollision(alien, bullet)){
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score +=100;
            }
        });
    });

    while (bulletArray.length > 0 && bulletArray[0].used || bulletArray[0].y < 0) {
        bulletArray.shift();
    }

    if (alienCount == 0) {
        alienColumns = Math.min(alienColumns + 1, columns/2 -2);
        alienRows = Math.min(alienRows + 1, rows - 4);
        if (alienVelocityX > 0) {
            alienVelocityX +=0.2; 
        }else{
            alienVelocityX -=0.2;
        }
        alienArray = [];
        bulletArray = [];
        createAliens();
    }

    context.fillStyle = "white";
    context.font = "24px courier";
    context.fillText("score:", 5, 20);

}

function moveShip(e) {
    if (gameOver){
        return;
    }
    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX;
    }else if (e.code == "ArrowRight" && ship.x + shipVelocityX + shipWidth <= boardWidth) {
        ship.x += shipVelocityX;
    }

}

function createAliens() {

    alienImg  = new Image();

    for (let c = 0; c < alienColumns; c++){
        for (let r = 0; r < alienRows; r++){

            let i;
            do {
                i = (Math.floor(Math.random() * 4));
            } while (alienImg.src == ("./img/" + alienVista[i]));

            alienImg.src = "./img/" + alienVista[i];

            let alien = {
                img: alienImg,
                x: alienX + c * alienWidth,
                y: alienY + r * alienHeight,
                width: alienWidth,
                height: alienHeight,
                alive: true,
            };
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

function shoot(e) {
    if (gameOver){
        return;
    }
    if (e.code == "Space") {
        // shoot
        let bullet = {
            x: ship.x + shipWidth * 15 / 32,
            y: ship.y,
            whidth: tileSize / 8,
            height: tileSize / 2,
            used: false,
        };
        bulletArray.push(bullet);
    }
}

function detectCollision (a, b) { // a = alien  & b = bullet
    return  b.x < a.x + a.width &&
            b.x + b.whidth > a.x &&
            b.y < a.y + a.height &&
            b.y + b.height > a.y;
}