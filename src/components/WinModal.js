// WinModal Component - Modern, subtle victory celebration
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withDelay,
    withSequence,
    Easing,
    interpolate,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Floating particle component for subtle effect
const FloatingParticle = ({ delay, index }) => {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.5);

    const startX = (index % 5) * (SCREEN_WIDTH / 5) + 20;

    useEffect(() => {
        opacity.value = withDelay(delay, withSequence(
            withTiming(0.6, { duration: 400 }),
            withDelay(1500, withTiming(0, { duration: 600 }))
        ));
        translateY.value = withDelay(delay, withTiming(-150, {
            duration: 2500,
            easing: Easing.out(Easing.cubic),
        }));
        scale.value = withDelay(delay, withSequence(
            withTiming(1, { duration: 500 }),
            withTiming(0.3, { duration: 2000 })
        ));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale: scale.value },
        ],
        opacity: opacity.value,
    }));

    const colors = ['#4ECDC4', '#FFE66D', '#A855F7', '#FF6B6B', '#22C55E'];

    return (
        <Animated.View
            style={[
                styles.particle,
                { left: startX, backgroundColor: colors[index % 5] },
                animatedStyle,
            ]}
        />
    );
};

const WinModal = ({ visible, level, moves, onNextLevel, onRestart }) => {
    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(30);
    const checkmarkScale = useSharedValue(0);
    const ringScale = useSharedValue(0);
    const ringOpacity = useSharedValue(1);

    useEffect(() => {
        if (visible) {
            // Modal entrance
            opacity.value = withTiming(1, { duration: 300 });
            scale.value = withSpring(1, { damping: 15, stiffness: 150 });
            translateY.value = withSpring(0, { damping: 15 });

            // Checkmark animation
            checkmarkScale.value = withDelay(200, withSpring(1, { damping: 10 }));

            // Ring pulse
            ringScale.value = withDelay(300, withSequence(
                withTiming(1.5, { duration: 400 }),
                withTiming(2, { duration: 300 })
            ));
            ringOpacity.value = withDelay(300, withSequence(
                withTiming(0.8, { duration: 400 }),
                withTiming(0, { duration: 300 })
            ));
        } else {
            scale.value = 0.8;
            opacity.value = 0;
            translateY.value = 30;
            checkmarkScale.value = 0;
            ringScale.value = 0;
            ringOpacity.value = 1;
        }
    }, [visible]);

    const modalStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { translateY: translateY.value },
        ],
        opacity: opacity.value,
    }));

    const checkmarkStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkmarkScale.value }],
    }));

    const ringStyle = useAnimatedStyle(() => ({
        transform: [{ scale: ringScale.value }],
        opacity: ringOpacity.value,
    }));

    return (
        <Modal visible={visible} transparent animationType="none">
            <View style={styles.overlay}>
                {/* Subtle floating particles */}
                {visible && [...Array(8)].map((_, i) => (
                    <FloatingParticle key={i} delay={i * 80} index={i} />
                ))}

                <Animated.View style={[styles.modal, modalStyle]}>
                    {/* Success icon with ring effect */}
                    <View style={styles.iconContainer}>
                        <Animated.View style={[styles.ring, ringStyle]} />
                        <Animated.View style={[styles.checkmarkCircle, checkmarkStyle]}>
                            <Text style={styles.checkmark}>✓</Text>
                        </Animated.View>
                    </View>

                    <Text style={styles.title}>Level Complete</Text>
                    <Text style={styles.levelText}>Level {level}</Text>

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{moves}</Text>
                            <Text style={styles.statLabel}>Moves</Text>
                        </View>
                    </View>

                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={styles.nextButton}
                            onPress={onNextLevel}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.nextButtonText}>Continue</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.restartButton}
                            onPress={onRestart}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.restartButtonText}>Play Again</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(10, 10, 20, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#1E1E2E',
        borderRadius: 28,
        padding: 32,
        alignItems: 'center',
        width: '85%',
        maxWidth: 340,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        shadowColor: '#4ECDC4',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
    },
    iconContainer: {
        position: 'relative',
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    ring: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#4ECDC4',
    },
    checkmarkCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#4ECDC4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        fontSize: 32,
        color: '#1E1E2E',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    levelText: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.5)',
        marginTop: 4,
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        marginBottom: 28,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#4ECDC4',
    },
    statLabel: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.5)',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    buttons: {
        width: '100%',
        gap: 12,
    },
    nextButton: {
        backgroundColor: '#4ECDC4',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    nextButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1E1E2E',
    },
    restartButton: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    restartButtonText: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    particle: {
        position: 'absolute',
        bottom: '30%',
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});

export default WinModal;
