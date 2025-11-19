import React, { useRef, useState } from 'react';
import {
  View,
  Image,
  PanResponder,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ZoomableImage({ uri }) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const lastTap = useRef(null);
  const [isZoomed, setIsZoomed] = useState(false);

  let baseScale = 1;
  let pinchScale = 1;
  let lastDistance = 0;
  let basePanX = 0;
  let basePanY = 0;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt) => {
        // 두 손가락 터치 시작
        if (evt.nativeEvent.touches.length === 2) {
          const touch1 = evt.nativeEvent.touches[0];
          const touch2 = evt.nativeEvent.touches[1];
          lastDistance = getDistance(touch1, touch2);
        }
      },

      onPanResponderMove: (evt, gestureState) => {
        if (evt.nativeEvent.touches.length === 2) {
          // 핀치 줌
          const touch1 = evt.nativeEvent.touches[0];
          const touch2 = evt.nativeEvent.touches[1];
          const distance = getDistance(touch1, touch2);

          if (lastDistance !== 0) {
            const scaleChange = distance / lastDistance;
            pinchScale = baseScale * scaleChange;
            pinchScale = Math.max(1, Math.min(pinchScale, 4)); // 최소 1배, 최대 4배

            scale.setValue(pinchScale);

            if (pinchScale > 1) {
              setIsZoomed(true);
            }
          }
        } else if (isZoomed && evt.nativeEvent.touches.length === 1) {
          // 줌된 상태에서 드래그로 이동
          const maxTranslate = (SCREEN_WIDTH * (pinchScale - 1)) / 2;
          const newX = basePanX + gestureState.dx;
          const newY = basePanY + gestureState.dy;

          translateX.setValue(Math.max(-maxTranslate, Math.min(maxTranslate, newX)));
          translateY.setValue(Math.max(-maxTranslate, Math.min(maxTranslate, newY)));
        }
      },

      onPanResponderRelease: (evt, gestureState) => {
        baseScale = pinchScale;
        basePanX = basePanX + gestureState.dx;
        basePanY = basePanY + gestureState.dy;

        // 최소 스케일보다 작으면 원래대로
        if (baseScale < 1.1) {
          resetZoom();
        }

        lastDistance = 0;
      },
    })
  ).current;

  const getDistance = (touch1, touch2) => {
    const dx = touch1.pageX - touch2.pageX;
    const dy = touch1.pageY - touch2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (lastTap.current && now - lastTap.current < DOUBLE_TAP_DELAY) {
      // 더블 탭 감지
      if (isZoomed) {
        resetZoom();
      } else {
        // 2배 확대
        Animated.spring(scale, {
          toValue: 2,
          useNativeDriver: true,
        }).start();
        baseScale = 2;
        pinchScale = 2;
        setIsZoomed(true);
      }
      lastTap.current = null;
    } else {
      lastTap.current = now;
    }
  };

  const resetZoom = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();

    baseScale = 1;
    pinchScale = 1;
    basePanX = 0;
    basePanY = 0;
    setIsZoomed(false);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableWithoutFeedback onPress={handleDoubleTap}>
        <Animated.View
          {...panResponder.panHandlers}
          style={{
            transform: [
              { scale },
              { translateX },
              { translateY },
            ],
          }}
        >
          <Image
            source={{ uri }}
            style={{
              width: SCREEN_WIDTH,
              height: SCREEN_HEIGHT,
            }}
            resizeMode="contain"
          />
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
}
