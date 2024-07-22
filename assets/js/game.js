

//Esconder a div inicial
const começo = document.getElementById('começo');
let direction = 'right'; // Definição única da direção
let gameStarted = false; // Variável para verificar se o jogo foi iniciado

const containerWidth = 1000; // Largura do contêiner
const containerHeight = 500; // Altura do contêiner

document.addEventListener('keydown', function (event) {
    const key = event.key;

    if (key) {
        começo.classList.add('close');
        gameStarted = true; // Define que o jogo foi iniciado após o primeiro clique de tecla
    }
});



const snake = document.getElementById('snake');
document.addEventListener('DOMContentLoaded', () => {
    const segments = Array.from(document.getElementsByClassName('snake-segment'));
    const fruits = Array.from(document.getElementsByClassName('fruit'));
    const points = document.getElementById('points');
    const recordElement = document.getElementById('record');
    const lose = document.getElementById('lose');
    const reset = document.getElementById('reset');
    const conteiner = document.getElementById('conteiner');
    const finalScore = document.getElementById('finalScore');
    const finalRecord = document.getElementById('finalRecord');

    let score = 0;
    let record = localStorage.getItem('snakeRecord') ? parseInt(localStorage.getItem('snakeRecord'), 10) : 0; // Recorde inicial
    const step = 20; // Tamanho de cada passo
    let positions = [{ x: 10, y: 10 }]; // Posição inicial da cabeça
    let moving = false;
    let interval;
    let currentFruit = null; // Fruta atualmente visível

    recordElement.textContent = record; // Atualiza o elemento do recorde



    // Inicializa posições para todos os segmentos
    for (let i = 1; i < segments.length; i++) {
        positions.push({ x: -i * step, y: 0 });
    }



    // Inicializa a posição da cobra dentro do contêiner
    function initializeSnake() {
        // Ajusta a posição da cobra para garantir que ela comece dentro dos limites
        positions[0] = {
            x: (containerWidth - step) / 2,
            y: (containerHeight - step) / 2
        };

        segments.forEach((segment, index) => {
            segment.style.left = positions[index].x + 'px';
            segment.style.top = positions[index].y + 'px';
        });
    }

    initializeSnake(); 



    // Função para mover a cobra
    function moveSnake() {
        // Calcula a nova posição da cabeça
        let head = positions[0];
        let newHead = { x: head.x, y: head.y };

        switch (direction) {
            case 'up':
                newHead.y -= step;
                break;
            case 'down':
                newHead.y += step;
                break;
            case 'left':
                newHead.x -= step;
                break;
            case 'right':
                newHead.x += step;
                break;
        }

        // Insere a nova posição da cabeça no início do array
        positions.unshift(newHead);
        // Remove a última posição do array
        positions.pop();

        // Atualiza a posição dos segmentos da cobra
        segments.forEach((segment, index) => {
            segment.style.left = positions[index].x + 'px';
            segment.style.top = positions[index].y + 'px';

            // Rotaciona os segmentos conforme a direção
            if (index === 0) { // cabeça
                switch (direction) {
                    case 'up':
                        segment.style.transform = 'rotate(270deg)';
                        break;
                    case 'down':
                        segment.style.transform = 'rotate(90deg)';
                        break;
                    case 'left':
                        segment.style.transform = 'rotate(180deg)';
                        break;
                    case 'right':
                        segment.style.transform = 'rotate(0deg)';
                        break;
                }
            } else { // corpo
                const prevPos = positions[index - 1];
                const currPos = positions[index];
                if (prevPos.x > currPos.x) {
                    segment.style.transform = 'rotate(0deg)';
                } else if (prevPos.x < currPos.x) {
                    segment.style.transform = 'rotate(180deg)';
                } else if (prevPos.y > currPos.y) {
                    segment.style.transform = 'rotate(90deg)';
                } else if (prevPos.y < currPos.y) {
                    segment.style.transform = 'rotate(270deg)';
                }
            }
        });

        // Verifica se a cabeça da cobra colidiu com o corpo
        if (checkCollision(newHead)) {
            gameOver();
            return;
        }

        // Verifica se a cabeça está fora dos limites somente se o jogo tiver sido iniciado
        if (gameStarted) {
            if (isOutOfBounds(newHead)) {
                gameOver();
                return;
            }
        }

        // Verifica a colisão com a fruta atual
        if (currentFruit) {
            const fruitRect = currentFruit.getBoundingClientRect();
            const snakeRect = segments[0].getBoundingClientRect();

            if (
                snakeRect.left < fruitRect.right &&
                snakeRect.right > fruitRect.left &&
                snakeRect.top < fruitRect.bottom &&
                snakeRect.bottom > fruitRect.top
            ) {
                currentFruit.style.opacity = '0';
                updateScore();
                updateRecord();
                showFruit();
                increaseSnake();
            }
        }

        // Atualiza os segmentos no DOM com suas novas posições
        const updatedSegments = Array.from(document.getElementsByClassName('snake-segment'));
        updatedSegments.forEach((segment, index) => {
            segment.style.left = positions[index].x + 'px';
            segment.style.top = positions[index].y + 'px';
        });
    }

    // Função para mudar a direção
    function changeDirection(event) {
        const newDirection = event.key.replace('Arrow', '').toLowerCase();

        // Define as mudanças de direção permitidas
        const allowedDirections = {
            up: ['left', 'right'],
            down: ['left', 'right'],
            left: ['up', 'down'],
            right: ['up', 'down']
        };

        // Verifica se a nova direção é permitida
        if (allowedDirections[direction].includes(newDirection)) {
            direction = newDirection;
        }

        // Inicia o movimento se ainda não começou
        if (!moving) {
            moving = true;
            interval = setInterval(moveSnake, 120);
        }
    }

    // Amostragem aleatória das frutas
    function showFruit() {
        if (currentFruit) {
            currentFruit.style.opacity = '0';
        }
        currentFruit = fruits[Math.floor(Math.random() * fruits.length)];
        currentFruit.style.opacity = '1';
    }

    showFruit();

    // Aumenta o tamanho da cobra
    function increaseSnake() {
        const lastSegment = positions[positions.length - 1];
        const newSegment = document.createElement('div');
        newSegment.classList.add('snake-segment');
        snake.appendChild(newSegment);
        // Adiciona o novo segmento na mesma posição do último segmento
        positions.push({ x: lastSegment.x, y: lastSegment.y });
    }

    function checkCollision(newHead) {
        return positions.slice(1).some(segment => segment.x === newHead.x && segment.y === newHead.y);
    }

    function isOutOfBounds(head) {
        return (
            head.x < 0 ||
            head.x >= containerWidth ||
            head.y < 0 ||
            head.y >= containerHeight
        );
    }

    // Função para parar o jogo
    function gameOver() {
        clearInterval(interval);
        lose.style.display = 'flex';
        finalScore.textContent = `${score}`;
        finalRecord.textContent = `${record}`;
        resetGame();
    }

    // Reseta o jogo
    function resetGame() {
        reset.addEventListener('click', () => {
            location.reload();
        });
    }

    function updateScore() {
        score++;
        points.textContent = score;
    }

    function updateRecord() {
        if (score > record) {
            record = score;
            recordElement.textContent = record;
            localStorage.setItem('snakeRecord', record);
        }
    }

    // Adiciona o evento de teclado
    document.addEventListener('keydown', changeDirection);
});
