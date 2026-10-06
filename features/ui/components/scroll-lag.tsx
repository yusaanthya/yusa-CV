"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";

interface ScrollLagProps {
    children: React.ReactNode;
    // Higher layers trail further behind the scroll, like Mediatonic's data-layer.
    layer?: number;
    className?: string;
}

const MAX_SHIFT_PX = 18;

// Apple's spring model (WWDC "Designing Fluid Interfaces"): pick a response in seconds and a
// damping ratio, then convert to framer-motion's physics. Damping 1.0 is critically damped:
// no overshoot, which suits motion the visitor is not directly flicking. Mediatonic's scroll
// lag uses the same non-bouncing exponential easing.
const RESPONSE_S = 0.45;
const DAMPING_RATIO = 1;
const MASS = 1;
function appleSpring(responseS: number, dampingRatio = DAMPING_RATIO) {
    return {
        mass: MASS,
        stiffness: Math.pow((2 * Math.PI) / responseS, 2) * MASS,
        damping: (4 * Math.PI * dampingRatio * MASS) / responseS,
    };
}

// Wheel input arrives in discrete steps, so raw velocity sawtooths between ticks. A short
// critically damped pass averages it first, like Mediatonic's scroll-delta history buffer.
const INPUT_SMOOTHING = appleSpring(0.3);
const OUTPUT_SPRING = appleSpring(RESPONSE_S);

export function ScrollLag({ children, layer = 1, className }: ScrollLagProps) {
    const shouldReduce = useReducedMotion();
    const { scrollY } = useScroll();
    const velocity = useSpring(useVelocity(scrollY), INPUT_SMOOTHING);
    // Scroll velocity, not position, drives the offset: content trails while the page
    // moves and eases back once it stops.
    const target = useTransform(velocity, [-2500, 0, 2500], [-MAX_SHIFT_PX * layer, 0, MAX_SHIFT_PX * layer]);
    const y = useSpring(target, OUTPUT_SPRING);

    if (shouldReduce) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div style={{ y }} className={className}>
            {children}
        </motion.div>
    );
}
