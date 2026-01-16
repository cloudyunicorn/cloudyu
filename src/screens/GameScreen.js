// GameScreen - Main gameplay screen
import React, { useEffect, useCallback, useState } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import GameBoard from '../components/GameBoard';
import LevelHeader from '../components/LevelHeader';
import WinModal from '../components/WinModal';
import useGameStore from '../store/gameStore';
import { soundManager } from '../engine/gameLoop';

const GameScreen = ({ navigation }) => {
    const level = useGameStore(state => state.level);
    const moves = useGameStore(state => state.moves);
    const isWon = useGameStore(state => state.isWon);
    const isSoundEnabled = useGameStore(state => state.isSoundEnabled);
    const undo = useGameStore(state => state.undo);
    const resetLevel = useGameStore(state => state.resetLevel);
    const nextLevel = useGameStore(state => state.nextLevel);
    const history = useGameStore(state => state.history);

    // Delayed win modal display - wait for animation to complete
    const [showWinModal, setShowWinModal] = useState(false);

    useEffect(() => {
        // Load sounds on mount
        soundManager.loadSounds();
    }, []);

    // Handle delayed win modal display
    useEffect(() => {
        if (isWon && !showWinModal) {
            // Wait for pour animation to complete (600ms) before showing modal
            const timer = setTimeout(() => {
                setShowWinModal(true);
                if (isSoundEnabled) {
                    soundManager.playSuccess();
                }
            }, 600);
            return () => clearTimeout(timer);
        } else if (!isWon) {
            setShowWinModal(false);
        }
    }, [isWon, isSoundEnabled]);

    const handlePourResult = useCallback((result) => {
        if (!isSoundEnabled) return;

        if (result.action === 'poured') {
            soundManager.playPour();
            // Don't play success sound here anymore - handled in useEffect above
        } else if (result.action === 'error') {
            soundManager.playError();
        }
    }, [isSoundEnabled]);

    const handleUndo = () => {
        undo();
    };

    const handleNextLevel = () => {
        nextLevel();
    };

    const handleRestart = () => {
        resetLevel();
    };

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Gradient Background */}
            <LinearGradient
                colors={['#1a1a2e', '#16213e', '#0f3460']}
                style={styles.gradient}
            />

            <SafeAreaView style={styles.content}>
                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Text style={styles.backText}>← Home</Text>
                </TouchableOpacity>

                {/* Level Header */}
                <LevelHeader onRestart={handleRestart} />

                {/* Game Board */}
                <GameBoard onPourResult={handlePourResult} />

                {/* Bottom Controls */}
                <View style={styles.bottomControls}>
                    <TouchableOpacity
                        style={[styles.controlButton, history.length === 0 && styles.disabledButton]}
                        onPress={handleUndo}
                        disabled={history.length === 0}
                    >
                        <Text style={styles.controlText}>↶ Undo</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Win Modal - delayed to let animation complete */}
            <WinModal
                visible={showWinModal}
                level={level}
                moves={moves}
                onNextLevel={handleNextLevel}
                onRestart={handleRestart}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    content: {
        flex: 1,
    },
    backButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignSelf: 'flex-start',
    },
    backText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    bottomControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 15,
    },
    controlButton: {
        paddingVertical: 14,
        paddingHorizontal: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    disabledButton: {
        opacity: 0.4,
    },
    controlText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
});

export default GameScreen;
