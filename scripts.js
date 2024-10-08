//board
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = 375 // 32 * 16
let boardHeight = tileSize * rows; // 32 * 16
let context;

//ship
let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = tileSize * columns / 2 - tileSize +100;
let shipY = tileSize * rows - tileSize * 2 ;

let ship = {
    x: shipX,
    y: shipY,
    width: shipWidth,
    height: shipHeight
}

let shipImg;
let shipVelocityX = 10; // ship moving speed

//aliens
let alienArray = [];
let alienWidth = tileSize * 2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0; // number of aliens to defeat
let alienVelocityX = 1; // alien moving speed

//bullets
let bulletArray = [];
let bulletVelocityY = -10; // bullet moving speed

let score = 0;
let gameOver = false;

let leftPressed = false;
let rightPressed = false;
let shooting = false;

window.onload = function () {

 /*   if (window.innerWidth > 800) {
        tileSize = 32*2;
         rows = 16;
         columns = 16*2;
         ship.height = shipHeight*2
         ship.width = shipWidth*2
       
         
         alienWidth = alienWidth*2
         alienHeight = alienHeight*2
         
       

         boardWidth = 375 *2 // 32 * 16
         boardHeight = 800 // 32 * 16
    }
 */

    if (window.innerWidth > 800) {
        tileSize = 32 * 2;
        rows = 16;
        columns = 16 * 2;

        // Update board dimensions
        boardWidth = tileSize * columns /2;
        boardHeight = 800;

        // Adjust ship dimensions and position
        ship.width = shipWidth = tileSize * 2;
        ship.height = shipHeight = tileSize;
        ship.x = boardWidth /2 -ship.width/2
        ship.y = boardHeight - tileSize * 2;

        // Adjust alien dimensions and positions
        alienWidth = tileSize * 2;
        alienHeight = tileSize;
        alienX = tileSize;
        alienY = tileSize;
    }

    initializeBoard();
    loadAssets();
    createAliens();

    requestAnimationFrame(update);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    // Adding touch event listeners
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);
}

function initializeBoard() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");
}

function loadAssets() {
    shipImg = new Image();
    shipImg.src = "assets/ship.png";
    shipImg.onload = function () {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    }

    alienImg = new Image();
    alienImg.src = "assets/targets.png";
}

function update() {
    if (gameOver) {
        displayGameOverMessage();
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    updateShip();
    updateAliens();
    updateBullets();
    checkNextLevel();
    displayScore();

    requestAnimationFrame(update);
}

function updateShip() {
    if (leftPressed && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX;
    } else if (rightPressed && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX;
    }
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
}

function updateAliens() {
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityX;

            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX * 2;
                moveAliensDown();
            }
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

            if (alien.y >= ship.y) {
                gameOver = true;
            }
        }
    }
}

function moveAliensDown() {
    for (let j = 0; j < alienArray.length; j++) {
        alienArray[j].y += alienHeight;
    }
}

function updateBullets() {
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 100;
            }
        }
    }

    clearUsedBullets();
}

function clearUsedBullets() {
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift();
    }
}

/*function checkNextLevel() {
    if (alienCount == 0) {
        score += alienColumns * alienRows * 100;
        alienColumns = Math.min(alienColumns + 1, columns / 2 - 2);
        alienRows = Math.min(alienRows + 1, rows - 4);
        alienVelocityX = alienVelocityX > 0 ? alienVelocityX + 0.2 : alienVelocityX - 0.2;
        alienArray = [];
        bulletArray = [];
        createAliens();
    }
} */
  
    function checkNextLevel() {
        if (alienCount == 0) {
            // Increment score based on the current number of aliens
            score += alienColumns * alienRows * 100;
    
            // Determine maximum size based on screen width
            const maxColumns = window.innerWidth > 800 ? 7 : Math.min(5, Math.floor(boardWidth / alienWidth));
            const maxRows = window.innerWidth > 800 ? 7 : Math.min(5, Math.floor((ship.y - alienHeight) / alienHeight));
    
            // Lock the maximum size of alien formation depending on screen size
            alienColumns = Math.min(alienColumns + 1, maxColumns);
            alienRows = Math.min(alienRows + 1, maxRows);
    
            // Slightly increase the alien movement speed, but cap it to avoid excessive speed
            const maxSpeed = window.innerWidth > 800 ? 5 : 3;
            alienVelocityX = alienVelocityX > 0 ? Math.min(alienVelocityX + 0.2, maxSpeed) : Math.max(alienVelocityX - 0.2, -maxSpeed);
    
            // Reset alien and bullet arrays for the next level
            alienArray = [];
            bulletArray = [];
    
            // Create the new aliens
            createAliens();
        }
    }
    
    function createAliens() {
        alienArray = [];
    
        // Calculate the starting X position to center the alien formation
        let startX = (boardWidth - (alienColumns * alienWidth)) / 2;
        let startY = alienY;
    
        for (let c = 0; c < alienColumns; c++) {
            for (let r = 0; r < alienRows; r++) {
                let alien = {
                    img: alienImg,
                    x: startX + c * alienWidth,
                    y: startY + r * alienHeight,
                    width: alienWidth,
                    height: alienHeight,
                    alive: true
                };
                alienArray.push(alien);
            }
        }
        alienCount = alienArray.length;
    }
    

function displayScore() {
    context.fillStyle = "white";
    context.font = "16px Courier";
    context.fillText(score, 5, 20);
}

function handleKeyDown(e) {
    if (gameOver) {
        return;
    }

    if (e.code === "ArrowLeft") {
        leftPressed = true;
    } else if (e.code === "ArrowRight") {
        rightPressed = true;
    } else if (e.code === "Space") {
        shoot();
    }
}

function handleKeyUp(e) {
    if (e.code === "ArrowLeft") {
        leftPressed = false;
    } else if (e.code === "ArrowRight") {
        rightPressed = false;
    }
}

/*function createAliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            let alien = {
                img: alienImg,
                x: alienX + c * alienWidth,
                y: alienY + r * alienHeight,
                width: alienWidth,
                height: alienHeight,
                alive: true
            }
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
} */

   

function shoot() {
    if (gameOver) {
        return;
    }

    let bullet = {
        x: ship.x + shipWidth * 15 / 32,
        y: ship.y,
        width: tileSize / 8,
        height: tileSize / 2,
        used: false
    }
    bulletArray.push(bullet);
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function displayGameOverMessage() {
    context.fillStyle = "white";
    context.font = "30px Courier";
    context.fillText("Game Over", boardWidth / 2 - 100, boardHeight / 2);
}

// Handle touch events
function handleTouchStart(e) {
    if (gameOver) {
        return;
    }

    const rect = board.getBoundingClientRect();  // Get canvas bounding rectangle
    const touchX = e.touches[0].clientX - rect.left;  // Calculate touch position relative to the canvas

    // Check if the touch is within the bounds of the ship
    if (touchX >= ship.x && touchX <= ship.x + ship.width) {
        // The touch is on the ship, so only shoot
        shoot();
    } else {
        // The touch is outside the ship's bounds, so move the ship
        if (touchX < ship.x) {
            leftPressed = true;
            rightPressed = false;
            shoot();
        } else if (touchX > ship.x + ship.width) {
            rightPressed = true;
            leftPressed = false;
            shoot();
        }
    }
}

function handleTouchEnd(e) {
    leftPressed = false;
    rightPressed = false;
    shooting = false;
}
