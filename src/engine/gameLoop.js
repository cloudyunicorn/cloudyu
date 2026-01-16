// Game Loop utilities and helpers
import { useAudioPlayer } from 'expo-audio';

// Sound file paths
const SOUND_FILES = {
    pour: require('../../assets/sounds/pour-liquid.wav'),
    success: require('../../assets/sounds/male-victory.wav'),
    bottleComplete: require('../../assets/sounds/bottle-complete.wav'),
};

// Sound manager using expo-audio
class SoundManager {
    constructor() {
        this.players = {
            pour: null,
            success: null,
            bottleComplete: null,
        };
        this.loaded = false;
    }

    async loadSounds() {
        // With expo-audio, sounds are loaded when played
        // We just mark as ready
        this.loaded = true;
        console.log('🎵 Sound manager ready');
    }

    async playPour() {
        try {
            // Create and play sound
            const { createAudioPlayer } = await import('expo-audio');
            const player = createAudioPlayer(SOUND_FILES.pour);
            player.play();
        } catch (error) {
            console.log('Pour sound error:', error);
        }
    }

    async playError() {
        console.log('🎵 Error sound');
    }

    async playSuccess() {
        try {
            const { createAudioPlayer } = await import('expo-audio');
            const player = createAudioPlayer(SOUND_FILES.success);
            player.play();
        } catch (error) {
            console.log('Success sound error:', error);
        }
    }

    async playBottleComplete() {
        try {
            const { createAudioPlayer } = await import('expo-audio');
            const player = createAudioPlayer(SOUND_FILES.bottleComplete);
            player.play();
        } catch (error) {
            console.log('Bottle complete sound error:', error);
        }
    }

    async unloadSounds() {
        // Cleanup if needed
    }
}

export const soundManager = new SoundManager();

// Animation timing constants
export const ANIMATION_DURATIONS = {
    pour: 400,
    shake: 300,
    glow: 200,
    celebration: 1000,
};
