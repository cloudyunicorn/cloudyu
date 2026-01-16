// Bottle Component - Main bottle with liquid layers and pour animations
import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    withDelay,
    withRepeat,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import LiquidLayer from './LiquidLayer';
import { COLORS } from '../store/gameStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Bottle = ({
    bottle,
    isSelected,
    onPress,
    isPouringFrom,
    isPouringTo,
    pourColor,
    pourCount,
    pouringLayers, // array of layer indices being animated
}) => {
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const rotation = useSharedValue(0);
    const glowOpacity = useSharedValue(0);

    // Celebration animation values
    const celebrationGlow = useSharedValue(0);
    const sparkleRotation = useSharedValue(0);
    const sparkleScale = useSharedValue(0);

    // Check if bottle is complete (4 of same color)
    const isComplete = useMemo(() => {
        const colors = bottle.layers.filter(l => l !== null);
        if (colors.length !== 4) return false;
        return colors.every(c => c === colors[0]);
    }, [bottle.layers]);

    // Get the bottle's color for celebration effect
    const bottleColor = useMemo(() => {
        if (!isComplete) return null;
        const colorName = bottle.layers[0];
        return COLORS[colorName] || '#4ECDC4';
    }, [isComplete, bottle.layers]);

    // Selection glow effect
    useEffect(() => {
        if (isSelected) {
            glowOpacity.value = withSpring(1);
            scale.value = withSpring(1.05);
            // Slight lift when selected
            translateY.value = withSpring(-5);
        } else {
            glowOpacity.value = withSpring(0);
            scale.value = withSpring(1);
            translateY.value = withSpring(0);
        }
    }, [isSelected]);

    // Celebration animation when bottle is complete - quick subtle pulse with sparkle
    useEffect(() => {
        if (isComplete) {
            // Quick subtle glow flash
            celebrationGlow.value = withSequence(
                withTiming(0.7, { duration: 150 }),
                withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) })
            );
            // Slight scale pulse
            scale.value = withSequence(
                withTiming(1.08, { duration: 150 }),
                withSpring(1, { damping: 10 })
            );
            // Quick sparkle burst
            sparkleScale.value = withSequence(
                withTiming(1, { duration: 150 }),
                withDelay(200, withTiming(0, { duration: 300 }))
            );
        }
    }, [isComplete]);

    // Pour animation - tilt bottle when pouring
    useEffect(() => {
        if (isPouringFrom) {
            // Tilt bottle to pour
            rotation.value = withSequence(
                withTiming(-25, { duration: 200, easing: Easing.out(Easing.cubic) }),
                withDelay(300, withTiming(0, { duration: 200, easing: Easing.in(Easing.cubic) }))
            );
            translateY.value = withSequence(
                withTiming(-15, { duration: 200 }),
                withDelay(300, withTiming(0, { duration: 200 }))
            );
        }
    }, [isPouringFrom]);

    // Receive animation - slight bounce when receiving liquid
    useEffect(() => {
        if (isPouringTo) {
            scale.value = withSequence(
                withTiming(1.02, { duration: 150 }),
                withDelay(350, withSpring(1))
            );
        }
    }, [isPouringTo]);

    // Shake animation for invalid moves
    const shake = () => {
        translateX.value = withSequence(
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(0, { duration: 50 })
        );
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { translateX: translateX.value },
            { translateY: translateY.value },
            { rotate: `${rotation.value}deg` },
        ],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    // Celebration glow style
    const celebrationGlowStyle = useAnimatedStyle(() => ({
        opacity: celebrationGlow.value * 0.6,
        transform: [
            { scale: interpolate(celebrationGlow.value, [0.3, 1], [1, 1.15]) }
        ],
    }));

    // Sparkle animation style
    const sparkleStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${sparkleRotation.value}deg` },
            { scale: sparkleScale.value }
        ],
        opacity: sparkleScale.value,
    }));

    // Render layers from bottom to top (index 0 is bottom)
    const layers = [...bottle.layers];

    // Find the top non-null layer index
    let topLayerIndex = -1;
    for (let i = 3; i >= 0; i--) {
        if (layers[i] !== null) {
            topLayerIndex = i;
            break;
        }
    }

    return (
        <AnimatedPressable
            style={[styles.container, animatedStyle]}
            onPress={onPress}
        >
            {/* Celebration glow effect */}
            {isComplete && (
                <Animated.View
                    style={[
                        styles.celebrationGlow,
                        celebrationGlowStyle,
                        { backgroundColor: bottleColor, shadowColor: bottleColor }
                    ]}
                />
            )}

            {/* Small sparkles */}
            {isComplete && (
                <Animated.View style={[styles.sparkleContainer, sparkleStyle]}>
                    {[0, 90, 180, 270].map((angle) => (
                        <View
                            key={angle}
                            style={[
                                styles.sparkle,
                                {
                                    transform: [
                                        { rotate: `${angle}deg` },
                                        { translateY: -50 },
                                    ],
                                    backgroundColor: '#FFFFFF',
                                }
                            ]}
                        />
                    ))}
                </Animated.View>
            )}

            {/* Selection glow effect */}
            <Animated.View style={[styles.glow, glowStyle]} />

            {/* Bottle body */}
            <View style={styles.bottle}>
                {/* Bottle neck */}
                <View style={styles.neck} />

                {/* Liquid container */}
                <View style={styles.liquidContainer}>
                    {/* Render layers from top to bottom visually (reversed) */}
                    {[3, 2, 1, 0].map((index) => (
                        <LiquidLayer
                            key={index}
                            color={layers[index]}
                            index={index}
                            isTop={index === topLayerIndex}
                            isAnimating={isPouringFrom || isPouringTo}
                            animateIn={isPouringTo && pouringLayers?.includes(index)}
                            animateOut={isPouringFrom && pouringLayers?.includes(index)}
                        />
                    ))}
                </View>

                {/* Bottle outline */}
                <View style={styles.bottleOutline} />
            </View>
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 8,
        position: 'relative',
    },
    glow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#FFD700',
        borderRadius: 16,
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 10,
    },
    celebrationGlow: {
        position: 'absolute',
        top: -5,
        left: -5,
        right: -5,
        bottom: -5,
        borderRadius: 20,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 8,
    },
    sparkleContainer: {
        position: 'absolute',
        width: 110,
        height: 110,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sparkle: {
        position: 'absolute',
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    bottle: {
        width: 50,
        alignItems: 'center',
        position: 'relative',
    },
    neck: {
        width: 24,
        height: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        borderWidth: 2,
        borderBottomWidth: 0,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    liquidContainer: {
        width: 46,
        height: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        overflow: 'hidden',
        justifyContent: 'flex-end',
    },
    bottleOutline: {
        position: 'absolute',
        top: 12,
        left: 2,
        right: 2,
        bottom: 0,
        borderWidth: 2,
        borderTopWidth: 0,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },
});

export default Bottle;
