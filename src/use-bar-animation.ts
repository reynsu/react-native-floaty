import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, AccessibilityInfo } from 'react-native';

const OPEN_MS = 180;
const CLOSE_MS = 140;
const OFFSCREEN = 80;

export function useBarAnimation(open: boolean, position: 'bottom' | 'top' = 'bottom') {
  const [mounted, setMounted] = useState(open);
  const [reduceMotion, setReduceMotion] = useState(false);

  const initialY = position === 'bottom' ? OFFSCREEN : -OFFSCREEN;
  const translateY = useRef(new Animated.Value(open ? 0 : initialY)).current;
  const opacity = useRef(new Animated.Value(open ? 1 : 0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    let cancelled = false;
    const promise = AccessibilityInfo.isReduceMotionEnabled?.();
    if (promise && typeof promise.then === 'function') {
      promise.then((value) => {
        if (!cancelled) setReduceMotion(value);
      });
    }
    const sub = AccessibilityInfo.addEventListener?.(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => {
      cancelled = true;
      sub?.remove?.();
    };
  }, []);

  useEffect(() => {
    animationRef.current?.stop();

    if (open) {
      setMounted(true);
      if (reduceMotion) {
        translateY.setValue(0);
        opacity.setValue(1);
        return;
      }
      animationRef.current = Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: OPEN_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: OPEN_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);
      animationRef.current.start();
      return;
    }

    if (reduceMotion) {
      opacity.setValue(0);
      setMounted(false);
      return;
    }

    animationRef.current = Animated.parallel([
      Animated.timing(translateY, {
        toValue: initialY,
        duration: CLOSE_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: CLOSE_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    animationRef.current.start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [open, reduceMotion, translateY, opacity, initialY]);

  return { mounted, translateY, opacity };
}
