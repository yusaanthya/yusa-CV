"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";

interface ScrollLagProps {
    children: React.ReactNode;
    // Higher layers trail further behind the scroll, like Mediatonic's data-layer.
    layer?: number;
    className?: string;
}

const MAX_SHIFT_PX = 18;

export function ScrollLag({ children, layer = 1, className }: ScrollLagProps) {
    const shouldReduce = useReducedMotion();
    const { scrollY } = useScroll();
    const velocity = useVelocity(scrollY);
    // Scroll velocity, not position, drives the offset: content trails while the page
    // moves and springs back once it stops. Damping ratio ≈ 0.72 gives one soft bounce.
    const target = useTransform(velocity, [-2500, 0, 2500], [-MAX_SHIFT_PX * layer, 0, MAX_SHIFT_PX * layer]);
    const y = useSpring(target, { stiffness: 260, damping: 18, mass: 0.6 });

    if (shouldReduce) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div style={{ y }} className={className}>
            {children}
        </motion.div>
    );
}
