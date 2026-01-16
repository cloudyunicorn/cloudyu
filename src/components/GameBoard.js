// GameBoard Component - Main game area with bottles grid and pour stream animation
import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Bottle from './Bottle';
import PourStream from './PourStream';
import useGameStore from '../store/gameStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GameBoard = ({ onPourResult }) => {
    const bottles = useGameStore(state => state.bottles);
    const selectedBottle = useGameStore(state => state.selectedBottle);
    const selectBottle = useGameStore(state => state.selectBottle);

    // Animation state
    const [pouringFrom, setPouringFrom] = useState(null);
    const [pouringTo, setPouringTo] = useState(null);
    const [pouringLayers, setPouringLayers] = useState({});
    const [pourColor, setPourColor] = useState(null);
    const [streamActive, setStreamActive] = useState(false);
    const [streamPositions, setStreamPositions] = useState({ from: null, to: null });
    const animationTimeoutRef = useRef(null);

    // Track bottle refs for position measurement
    const bottleRefs = useRef({});
    const containerRef = useRef(null);

    const measureBottlePosition = useCallback((bottleId) => {
        return new Promise((resolve) => {
            const bottleRef = bottleRefs.current[bottleId];
            if (bottleRef && containerRef.current) {
                bottleRef.measureLayout(
                    containerRef.current,
                    (x, y, width, height) => {
                        resolve({ x: x + width / 2, y: y });
                    },
                    () => resolve(null)
                );
            } else {
                resolve(null);
            }
        });
    }, []);

    const handleBottlePress = useCallback(async (bottleId) => {
        // Prevent interaction during pour animation
        if (pouringFrom || pouringTo) return;

        const result = selectBottle(bottleId);

        if (result.action === 'poured') {
            // Measure bottle positions
            const [fromPos, toPos] = await Promise.all([
                measureBottlePosition(result.from),
                measureBottlePosition(result.to),
            ]);

            // Calculate which layers are being animated
            const fromBottle = bottles.find(b => b.id === result.from);
            const toBottle = bottles.find(b => b.id === result.to);

            const fromLayers = [];
            if (fromBottle) {
                let found = 0;
                for (let i = 3; i >= 0 && found < result.count; i--) {
                    if (fromBottle.layers[i] === result.color) {
                        fromLayers.push(i);
                        found++;
                    }
                }
            }

            const toLayers = [];
            if (toBottle) {
                let filled = 0;
                for (let i = 0; i < 4 && filled < result.count; i++) {
                    if (toBottle.layers[i] === null) {
                        toLayers.push(i);
                        filled++;
                    }
                }
            }

            // Set animation state
            setPouringFrom(result.from);
            setPouringTo(result.to);
            setPourColor(result.color);
            setPouringLayers({
                [result.from]: fromLayers,
                [result.to]: toLayers,
            });

            // Activate stream animation with measured positions
            if (fromPos && toPos) {
                setStreamPositions({ from: fromPos, to: toPos });
                setStreamActive(true);
            }

            // Notify parent about pour result
            onPourResult?.(result);

            // Clear animation state after animation completes
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
            animationTimeoutRef.current = setTimeout(() => {
                setPouringFrom(null);
                setPouringTo(null);
                setPouringLayers({});
                setPourColor(null);
                setStreamActive(false);
                setStreamPositions({ from: null, to: null });

                if (result.isWon) {
                    onPourResult?.({ action: 'win' });
                }
            }, 500);
        } else if (result.action === 'invalid') {
            onPourResult?.({ action: 'error' });
        } else if (result.action === 'selected') {
            onPourResult?.({ action: 'select' });
        }
    }, [selectBottle, onPourResult, bottles, pouringFrom, pouringTo, measureBottlePosition]);

    // Calculate bottle layout
    const bottlesPerRow = bottles.length <= 4 ? bottles.length : Math.ceil(bottles.length / 2);

    // Split bottles into rows
    const rows = [];
    for (let i = 0; i < bottles.length; i += bottlesPerRow) {
        rows.push(bottles.slice(i, i + bottlesPerRow));
    }

    return (
        <View style={styles.container} ref={containerRef} collapsable={false}>
            {/* Pour Stream Animation */}
            <PourStream
                fromPosition={streamPositions.from}
                toPosition={streamPositions.to}
                color={pourColor}
                isActive={streamActive}
            />

            {rows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                    {row.map((bottle) => (
                        <View
                            key={bottle.id}
                            ref={(ref) => { bottleRefs.current[bottle.id] = ref; }}
                            collapsable={false}
                        >
                            <Bottle
                                bottle={bottle}
                                isSelected={selectedBottle === bottle.id}
                                isPouringFrom={pouringFrom === bottle.id}
                                isPouringTo={pouringTo === bottle.id}
                                pourColor={pourColor}
                                pouringLayers={pouringLayers[bottle.id] || []}
                                onPress={() => handleBottlePress(bottle.id)}
                            />
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginVertical: 15,
        gap: 10,
    },
});

export default GameBoard;
