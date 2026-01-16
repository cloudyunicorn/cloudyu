// LiquidLayer Component - Renders a single liquid layer with pour animation
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    Easing,
} from 'react-native-reanimated';
import { COLORS } from '../store/gameStore';

const LAYER_HEIGHT = 20;

const LiquidLayer = ({
    color,
    index,
    isTop,
    isAnimating,
    animateIn,  // true when this layer is being filled
    animateOut, // true when this layer is being emptied
}) => {
    const height = useSharedValue(color ? LAYER_HEIGHT : 0);
    const opacity = useSharedValue(color ? 1 : 0);

    useEffect(() => {
        if (animateIn && color) {
            // Animate liquid filling in
            height.value = 0;
            opacity.value = 0;
            height.value = withTiming(LAYER_HEIGHT, {
                duration: 300,
                easing: Easing.out(Easing.cubic),
            });
            opacity.value = withTiming(1, { duration: 200 });
        } else if (animateOut) {
            // Animate liquid draining out
            height.value = withTiming(0, {
                duration: 300,
                easing: Easing.in(Easing.cubic),
            });
            opacity.value = withTiming(0, { duration: 250 });
        } else if (color) {
            // Normal state with color
            height.value = withTiming(LAYER_HEIGHT, { duration: 150 });
            opacity.value = withTiming(1, { duration: 150 });
        } else {
            // Empty state
            height.value = withTiming(0, { duration: 150 });
            opacity.value = withTiming(0, { duration: 150 });
        }
    }, [color, animateIn, animateOut]);

    const backgroundColor = COLORS[color] || color || 'transparent';

    const animatedStyle = useAnimatedStyle(() => ({
        height: height.value,
        opacity: opacity.value,
    }));

    if (!color && !animateOut) {
        return <View style={styles.emptyLayer} />;
    }

    return (
        <Animated.View
            style={[
                styles.layer,
                { backgroundColor },
                isTop && styles.topLayer,
                animatedStyle,
            ]}
        >
            {/* Wave effect overlay */}
            <View style={[styles.waveOverlay, { opacity: isAnimating ? 0.6 : 0.3 }]} />
            {/* Shine effect */}
            <View style={styles.shine} />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    layer: {
        width: '100%',
        minHeight: 0,
        position: 'relative',
        overflow: 'hidden',
    },
    emptyLayer: {
        width: '100%',
        height: LAYER_HEIGHT,
        backgroundColor: 'transparent',
    },
    topLayer: {
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
    },
    waveOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    shine: {
        position: 'absolute',
        left: 4,
        top: 2,
        bottom: 2,
        width: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 1,
    },
});

export default LiquidLayer;
