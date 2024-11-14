// game.js

// Obtém o elemento canvas do DOM
const canvas = document.getElementById('gameCanvas');
// Obtém o contexto de renderização 2D do canvas
const ctx = canvas.getContext('2d');

// Define a largura do canvas
canvas.width = 400;
// Define a altura do canvas
canvas.height = 600;

// Garante que o canvas tenha foco para capturar eventos de teclado
canvas.focus();

// Objeto representando o carro do jogador
const car = {
    x: canvas.width / 2 - 25, // Posição inicial X (centro do canvas menos metade da largura do carro)
    y: canvas.height - 100,   // Posição inicial Y (100 pixels acima do fundo do canvas)
    width: 50,                // Largura do carro
    height: 80,               // Altura do carro
    speed: 5                  // Velocidade de movimento do carro
};

// Array para armazenar os obstáculos
let obstacles = [];
// Pontuação inicial do jogador
let score = 0;
// Velocidade inicial do jogo
let gameSpeed = 2;
// Flag para indicar se o jogo acabou
let gameOver = false;
// Deslocamento da estrada para criar efeito de movimento
let roadOffset = 0;

// Função para desenhar a pista
function drawRoad() {
    // Preenche o fundo com cor cinza escuro
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Configura o estilo das linhas da estrada
    ctx.strokeStyle = '#FFF';      // Cor branca para as linhas
    ctx.setLineDash([20, 20]);     // Cria linhas tracejadas
    ctx.lineWidth = 2;             // Espessura das linhas

    // Desenha três linhas na pista
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        // Move o ponto inicial para o topo da linha
        ctx.moveTo(canvas.width * (i + 1) / 4, (roadOffset % 40) - 40);
        // Desenha a linha até o fundo do canvas
        ctx.lineTo(canvas.width * (i + 1) / 4, canvas.height);
        ctx.stroke();
    }

    // Atualiza o deslocamento da estrada para criar efeito de movimento
    roadOffset += gameSpeed;
}

// Função para desenhar o carro
function drawCar() {
    // Desenha o corpo principal do carro (vermelho)
    ctx.fillStyle = 'red';
    ctx.fillRect(car.x, car.y, car.width, car.height);

    // Desenha o teto do carro (vermelho escuro)
    ctx.fillStyle = '#AA0000';
    ctx.fillRect(car.x + 5, car.y + 5, car.width - 10, car.height - 20);

    // Desenha as janelas do carro (azul claro)
    ctx.fillStyle = '#6666FF';
    ctx.fillRect(car.x + 8, car.y + 8, car.width - 16, car.height - 30);

    // Desenha as rodas do carro (pretas)
    ctx.fillStyle = '#000';
    // Roda frontal esquerda
    ctx.fillRect(car.x - 5, car.y + 10, 5, 20);
    // Roda frontal direita
    ctx.fillRect(car.x + car.width, car.y + 10, 5, 20);
    // Roda traseira esquerda
    ctx.fillRect(car.x - 5, car.y + car.height - 30, 5, 20);
    // Roda traseira direita
    ctx.fillRect(car.x + car.width, car.y + car.height - 30, 5, 20);
}

// Função para desenhar os obstáculos
function drawObstacles() {
    // Define a cor dos obstáculos como laranja
    ctx.fillStyle = '#FFA500';
    // Percorre todos os obstáculos
    obstacles.forEach(obstacle => {
        // Começa um novo caminho de desenho
        ctx.beginPath();
        // Move o ponto inicial para o topo do triângulo
        ctx.moveTo(obstacle.x, obstacle.y);
        // Desenha a linha para o ponto inferior direito
        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height / 2);
        // Desenha a linha para o ponto inferior esquerdo
        ctx.lineTo(obstacle.x, obstacle.y + obstacle.height);
        // Fecha o caminho (conecta o último ponto ao primeiro)
        ctx.closePath();
        // Preenche o triângulo com a cor definida
        ctx.fill();
    });
}

// Função para mover os obstáculos e criar novos
function moveObstacles() {
    // Move cada obstáculo para baixo
    obstacles.forEach(obstacle => {
        obstacle.y += gameSpeed;
    });

    // Remove obstáculos que saíram da tela
    obstacles = obstacles.filter(obstacle => obstacle.y < canvas.height);

    // Cria um novo obstáculo aleatoriamente (2% de chance a cada frame)
    if (Math.random() < 0.02) {
        const obstacle = {
            x: Math.random() * (canvas.width - 50), // Posição X aleatória
            y: -50,                                 // Inicia acima da tela
            width: 50,                              // Largura do obstáculo
            height: 50                              // Altura do obstáculo
        };
        obstacles.push(obstacle);
    }
}

// Função para verificar colisões
function checkCollision() {
    // Verifica se algum obstáculo colide com o carro
    return obstacles.some(obstacle => 
        car.x < obstacle.x + obstacle.width &&
        car.x + car.width > obstacle.x &&
        car.y < obstacle.y + obstacle.height &&
        car.y + car.height > obstacle.y
    );
}

// Função para atualizar a pontuação
function updateScore() {
    // Incrementa a pontuação
    score++;
    // Aumenta a velocidade do jogo a cada 100 pontos
    if (score % 100 === 0) {
        gameSpeed += 0.5;
    }
}

// Função para desenhar a pontuação
function drawScore() {
    ctx.fillStyle = 'white';            // Define a cor do texto como branco
    ctx.font = 'bold 20px Arial';       // Define a fonte e o tamanho do texto
    ctx.fillText(`Pontuação: ${score}`, 10, 30); // Desenha o texto da pontuação
}

// Objeto para rastrear as teclas pressionadas
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false
};

// Event listener para detectar quando uma tecla é pressionada
window.addEventListener('keydown', (e) => {
    if (e.key in keys) {
        keys[e.key] = true; // Marca a tecla como pressionada
    }
});

// Event listener para detectar quando uma tecla é solta
window.addEventListener('keyup', (e) => {
    if (e.key in keys) {
        keys[e.key] = false; // Marca a tecla como não pressionada
    }
});

// Função para mover o carro com base nas teclas pressionadas
function moveCar() {
    // Move para a esquerda se a seta esquerda estiver pressionada e o carro não estiver no limite esquerdo
    if (keys.ArrowLeft && car.x > 0) car.x -= car.speed;
    // Move para a direita se a seta direita estiver pressionada e o carro não estiver no limite direito
    if (keys.ArrowRight && car.x < canvas.width - car.width) car.x += car.speed;
    // Move para cima se a seta para cima estiver pressionada e o carro não estiver no topo
    if (keys.ArrowUp && car.y > 0) car.y -= car.speed;
    // Move para baixo se a seta para baixo estiver pressionada e o carro não estiver no fundo
    if (keys.ArrowDown && car.y < canvas.height - car.height) car.y += car.speed;
}

// Loop principal do jogo
function gameLoop() {
    if (gameOver) {
        // Exibe a tela de fim de jogo
        ctx.fillStyle = 'white';
        ctx.font = 'bold 30px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 70, canvas.height / 2);
        ctx.fillText(`Pontuação Final: ${score}`, canvas.width / 2 - 100, canvas.height / 2 + 40);
        return; // Sai do loop de jogo
    }

    // Limpa o canvas para o próximo frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Atualiza e desenha os elementos do jogo
    drawRoad();    // Desenha a estrada
    moveCar();     // Move o carro baseado nas teclas pressionadas
    moveObstacles(); // Move os obstáculos e cria novos
    drawObstacles(); // Desenha os obstáculos
    drawCar();     // Desenha o carro
    drawScore();   // Desenha a pontuação

    // Verifica se houve colisão
    if (checkCollision()) {
        gameOver = true; // Termina o jogo se houver colisão
    } else {
        updateScore(); // Atualiza a pontuação se não houver colisão
    }

    // Solicita o próximo frame de animação
    requestAnimationFrame(gameLoop);
}

// Inicia o loop do jogo
gameLoop();