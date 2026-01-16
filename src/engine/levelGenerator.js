// Level Generator - Creates 100 levels with increasing difficulty
// Self-contained module with no external dependencies

// Color names (duplicated here to avoid circular dependency)
const COLOR_NAMES = ['red', 'blue', 'yellow', 'purple', 'green', 'orange', 'pink'];

// Level configurations - difficulty increases over time
export const LEVELS_CONFIG = {};

// Generate config for all 100 levels
for (let i = 1; i <= 100; i++) {
    let colors, bottles;

    if (i <= 5) {
        colors = 2;
        bottles = 3;
    } else if (i <= 10) {
        colors = 2;
        bottles = 4;
    } else if (i <= 20) {
        colors = 3;
        bottles = 4;
    } else if (i <= 35) {
        colors = 3;
        bottles = 5;
    } else if (i <= 50) {
        colors = 4;
        bottles = 5;
    } else if (i <= 70) {
        colors = 4;
        bottles = 6;
    } else if (i <= 85) {
        colors = 5;
        bottles = 6;
    } else {
        colors = 5;
        bottles = 7;
    }

    LEVELS_CONFIG[i] = { colors, bottles };
}

// Seeded random number generator for consistent levels
function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// Shuffle array with seed
function shuffleArray(array, seed) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(seed + i) * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

// Generate a level with given parameters
export function generateLevel(numColors, numBottles, levelSeed) {
    // Select colors for this level
    const selectedColors = shuffleArray(COLOR_NAMES, levelSeed).slice(0, numColors);

    // Create 4 of each color (to fill bottles)
    const allLayers = [];
    for (const color of selectedColors) {
        for (let i = 0; i < 4; i++) {
            allLayers.push(color);
        }
    }

    // Shuffle all layers
    const shuffledLayers = shuffleArray(allLayers, levelSeed * 2);

    // Number of filled bottles = numColors, empty bottles = numBottles - numColors
    const filledBottles = numColors;
    const emptyBottles = numBottles - numColors;

    const bottles = [];

    // Create filled bottles
    for (let i = 0; i < filledBottles; i++) {
        bottles.push({
            id: `bottle-${i}`,
            layers: shuffledLayers.slice(i * 4, (i + 1) * 4),
        });
    }

    // Create empty bottles
    for (let i = 0; i < emptyBottles; i++) {
        bottles.push({
            id: `bottle-${filledBottles + i}`,
            layers: [null, null, null, null],
        });
    }

    // Shuffle bottle order
    return shuffleArray(bottles, levelSeed * 3);
}
