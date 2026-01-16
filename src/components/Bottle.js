// Bottle Component - Main bottle with liquid layers and pour animations
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    withDelay,
    Easing,
} from 'react-native-reanimated';
import LiquidLayer from './LiquidLayer';

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
            {/* Glow effect */}
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
