// Variables globales
let moves = 0;
let timer;
let seconds = 0;
let minutes = 0;
let isPlaying = false;
let puzzleSize = 3; // Rompecabezas 3x3
let emptyTile = puzzleSize * puzzleSize - 1; // La última pieza es la vacía
let tiles = [];
let currentImageIndex = 0;
const images = [
    'images/agus contenta.jpg',
    'images/fondo agus.jpg'
];

// Referencias a elementos del DOM
const welcomeScreen = document.getElementById('welcome-screen');
const gameScreen = document.getElementById('game-screen');
const successScreen = document.getElementById('success-screen');
const startButton = document.getElementById('start-button');
const resetButton = document.getElementById('reset-button');
const hintButton = document.getElementById('hint-button');
const playAgainButton = document.getElementById('play-again-button');
const puzzleContainer = document.getElementById('puzzle-container');
const movesElement = document.getElementById('moves');
const timerElement = document.getElementById('timer');
const finalMovesElement = document.getElementById('final-moves');
const finalTimeElement = document.getElementById('final-time');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Configurar los botones
    startButton.addEventListener('click', startGame);
    resetButton.addEventListener('click', resetGame);
    hintButton.addEventListener('click', showHint);
    playAgainButton.addEventListener('click', resetGame);
    
    // Precargar imágenes
    preloadImages();
});

// Función para precargar imágenes
function preloadImages() {
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Función para iniciar el juego
function startGame() {
    showScreen(gameScreen);
    resetGame();
}

// Función para mostrar una pantalla y ocultar las demás
function showScreen(screen) {
    welcomeScreen.classList.remove('active');
    gameScreen.classList.remove('active');
    successScreen.classList.remove('active');
    screen.classList.add('active');
}

// Función para crear el rompecabezas
function createPuzzle() {
    puzzleContainer.innerHTML = '';
    tiles = Array.from({ length: puzzleSize * puzzleSize }, (_, i) => i);
    
    // Mezclar las piezas (asegurando que sea resoluble)
    do {
        shuffleTiles();
    } while (!isSolvable());
    
    // Crear las piezas del rompecabezas
    tiles.forEach((tileIndex, position) => {
        const tile = document.createElement('div');
        tile.classList.add('puzzle-piece');
        
        // La última pieza es la vacía
        if (tileIndex === puzzleSize * puzzleSize - 1) {
            tile.classList.add('empty');
        } else {
            // Calcular la posición de la imagen para esta pieza
            const row = Math.floor(tileIndex / puzzleSize);
            const col = tileIndex % puzzleSize;
            
            tile.style.backgroundImage = `url(${images[currentImageIndex]})`;
            tile.style.backgroundPosition = `${col * 50}% ${row * 50}%`;
        }
        
        tile.dataset.position = position;
        tile.dataset.tileIndex = tileIndex;
        
        tile.addEventListener('click', () => {
            if (isPlaying && canMoveTile(position)) {
                moveTile(position);
                moves++;
                movesElement.textContent = `Movimientos: ${moves}`;
                
                // Verificar si el rompecabezas está resuelto
                if (isPuzzleSolved()) {
                    endGame();
                }
            }
        });
        
        puzzleContainer.appendChild(tile);
    });
}

// Función para mezclar las piezas
function shuffleTiles() {
    for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
        
        // Actualizar la posición de la pieza vacía
        if (tiles[i] === puzzleSize * puzzleSize - 1) {
            emptyTile = i;
        } else if (tiles[j] === puzzleSize * puzzleSize - 1) {
            emptyTile = j;
        }
    }
}

// Función para verificar si el rompecabezas es resoluble
function isSolvable() {
    let inversions = 0;
    
    // Contar inversiones
    for (let i = 0; i < tiles.length - 1; i++) {
        if (tiles[i] === puzzleSize * puzzleSize - 1) continue;
        
        for (let j = i + 1; j < tiles.length; j++) {
            if (tiles[j] === puzzleSize * puzzleSize - 1) continue;
            
            if (tiles[i] > tiles[j]) {
                inversions++;
            }
        }
    }
    
    // Para un rompecabezas 3x3, es resoluble si el número de inversiones es par
    return inversions % 2 === 0;
}

// Función para verificar si una pieza se puede mover
function canMoveTile(position) {
    const row = Math.floor(position / puzzleSize);
    const col = position % puzzleSize;
    const emptyRow = Math.floor(emptyTile / puzzleSize);
    const emptyCol = emptyTile % puzzleSize;
    
    // Una pieza se puede mover si está adyacente a la pieza vacía
    return (
        (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
        (col === emptyCol && Math.abs(row - emptyRow) === 1)
    );
}

// Función para mover una pieza
function moveTile(position) {
    // Intercambiar la pieza con la pieza vacía
    const tileElements = document.querySelectorAll('.puzzle-piece');
    const tileElement = tileElements[position];
    const emptyElement = tileElements[emptyTile];
    
    // Intercambiar los atributos de datos
    const tempTileIndex = tileElement.dataset.tileIndex;
    tileElement.dataset.tileIndex = emptyElement.dataset.tileIndex;
    emptyElement.dataset.tileIndex = tempTileIndex;
    
    // Intercambiar los estilos
    const tempBackground = tileElement.style.backgroundImage;
    const tempPosition = tileElement.style.backgroundPosition;
    
    tileElement.style.backgroundImage = emptyElement.style.backgroundImage;
    tileElement.style.backgroundPosition = emptyElement.style.backgroundPosition;
    tileElement.classList.add('empty');
    
    emptyElement.style.backgroundImage = tempBackground;
    emptyElement.style.backgroundPosition = tempPosition;
    emptyElement.classList.remove('empty');
    
    // Actualizar la posición de la pieza vacía
    [tiles[position], tiles[emptyTile]] = [tiles[emptyTile], tiles[position]];
    emptyTile = position;
}

// Función para verificar si el rompecabezas está resuelto
function isPuzzleSolved() {
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i] !== i) {
            return false;
        }
    }
    return true;
}

// Función para iniciar el temporizador
function startTimer() {
    seconds = 0;
    minutes = 0;
    timerElement.textContent = `Tiempo: 00:00`;
    
    clearInterval(timer);
    timer = setInterval(() => {
        seconds++;
        if (seconds === 60) {
            seconds = 0;
            minutes++;
        }
        
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');
        timerElement.textContent = `Tiempo: ${formattedMinutes}:${formattedSeconds}`;
    }, 1000);
}

// Función para reiniciar el juego
function resetGame() {
    moves = 0;
    movesElement.textContent = `Movimientos: ${moves}`;
    
    // Cambiar a la siguiente imagen
    currentImageIndex = (currentImageIndex + 1) % images.length;
    
    createPuzzle();
    startTimer();
    isPlaying = true;
    showScreen(gameScreen);
}

// Función para mostrar una pista (imagen completa)
function showHint() {
    // Pausar el juego
    isPlaying = false;
    clearInterval(timer);
    
    // Mostrar la imagen completa
    const originalPuzzle = puzzleContainer.innerHTML;
    puzzleContainer.innerHTML = '';
    
    const hintImage = document.createElement('img');
    hintImage.src = images[currentImageIndex];
    hintImage.style.width = '100%';
    hintImage.style.height = '100%';
    hintImage.style.objectFit = 'cover';
    
    puzzleContainer.appendChild(hintImage);
    
    // Después de 3 segundos, volver al juego
    setTimeout(() => {
        puzzleContainer.innerHTML = originalPuzzle;
        isPlaying = true;
        startTimer();
    }, 3000);
}

// Función para finalizar el juego
function endGame() {
    isPlaying = false;
    clearInterval(timer);
    
    // Mostrar la pantalla de éxito
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    
    finalMovesElement.textContent = moves;
    finalTimeElement.textContent = `${formattedMinutes}:${formattedSeconds}`;
    
    // Mostrar un mensaje personalizado basado en el rendimiento
    const successMessage = document.getElementById('success-message');
    if (moves < 50) {
        successMessage.textContent = `¡Increíble! Completaste el rompecabezas en solo ${moves} movimientos y ${formattedMinutes}:${formattedSeconds}. ¡Eres genial!`;
    } else if (moves < 100) {
        successMessage.textContent = `¡Muy bien! Completaste el rompecabezas en ${moves} movimientos y ${formattedMinutes}:${formattedSeconds}.`;
    } else {
        successMessage.textContent = `Completaste el rompecabezas en ${moves} movimientos y ${formattedMinutes}:${formattedSeconds}. ¡Sigue practicando!`;
    }
    
    setTimeout(() => {
        showScreen(successScreen);
    }, 500);
}
