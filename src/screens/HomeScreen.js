// HomeScreen - Main menu screen
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withDelay,
} from 'react-native-reanimated';
import useGameStore from '../store/gameStore';

const HomeScreen = ({ navigation }) => {
    const isSoundEnabled = useGameStore(state => state.isSoundEnabled);
    const toggleSound = useGameStore(state => state.toggleSound);
    const currentLevel = useGameStore(state => state.currentLevel);
    const loadSavedProgress = useGameStore(state => state.loadSavedProgress);

    // Animated bottle illustration
    const bottleRotate = useSharedValue(0);
    const bottleScale = useSharedValue(1);

    React.useEffect(() => {
        bottleRotate.value = withRepeat(
            withSequence(
                withTiming(-5, { duration: 1000 }),
                withTiming(5, { duration: 1000 })
            ),
            -1,
            true
        );
        bottleScale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 1500 }),
                withTiming(1, { duration: 1500 })
            ),
            -1,
            true
        );
    }, []);

    const bottleStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${bottleRotate.value}deg` },
            { scale: bottleScale.value },
        ],
    }));

    const handlePlay = () => {
        loadSavedProgress();
        navigation.navigate('Game');
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
                {/* Animated Bottle Illustration */}
                <Animated.View style={[styles.bottleIllustration, bottleStyle]}>
                    <View style={styles.demoBotlle}>
                        <View style={styles.demoNeck} />
                        <View style={styles.demoBody}>
                            <View style={[styles.demoLayer, { backgroundColor: '#FF6B6B' }]} />
                            <View style={[styles.demoLayer, { backgroundColor: '#4ECDC4' }]} />
                            <View style={[styles.demoLayer, { backgroundColor: '#FFE66D' }]} />
                            <View style={[styles.demoLayer, { backgroundColor: '#A855F7' }]} />
                        </View>
                    </View>
                </Animated.View>

                {/* Title */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Color Bottle</Text>
                    <Text style={styles.subtitle}>Sort</Text>
                </View>

                {/* Play Button */}
                <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
                    <LinearGradient
                        colors={['#4ECDC4', '#44A08D']}
                        style={styles.playButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Text style={styles.playButtonText}>
                            {currentLevel > 1 ? `Continue Level ${currentLevel}` : 'Play'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Settings Button */}
                <TouchableOpacity style={styles.settingsButton} onPress={toggleSound}>
                    <Text style={styles.settingsText}>
                        {isSoundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
                    </Text>
                </TouchableOpacity>
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
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    bottleIllustration: {
        marginBottom: 30,
    },
    demoBotlle: {
        alignItems: 'center',
    },
    demoNeck: {
        width: 30,
        height: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderWidth: 2,
        borderBottomWidth: 0,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    demoBody: {
        width: 60,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        overflow: 'hidden',
        borderWidth: 2,
        borderTopWidth: 0,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    demoLayer: {
        height: 25,
        width: '100%',
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 50,
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textShadowColor: 'rgba(78, 205, 196, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
    },
    subtitle: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#4ECDC4',
        textShadowColor: 'rgba(78, 205, 196, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
        marginTop: -10,
    },
    playButton: {
        width: '80%',
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#4ECDC4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    playButtonGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        borderRadius: 16,
    },
    playButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    settingsButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    settingsText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
});

export default HomeScreen;
