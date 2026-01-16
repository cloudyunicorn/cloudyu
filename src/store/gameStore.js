// Game Store using Zustand with persistence
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateLevel, LEVELS_CONFIG } from '../engine/levelGenerator';

// Color palette for the game - all bright, vibrant, distinct colors
export const COLORS = {
  red: '#E63946',      // Bright red
  blue: '#00B4D8',     // Bright cyan-blue  
  yellow: '#FFCE03',   // Bright yellow
  purple: '#9B5DE5',   // Vivid purple
  green: '#06D6A0',    // Bright teal-green
  orange: '#FF6B35',   // Bright orange
  pink: '#FF69B4',     // Hot pink
};

export const COLOR_NAMES = Object.keys(COLORS);

const useGameStore = create(
  persist(
    (set, get) => ({
      // Persisted state
      currentLevel: 1, // Highest unlocked level
      isSoundEnabled: true,

      // Session state (not persisted)
      level: 1,
      bottles: [],
      selectedBottle: null,
      moves: 0,
      history: [],
      isWon: false,

      // Initialize a level
      initLevel: (levelNum) => {
        const levelConfig = LEVELS_CONFIG[Math.min(levelNum, 100)] || LEVELS_CONFIG[100];
        const bottles = generateLevel(levelConfig.colors, levelConfig.bottles, levelNum);

        set({
          level: levelNum,
          bottles,
          selectedBottle: null,
          moves: 0,
          history: [],
          isWon: false,
        });
      },

      // Load saved progress and start game
      loadSavedProgress: () => {
        const { currentLevel } = get();
        get().initLevel(currentLevel);
      },

      // Select a bottle
      selectBottle: (bottleId) => {
        const { selectedBottle, bottles } = get();

        if (selectedBottle === null) {
          const bottle = bottles.find(b => b.id === bottleId);
          if (bottle && bottle.layers.some(l => l !== null)) {
            set({ selectedBottle: bottleId });
            return { action: 'selected' };
          }
          return { action: 'empty' };
        } else if (selectedBottle === bottleId) {
          set({ selectedBottle: null });
          return { action: 'deselected' };
        } else {
          return get().pour(selectedBottle, bottleId);
        }
      },

      // Pour from one bottle to another
      pour: (fromId, toId) => {
        const { bottles, moves, history } = get();

        const fromBottle = bottles.find(b => b.id === fromId);
        const toBottle = bottles.find(b => b.id === toId);

        if (!fromBottle || !toBottle) {
          set({ selectedBottle: null });
          return { action: 'invalid' };
        }

        const fromLayers = [...fromBottle.layers];
        let topColorIndex = -1;
        for (let i = 3; i >= 0; i--) {
          if (fromLayers[i] !== null) {
            topColorIndex = i;
            break;
          }
        }

        if (topColorIndex === -1) {
          set({ selectedBottle: null });
          return { action: 'invalid' };
        }

        const topColor = fromLayers[topColorIndex];

        let pourCount = 0;
        for (let i = topColorIndex; i >= 0; i--) {
          if (fromLayers[i] === topColor) {
            pourCount++;
          } else {
            break;
          }
        }

        const toLayers = [...toBottle.layers];
        let emptySlots = 0;
        let toTopColor = null;

        for (let i = 3; i >= 0; i--) {
          if (toLayers[i] === null) {
            emptySlots++;
          } else {
            toTopColor = toLayers[i];
            break;
          }
        }

        if (emptySlots === 0) {
          set({ selectedBottle: null });
          return { action: 'invalid', reason: 'full' };
        }

        if (toTopColor !== null && toTopColor !== topColor) {
          set({ selectedBottle: null });
          return { action: 'invalid', reason: 'color_mismatch' };
        }

        const actualPour = Math.min(pourCount, emptySlots);

        const historyEntry = {
          bottles: JSON.parse(JSON.stringify(bottles)),
          moves,
        };

        const newFromLayers = [...fromLayers];
        const newToLayers = [...toLayers];

        let removed = 0;
        for (let i = topColorIndex; i >= 0 && removed < actualPour; i--) {
          if (newFromLayers[i] === topColor) {
            newFromLayers[i] = null;
            removed++;
          } else {
            break;
          }
        }

        let added = 0;
        for (let i = 0; i < 4 && added < actualPour; i++) {
          if (newToLayers[i] === null) {
            newToLayers[i] = topColor;
            added++;
          }
        }

        const newBottles = bottles.map(b => {
          if (b.id === fromId) return { ...b, layers: newFromLayers };
          if (b.id === toId) return { ...b, layers: newToLayers };
          return b;
        });

        const isWon = checkWinCondition(newBottles);

        set({
          bottles: newBottles,
          selectedBottle: null,
          moves: moves + 1,
          history: [...history, historyEntry],
          isWon,
        });

        return {
          action: 'poured',
          from: fromId,
          to: toId,
          color: topColor,
          count: actualPour,
          isWon,
        };
      },

      // Undo last move
      undo: () => {
        const { history } = get();
        if (history.length === 0) return false;

        const lastState = history[history.length - 1];
        set({
          bottles: lastState.bottles,
          moves: lastState.moves,
          history: history.slice(0, -1),
          selectedBottle: null,
          isWon: false,
        });
        return true;
      },

      // Reset current level
      resetLevel: () => {
        const { level } = get();
        get().initLevel(level);
      },

      // Go to next level and save progress
      nextLevel: () => {
        const { level, currentLevel } = get();
        const nextLevelNum = level + 1;

        // Save progress - update currentLevel if we've advanced
        if (nextLevelNum > currentLevel) {
          set({ currentLevel: nextLevelNum });
        }

        get().initLevel(nextLevelNum);
      },

      // Toggle sound
      toggleSound: () => {
        set(state => ({ isSoundEnabled: !state.isSoundEnabled }));
      },

      // Play a specific unlocked level (for level select)
      playLevel: (levelNum) => {
        const { currentLevel } = get();
        // Only allow playing levels up to the highest unlocked level
        if (levelNum <= currentLevel) {
          get().initLevel(levelNum);
          return true;
        }
        return false;
      },
    }),
    {
      name: 'color-bottle-sort-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist these fields
      partialize: (state) => ({
        currentLevel: state.currentLevel,
        isSoundEnabled: state.isSoundEnabled,
      }),
    }
  )
);

// Check if all bottles are sorted
function checkWinCondition(bottles) {
  for (const bottle of bottles) {
    const colors = bottle.layers.filter(l => l !== null);
    if (colors.length === 0) continue;
    if (colors.length !== 4) return false;
    if (!colors.every(c => c === colors[0])) return false;
  }
  return true;
}

export default useGameStore;
