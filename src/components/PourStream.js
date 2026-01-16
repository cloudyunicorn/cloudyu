// PourStream Component - Simple animated liquid drops flowing between bottles
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withDelay,
    Easing,
} from 'react-native-reanimated';
import { COLORS } from '../store/gameStore';

// Single animated drop
const LiquidDrop = ({ startX, startY, endX, endY, color, delay, size = 12 }) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        // Reset
        translateX.value = 0;
        translateY.value = 0;
        scale.value = 0;
        opacity.value = 0;

        // Animate drop along curved path
        opacity.value = withDelay(delay, withSequence(
            withTiming(1, { duration: 80 }),
            withDelay(200, withTiming(0, { duration: 120 }))
        ));

        scale.value = withDelay(delay, withSequence(
            withTiming(1.2, { duration: 100 }),
            withTiming(0.8, { duration: 200 }),
            withTiming(0, { duration: 100 })
        ));

        // Horizontal movement
        translateX.value = withDelay(delay,
            withTiming(endX - startX, {
                duration: 350,
                easing: Easing.out(Easing.quad)
            })
        );

        // Vertical movement with arc
        translateY.value = withDelay(delay, withSequence(
            withTiming(-50, { duration: 120, easing: Easing.out(Easing.quad) }),
            withTiming(endY - startY + 50, { duration: 230, easing: Easing.in(Easing.quad) })
        ));
    }, [startX, startY, endX, endY, delay]);

    const dropStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.drop,
                {
                    backgroundColor: color,
                    left: startX - size / 2,
                    top: startY - size / 2,
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                },
                dropStyle
            ]}
        />
    );
};

const PourStream = ({
    fromPosition,
    toPosition,
    color,
    isActive,
}) => {
    const colorHex = COLORS[color] || color || '#4ECDC4';

    if (!isActive || !fromPosition || !toPosition) {
        return null;
    }

    const startX = fromPosition.x;
    const startY = fromPosition.y;
    const endX = toPosition.x;
    const endY = toPosition.y;

    // Create multiple drops with staggered delays
    const drops = [
        { delay: 0, size: 14 },
        { delay: 50, size: 12 },
        { delay: 100, size: 10 },
        { delay: 150, size: 12 },
        { delay: 200, size: 8 },
        { delay: 250, size: 10 },
    ];

    return (
        <View style={styles.container} pointerEvents="none">
            {drops.map((drop, index) => (
                <LiquidDrop
                    key={index}
                    startX={startX}
                    startY={startY}
                    endX={endX}
                    endY={endY}
                    color={colorHex}
                    delay={drop.delay}
                    size={drop.size}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 999,
        elevation: 999,
    },
    drop: {
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 10,
    },
});

export default PourStream;
