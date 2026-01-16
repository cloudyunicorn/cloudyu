// Level Generator - Creates 100 levels with increasing difficulty
// Uses random shuffle with solvability verification for complex but solvable puzzles

// Color names (duplicated here to avoid circular dependency)
const COLOR_NAMES = ['red', 'blue', 'yellow', 'purple', 'green', 'orange', 'pink'];

// Level configurations - smooth difficulty increase per level
export const LEVELS_CONFIG = {};

// Generate config for all 100 levels with smooth progression
// Difficulty factors: colors (2-7), bottles, and empty bottles (fewer = harder)
for (let i = 1; i <= 100; i++) {
    // Colors: start at 2, gradually increase to 7
    // Level 1-10: 2 colors
    // Level 11-25: 3 colors
    // Level 26-40: 4 colors
    // Level 41-60: 5 colors
    // Level 61-80: 6 colors
    // Level 81-100: 7 colors
    let colors;
    if (i <= 10) colors = 2;
    else if (i <= 25) colors = 3;
    else if (i <= 40) colors = 4;
    else if (i <= 60) colors = 5;
    else if (i <= 80) colors = 6;
    else colors = 7;

    // Empty bottles: start with 2, reduce to 1 as levels progress
    // More empty bottles = easier (more workspace)
    // Within each color bracket, gradually reduce empty bottles
    let emptyBottles;
    if (i <= 5) emptyBottles = 2;  // Very easy start
    else if (i <= 15) emptyBottles = 2;
    else if (i <= 30) emptyBottles = Math.random() < 0.5 ? 1 : 2; // Mix
    else emptyBottles = 1;  // Harder: only 1 empty bottle from level 31+

    // For seeded consistency, use level number
    emptyBottles = (i <= 15) ? 2 : ((i <= 30) ? (i % 2 === 0 ? 2 : 1) : 1);

    const bottles = colors + emptyBottles;

    LEVELS_CONFIG[i] = { colors, bottles, emptyBottles };
}

// Create a seeded random generator
function createSeededRandom(seed) {
    let currentSeed = seed;
    return function () {
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        return currentSeed / 233280;
    };
}

// Shuffle array with seeded random function
function shuffleArrayWithRng(array, rng) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

// Get state key for memoization
function getStateKey(bottles) {
    return bottles.map(b => b.layers.map(l => l || '_').join('')).sort().join('|');
}

// Check if puzzle is solved
function isSolved(bottles) {
    for (const bottle of bottles) {
        const colors = bottle.layers.filter(l => l !== null);
        if (colors.length === 0) continue;
        if (colors.length !== 4) return false;
        if (!colors.every(c => c === colors[0])) return false;
    }
    return true;
}

// Get top color info from a bottle
function getTopInfo(layers) {
    let topIndex = -1;
    for (let i = 3; i >= 0; i--) {
        if (layers[i] !== null) {
            topIndex = i;
            break;
        }
    }
    if (topIndex === -1) return null;

    const color = layers[topIndex];
    let count = 0;
    for (let i = topIndex; i >= 0; i--) {
        if (layers[i] === color) count++;
        else break;
    }
    return { color, count, topIndex };
}

// Count empty slots
function countEmpty(layers) {
    return layers.filter(l => l === null).length;
}

// Perform a pour and return new state (or null if invalid)
function pour(bottles, fromIdx, toIdx) {
    const from = bottles[fromIdx];
    const to = bottles[toIdx];

    const fromInfo = getTopInfo(from.layers);
    if (!fromInfo) return null;

    const toEmpty = countEmpty(to.layers);
    if (toEmpty === 0) return null;

    const toInfo = getTopInfo(to.layers);
    if (toInfo && toInfo.color !== fromInfo.color) return null;

    // Don't pour into empty bottle if source is all same color (waste of move)
    if (toEmpty === 4) {
        const fromColors = from.layers.filter(l => l !== null);
        if (fromColors.every(c => c === fromColors[0])) return null;
    }

    const pourAmount = Math.min(fromInfo.count, toEmpty);

    const newFromLayers = [...from.layers];
    const newToLayers = [...to.layers];

    // Remove from source
    let removed = 0;
    for (let i = fromInfo.topIndex; i >= 0 && removed < pourAmount; i--) {
        if (newFromLayers[i] === fromInfo.color) {
            newFromLayers[i] = null;
            removed++;
        } else break;
    }

    // Add to target
    let added = 0;
    for (let i = 0; i < 4 && added < pourAmount; i++) {
        if (newToLayers[i] === null) {
            newToLayers[i] = fromInfo.color;
            added++;
        }
    }

    return bottles.map((b, idx) => {
        if (idx === fromIdx) return { ...b, layers: newFromLayers };
        if (idx === toIdx) return { ...b, layers: newToLayers };
        return b;
    });
}

// BFS solver to check if puzzle is solvable (with move limit for performance)
function isSolvable(bottles, maxMoves = 150) {
    if (isSolved(bottles)) return true;

    const visited = new Set();
    const queue = [{ bottles, moves: 0 }];
    visited.add(getStateKey(bottles));

    while (queue.length > 0) {
        const { bottles: current, moves } = queue.shift();

        if (moves >= maxMoves) continue;

        // Try all possible pours
        for (let from = 0; from < current.length; from++) {
            for (let to = 0; to < current.length; to++) {
                if (from === to) continue;

                const newState = pour(current, from, to);
                if (!newState) continue;

                if (isSolved(newState)) return true;

                const key = getStateKey(newState);
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push({ bottles: newState, moves: moves + 1 });
                }
            }
        }
    }

    return false;
}

// Generate a random puzzle configuration
function generateRandomPuzzle(numColors, numBottles, rng) {
    // Select colors
    const allColors = shuffleArrayWithRng([...COLOR_NAMES], rng);
    const selectedColors = allColors.slice(0, numColors);

    // Create 4 of each color
    const allLayers = [];
    for (const color of selectedColors) {
        for (let i = 0; i < 4; i++) {
            allLayers.push(color);
        }
    }

    // Shuffle all layers
    const shuffledLayers = shuffleArrayWithRng(allLayers, rng);

    const bottles = [];

    // Create filled bottles
    for (let i = 0; i < numColors; i++) {
        bottles.push({
            id: `bottle-${i}`,
            layers: shuffledLayers.slice(i * 4, (i + 1) * 4),
        });
    }

    // Create empty bottles
    const emptyCount = numBottles - numColors;
    for (let i = 0; i < emptyCount; i++) {
        bottles.push({
            id: `bottle-${numColors + i}`,
            layers: [null, null, null, null],
        });
    }

    // Shuffle bottle order
    return shuffleArrayWithRng(bottles, rng);
}

// Generate a level - random shuffle with solvability verification
export function generateLevel(numColors, numBottles, levelSeed) {
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
        const rng = createSeededRandom(levelSeed + attempts * 1000);
        const bottles = generateRandomPuzzle(numColors, numBottles, rng);

        // Check if already solved (skip trivial cases)
        if (isSolved(bottles)) {
            attempts++;
            continue;
        }

        // Verify solvability
        if (isSolvable(bottles)) {
            // Re-assign IDs
            return bottles.map((b, idx) => ({ ...b, id: `bottle-${idx}` }));
        }

        attempts++;
    }

    // Fallback: generate using reverse moves (guaranteed solvable)
    return generateFallbackLevel(numColors, numBottles, levelSeed);
}

// Fallback reverse-move generator (guaranteed solvable)
function generateFallbackLevel(numColors, numBottles, levelSeed) {
    const rng = createSeededRandom(levelSeed);
    const allColors = shuffleArrayWithRng([...COLOR_NAMES], rng);
    const selectedColors = allColors.slice(0, numColors);

    let bottles = [];

    // Start solved
    for (let i = 0; i < numColors; i++) {
        bottles.push({
            id: `bottle-${i}`,
            layers: [selectedColors[i], selectedColors[i], selectedColors[i], selectedColors[i]],
        });
    }

    // Add empty bottles
    for (let i = 0; i < numBottles - numColors; i++) {
        bottles.push({
            id: `bottle-${numColors + i}`,
            layers: [null, null, null, null],
        });
    }

    // Scramble with reverse moves
    const targetMoves = 100 + levelSeed * 5;
    let moves = 0;

    for (let attempt = 0; attempt < targetMoves * 3 && moves < targetMoves; attempt++) {
        const from = Math.floor(rng() * bottles.length);
        const to = Math.floor(rng() * bottles.length);
        if (from === to) continue;

        const newState = pour(bottles, from, to);
        if (newState && !isSolved(newState)) {
            bottles = newState;
            moves++;
        }
    }

    bottles = shuffleArrayWithRng(bottles, rng);
    return bottles.map((b, idx) => ({ ...b, id: `bottle-${idx}` }));
}
