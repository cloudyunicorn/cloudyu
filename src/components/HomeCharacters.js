// HomeAnimations - Animated bottles and effects for home screen
// Similar to popular color sort puzzle games
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withDelay,
    Easing,
    interpolate,
    runOnJS,
} from 'react-native-reanimated';

// Animated bottle group - shows bottles in a decorative arrangement
export const AnimatedBottleGroup = ({ position, delay = 0 }) => {
    const float = useSharedValue(0);
    const glow = useSharedValue(0.5);

    useEffect(() => {
        const startAnimations = () => {
            // Gentle floating animation
            float.value = withDelay(delay,
                withRepeat(
                    withSequence(
                        withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
                        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.sin) })
                    ),
                    -1,
                    true
                )
            );
            // Subtle glow pulse
            glow.value = withDelay(delay,
                withRepeat(
                    withSequence(
                        withTiming(1, { duration: 1200 }),
                        withTiming(0.5, { duration: 1200 })
                    ),
                    -1,
                    true
                )
            );
        };

        // Small delay to ensure mount is complete
        const timer = setTimeout(startAnimations, 100);
        return () => clearTimeout(timer);
    }, [delay]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: float.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: interpolate(glow.value, [0.5, 1], [0.3, 0.7]),
    }));

    const colors = position === 'left'
        ? ['#E63946', '#00B4D8', '#FFCE03', '#06D6A0']
        : ['#9B5DE5', '#FF6B35', '#06D6A0', '#00B4D8'];

    return (
        <Animated.View style={[styles.bottleGroup, { [position]: 15 }, containerStyle]}>
            {/* Glow effect behind bottle */}
            <Animated.View style={[styles.bottleGlow, glowStyle, { backgroundColor: colors[0] }]} />

            {/* Decorative bottle */}
            <View style={styles.decoBottle}>
                <View style={styles.decoNeck} />
                <View style={styles.decoBody}>
                    {colors.map((color, i) => (
                        <View key={i} style={[styles.decoLayer, { backgroundColor: color }]} />
                    ))}
                </View>
            </View>
        </Animated.View>
    );
};

// Sparkle/star effect
export const Sparkle = ({ style, delay = 0 }) => {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);
    const rotation = useSharedValue(0);

    useEffect(() => {
        const startAnimations = () => {
            // Twinkle animation
            scale.value = withDelay(delay,
                withRepeat(
                    withSequence(
                        withTiming(1.2, { duration: 400, easing: Easing.out(Easing.cubic) }),
                        withTiming(0, { duration: 400, easing: Easing.in(Easing.cubic) }),
                        withTiming(0, { duration: 800 }) // pause
                    ),
                    -1,
                    false
                )
            );
            opacity.value = withDelay(delay,
                withRepeat(
                    withSequence(
                        withTiming(1, { duration: 400 }),
                        withTiming(0, { duration: 400 }),
                        withTiming(0, { duration: 800 })
                    ),
                    -1,
                    false
                )
            );
            rotation.value = withDelay(delay,
                withRepeat(
                    withTiming(180, { duration: 1600, easing: Easing.linear }),
                    -1,
                    false
                )
            );
        };

        const timer = setTimeout(startAnimations, 100);
        return () => clearTimeout(timer);
    }, [delay]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { rotate: `${rotation.value}deg` },
        ],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[styles.sparkle, style, animatedStyle]}>
            <View style={styles.sparkleCore} />
            <View style={[styles.sparkleRay, styles.rayHorizontal]} />
            <View style={[styles.sparkleRay, styles.rayVertical]} />
            <View style={[styles.sparkleRay, styles.rayDiagonal1]} />
            <View style={[styles.sparkleRay, styles.rayDiagonal2]} />
        </Animated.View>
    );
};

// Container with multiple sparkles
export const SparkleField = () => {
    const sparklePositions = [
        { top: '12%', left: '10%', delay: 0 },
        { top: '18%', right: '15%', delay: 400 },
        { top: '35%', left: '8%', delay: 800 },
        { top: '40%', right: '12%', delay: 200 },
        { top: '55%', left: '15%', delay: 600 },
        { top: '50%', right: '10%', delay: 1000 },
    ];

    return (
        <>
            {sparklePositions.map((pos, i) => (
                <Sparkle key={i} style={pos} delay={pos.delay} />
            ))}
        </>
    );
};

// Floating color drops/bubbles
export const FloatingBubbles = () => {
    const colors = ['#E63946', '#00B4D8', '#FFCE03', '#9B5DE5', '#06D6A0', '#FF6B35'];

    const bubbleConfigs = [
        { left: '8%', delay: 0, size: 12, colorIndex: 0 },
        { right: '10%', delay: 300, size: 10, colorIndex: 1 },
        { left: '15%', delay: 600, size: 8, colorIndex: 2 },
        { right: '18%', delay: 900, size: 14, colorIndex: 3 },
        { left: '5%', delay: 1200, size: 10, colorIndex: 4 },
        { right: '8%', delay: 1500, size: 8, colorIndex: 5 },
    ];

    return (
        <>
            {bubbleConfigs.map((config, i) => (
                <FloatingBubble
                    key={i}
                    {...config}
                    color={colors[config.colorIndex]}
                />
            ))}
        </>
    );
};

const FloatingBubble = ({ left, right, delay, size, color }) => {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0.8);

    useEffect(() => {
        const startAnimations = () => {
            // Float up animation
            translateY.value = withDelay(delay,
                withRepeat(
                    withSequence(
                        withTiming(0, { duration: 10 }),
                        withTiming(-150, { duration: 3000, easing: Easing.out(Easing.cubic) })
                    ),
                    -1,
                    false
                )
            );
            opacity.value = withDelay(delay,
                withRepeat(
                    withSequence(
                        withTiming(0.8, { duration: 500 }),
                        withTiming(0.8, { duration: 2000 }),
                        withTiming(0, { duration: 500 })
                    ),
                    -1,
                    false
                )
            );
        };

        const timer = setTimeout(startAnimations, 100);
        return () => clearTimeout(timer);
    }, [delay]);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.bubble,
                {
                    left,
                    right,
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                },
                animStyle
            ]}
        />
    );
};

const styles = StyleSheet.create({
    // Bottle group styles
    bottleGroup: {
        position: 'absolute',
        top: '20%',
        zIndex: 5,
        alignItems: 'center',
    },
    bottleGlow: {
        position: 'absolute',
        width: 50,
        height: 80,
        borderRadius: 25,
        top: 10,
    },
    decoBottle: {
        alignItems: 'center',
    },
    decoNeck: {
        width: 14,
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
        borderWidth: 1.5,
        borderBottomWidth: 0,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    decoBody: {
        width: 28,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderTopWidth: 0,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    decoLayer: {
        height: 14,
    },
    // Sparkle styles
    sparkle: {
        position: 'absolute',
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    sparkleCore: {
        width: 6,
        height: 6,
        backgroundColor: '#FFFFFF',
        borderRadius: 3,
        position: 'absolute',
    },
    sparkleRay: {
        position: 'absolute',
        backgroundColor: '#FFFFFF',
    },
    rayHorizontal: {
        width: 16,
        height: 2,
        borderRadius: 1,
    },
    rayVertical: {
        width: 2,
        height: 16,
        borderRadius: 1,
    },
    rayDiagonal1: {
        width: 12,
        height: 2,
        borderRadius: 1,
        transform: [{ rotate: '45deg' }],
    },
    rayDiagonal2: {
        width: 12,
        height: 2,
        borderRadius: 1,
        transform: [{ rotate: '-45deg' }],
    },
    // Bubble styles
    bubble: {
        position: 'absolute',
        bottom: '15%',
        zIndex: 3,
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
});
