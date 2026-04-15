"use client";

import { motion, useReducedMotion } from "framer-motion";

interface AnimateInProps {
    children: React.ReactNode;
    variant?: "fade-up" | "fade-in";
    delay?: number;
    className?: string;
}

const variants = {
    "fade-up": {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    },
    "fade-in": {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    },
};

export function AnimateIn({
    children,
    variant = "fade-up",
    delay = 0,
    className,
}: AnimateInProps) {
    const shouldReduce = useReducedMotion();

    if (shouldReduce) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            variants={variants[variant]}
        >
            {children}
        </motion.div>
    );
}
