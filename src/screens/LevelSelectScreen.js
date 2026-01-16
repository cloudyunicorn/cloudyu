// LevelSelectScreen - Grid display for selecting levels
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import useGameStore from '../store/gameStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMNS = 5;
const LEVEL_SIZE = (SCREEN_WIDTH - 60) / COLUMNS;
const TOTAL_LEVELS = 100;

const LevelSelectScreen = ({ navigation }) => {
    const currentLevel = useGameStore(state => state.currentLevel);
    const playLevel = useGameStore(state => state.playLevel);

    const handleLevelPress = (levelNum) => {
        if (levelNum <= currentLevel) {
            playLevel(levelNum);
            navigation.navigate('Game');
        }
    };

    const getLevelState = (levelNum) => {
        if (levelNum < currentLevel) return 'cleared';
        if (levelNum === currentLevel) return 'current';
        return 'locked';
    };

    const renderLevelButton = (levelNum) => {
        const state = getLevelState(levelNum);
        const isLocked = state === 'locked';

        return (
            <TouchableOpacity
                key={levelNum}
                style={[
                    styles.levelButton,
                    state === 'current' && styles.currentLevel,
                    isLocked && styles.lockedLevel,
                ]}
                onPress={() => handleLevelPress(levelNum)}
                activeOpacity={isLocked ? 1 : 0.7}
                disabled={isLocked}
            >
                {state === 'current' ? (
                    <LinearGradient
                        colors={['#4ECDC4', '#44A08D']}
                        style={styles.currentGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Text style={styles.levelNumber}>{levelNum}</Text>
                    </LinearGradient>
                ) : (
                    <View style={[
                        styles.levelContent,
                        state === 'cleared' && styles.clearedContent,
                        isLocked && styles.lockedContent,
                    ]}>
                        {isLocked ? (
                            <Text style={styles.lockIcon}>🔒</Text>
                        ) : (
                            <>
                                <Text style={[
                                    styles.levelNumber,
                                    state === 'cleared' && styles.clearedNumber,
                                ]}>
                                    {levelNum}
                                </Text>
                                {state === 'cleared' && (
                                    <Text style={styles.checkmark}>✓</Text>
                                )}
                            </>
                        )}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderLevelGrid = () => {
        const levels = [];
        for (let i = 1; i <= TOTAL_LEVELS; i++) {
            levels.push(renderLevelButton(i));
        }
        return levels;
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
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Select Level</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Progress indicator */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${((currentLevel - 1) / TOTAL_LEVELS) * 100}%` }
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        {currentLevel - 1} / {TOTAL_LEVELS} completed
                    </Text>
                </View>

                {/* Level Grid */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.gridContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.grid}>
                        {renderLevelGrid()}
                    </View>
                </ScrollView>
            </SafeAreaView>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backText: {
        fontSize: 24,
        color: '#FFFFFF',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    headerSpacer: {
        width: 44,
    },
    progressContainer: {
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    progressBar: {
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4ECDC4',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    scrollView: {
        flex: 1,
    },
    gridContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    levelButton: {
        width: LEVEL_SIZE - 8,
        height: LEVEL_SIZE - 8,
        marginBottom: 8,
        borderRadius: 12,
        overflow: 'hidden',
    },
    currentLevel: {
        shadowColor: '#4ECDC4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 8,
    },
    lockedLevel: {
        opacity: 0.5,
    },
    currentGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    levelContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    clearedContent: {
        backgroundColor: 'rgba(78, 205, 196, 0.15)',
        borderColor: 'rgba(78, 205, 196, 0.3)',
    },
    lockedContent: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    levelNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    clearedNumber: {
        color: '#4ECDC4',
    },
    checkmark: {
        position: 'absolute',
        top: 4,
        right: 4,
        fontSize: 10,
        color: '#4ECDC4',
    },
    lockIcon: {
        fontSize: 14,
        opacity: 0.6,
    },
});

export default LevelSelectScreen;
