class Snake {
    constructor() {
        this.reset();
    }

    reset() {
        this.position = [{ x: 10, y: 10 }];
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.grew = false;
    }

    draw(ctx) {
        // Draw body segments with gradient colors
        this.position.forEach((segment, index) => {
            const gradientColor = index === 0 ? '#1a5f32' : `hsl(145, ${60 - (index * 2)}%, ${40 + (index)}%)`;
            ctx.fillStyle = gradientColor;
            
            if (index === 0) { // Head
                ctx.beginPath();
                ctx.arc(
                    segment.x * GRID_SIZE + GRID_SIZE/2,
                    segment.y * GRID_SIZE + GRID_SIZE/2,
                    GRID_SIZE/2 - 1,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                
                // Draw eyes
                ctx.fillStyle = 'white';
                const eyeSize = GRID_SIZE/6;
                const eyeOffset = GRID_SIZE/4;
                
                // Calculate eye positions based on direction
                let leftEyeX = segment.x * GRID_SIZE + GRID_SIZE/2 - eyeOffset;
                let rightEyeX = segment.x * GRID_SIZE + GRID_SIZE/2 + eyeOffset;
                let leftEyeY = segment.y * GRID_SIZE + GRID_SIZE/2 - eyeOffset;
                let rightEyeY = segment.y * GRID_SIZE + GRID_SIZE/2 - eyeOffset;
                
                if (this.direction.x === 1) { // Moving right
                    leftEyeY = rightEyeY = segment.y * GRID_SIZE + GRID_SIZE/2;
                    leftEyeX = rightEyeX = segment.x * GRID_SIZE + GRID_SIZE - eyeSize*2;
                } else if (this.direction.x === -1) { // Moving left
                    leftEyeY = rightEyeY = segment.y * GRID_SIZE + GRID_SIZE/2;
                    leftEyeX = rightEyeX = segment.x * GRID_SIZE + eyeSize*2;
                } else if (this.direction.y === -1) { // Moving up
                    leftEyeY = rightEyeY = segment.y * GRID_SIZE + eyeSize*2;
                } else if (this.direction.y === 1) { // Moving down
                    leftEyeY = rightEyeY = segment.y * GRID_SIZE + GRID_SIZE - eyeSize*2;
                }
                
                ctx.beginPath();
                ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
                ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw pupils
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(leftEyeX, leftEyeY, eyeSize/2, 0, Math.PI * 2);
                ctx.arc(rightEyeX, rightEyeY, eyeSize/2, 0, Math.PI * 2);
                ctx.fill();
            } else { // Body segments
                ctx.beginPath();
                ctx.arc(
                    segment.x * GRID_SIZE + GRID_SIZE/2,
                    segment.y * GRID_SIZE + GRID_SIZE/2,
                    (GRID_SIZE/2 - 1) * (1 - index/this.position.length/3),
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        });
    }

    move() {
        this.direction = this.nextDirection;
        const head = this.position[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };

        this.position.unshift(newHead);
        if (!this.grew) {
            this.position.pop();
        }
        this.grew = false;
    }

    grow() {
        this.grew = true;
    }

    checkCollision() {
        const head = this.position[0];
        
        // Wall collision
        if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
            return true;
        }

        // Self collision
        return this.position.slice(1).some(segment => 
            segment.x === head.x && segment.y === head.y
        );
    }
}

class Food {
    constructor() {
        this.position = this.getRandomPosition();
    }

    getRandomPosition() {
        return {
            x: Math.floor(Math.random() * GRID_WIDTH),
            y: Math.floor(Math.random() * GRID_HEIGHT)
        };
    }

    draw(ctx) {
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(
            this.position.x * GRID_SIZE + GRID_SIZE / 2,
            this.position.y * GRID_SIZE + GRID_SIZE / 2,
            GRID_SIZE / 2 - 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

const GRID_SIZE = 20;
const GRID_WIDTH = 400 / GRID_SIZE;
const GRID_HEIGHT = 400 / GRID_SIZE;
const GAME_SPEED = 150;

const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.querySelector('.game-over');

let snake = new Snake();
let food = new Food();
let score = 0;
let gameLoop;

function update() {
    snake.move();

    if (snake.checkCollision()) {
        gameOver();
        return;
    }

    const head = snake.position[0];
    if (head.x === food.position.x && head.y === food.position.y) {
        snake.grow();
        food = new Food();
        score += 10;
        scoreElement.textContent = `Score: ${score}`;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    snake.draw(ctx);
    food.draw(ctx);
}

function gameOver() {
    clearInterval(gameLoop);
    gameOverElement.style.display = 'block';
}

function resetGame() {
    snake.reset();
    food = new Food();
    score = 0;
    scoreElement.textContent = 'Score: 0';
    gameOverElement.style.display = 'none';
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(() => {
        update();
        draw();
    }, GAME_SPEED);
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            if (snake.direction.y !== 1) {
                snake.nextDirection = { x: 0, y: -1 };
            }
            break;
        case 'ArrowDown':
            if (snake.direction.y !== -1) {
                snake.nextDirection = { x: 0, y: 1 };
            }
            break;
        case 'ArrowLeft':
            if (snake.direction.x !== 1) {
                snake.nextDirection = { x: -1, y: 0 };
            }
            break;
        case 'ArrowRight':
            if (snake.direction.x !== -1) {
                snake.nextDirection = { x: 1, y: 0 };
            }
            break;
        case ' ':
            resetGame();
            break;
    }
});

resetGame();