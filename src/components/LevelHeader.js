// LevelHeader Component - Displays level info and controls
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import useGameStore from '../store/gameStore';

const LevelHeader = ({ onRestart }) => {
    const level = useGameStore(state => state.level);
    const moves = useGameStore(state => state.moves);
    const resetLevel = useGameStore(state => state.resetLevel);

    const handleRestart = () => {
        resetLevel();
        onRestart?.();
    };

    return (
        <View style={styles.container}>
            <View style={styles.levelInfo}>
                <Text style={styles.levelText}>Level {level}</Text>
                <Text style={styles.movesText}>{moves} moves</Text>
            </View>

            <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
                <Text style={styles.restartText}>↻</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        marginHorizontal: 20,
    },
    levelInfo: {
        flex: 1,
    },
    levelText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    movesText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 2,
    },
    restartButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    restartText: {
        fontSize: 24,
        color: '#FFFFFF',
    },
});

export default LevelHeader;
