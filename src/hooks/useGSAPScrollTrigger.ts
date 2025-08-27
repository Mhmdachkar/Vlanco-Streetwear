import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollTriggerOptions {
  trigger?: string | Element;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean;
  snap?: boolean | number[] | object;
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
  onUpdate?: (self: ScrollTrigger) => void;
}

export const useGSAPScrollTrigger = () => {
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const createScrollTrigger = (
    animation: gsap.core.Timeline | gsap.core.Tween,
    options: ScrollTriggerOptions = {}
  ) => {
    const {
      trigger,
      start = 'top 80%',
      end = 'bottom 20%',
      scrub = false,
      pin = false,
      snap = false,
      onEnter,
      onLeave,
      onEnterBack,
      onLeaveBack,
      onUpdate
    } = options;

    scrollTriggerRef.current = ScrollTrigger.create({
      trigger,
      start,
      end,
      scrub,
      pin,
      snap,
      animation,
      onEnter,
      onLeave,
      onEnterBack,
      onLeaveBack,
      onUpdate
    });

    return scrollTriggerRef.current;
  };

  const createTimeline = () => {
    return gsap.timeline();
  };

  const createTween = (target: any, vars: gsap.TweenVars) => {
    return gsap.to(target, vars);
  };

  const refresh = () => {
    ScrollTrigger.refresh();
  };

  const kill = () => {
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.kill();
    }
  };

  useEffect(() => {
    return () => {
      kill();
    };
  }, []);

  return {
    createScrollTrigger,
    createTimeline,
    createTween,
    refresh,
    kill,
    ScrollTrigger
  };
};

// Advanced storytelling hook
export const useStorytellingAnimation = () => {
  const { createScrollTrigger, createTimeline } = useGSAPScrollTrigger();

  const createStorySequence = (
    elements: Array<{
      selector: string;
      animation: gsap.TweenVars;
      trigger?: string;
      start?: string;
      end?: string;
    }>
  ) => {
    const timeline = createTimeline();

    elements.forEach((element, index) => {
      const { selector, animation, trigger, start, end } = element;
      
      const tween = gsap.to(selector, animation);
      
      createScrollTrigger(tween, {
        trigger: trigger || selector,
        start: start || `top ${80 + index * 10}%`,
        end: end || `bottom ${20 - index * 5}%`,
        scrub: 1
      });
    });

    return timeline;
  };

  const createParallaxLayer = (
    selector: string,
    speed: number = 0.5,
    direction: 'up' | 'down' = 'up'
  ) => {
    const y = direction === 'up' ? -100 * speed : 100 * speed;
    
    return createScrollTrigger(
      gsap.to(selector, {
        y: y,
        ease: 'none'
      }),
      {
        trigger: selector,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    );
  };

  const createRevealAnimation = (
    selector: string,
    options: {
      direction?: 'up' | 'down' | 'left' | 'right';
      distance?: number;
      duration?: number;
      stagger?: number;
    } = {}
  ) => {
    const {
      direction = 'up',
      distance = 100,
      duration = 1,
      stagger = 0.1
    } = options;

    const getInitialPosition = () => {
      switch (direction) {
        case 'up': return { y: distance, opacity: 0 };
        case 'down': return { y: -distance, opacity: 0 };
        case 'left': return { x: distance, opacity: 0 };
        case 'right': return { x: -distance, opacity: 0 };
        default: return { y: distance, opacity: 0 };
      }
    };

    const getFinalPosition = () => {
      switch (direction) {
        case 'up': return { y: 0, opacity: 1 };
        case 'down': return { y: 0, opacity: 1 };
        case 'left': return { x: 0, opacity: 1 };
        case 'right': return { x: 0, opacity: 1 };
        default: return { y: 0, opacity: 1 };
      }
    };

    gsap.set(selector, getInitialPosition());

    return createScrollTrigger(
      gsap.to(selector, {
        ...getFinalPosition(),
        duration,
        stagger,
        ease: 'power2.out'
      }),
      {
        trigger: selector,
        start: 'top 80%',
        end: 'bottom 20%'
      }
    );
  };

  return {
    createStorySequence,
    createParallaxLayer,
    createRevealAnimation
  };
};
