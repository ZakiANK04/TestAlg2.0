import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoadingScreen({ onComplete }) {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        // Total animation duration: exactly 3 seconds
        // 1.5s zoom in/out animation (2 cycles)
        // 0.5s fade out
        const timer = setTimeout(() => {
            setIsVisible(false)
            // Wait for fade out animation to complete before calling onComplete
            setTimeout(() => {
                if (onComplete) onComplete()
            }, 500)
        }, 3000) // Exactly 3 seconds

        return () => clearTimeout(timer)
    }, [onComplete])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700 z-[9999] flex items-center justify-center"
                >
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1, 1.2, 1],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: 1,
                            ease: "easeInOut"
                        }}
                        className="flex flex-col items-center justify-center"
                    >
                        <motion.img
                            src="/logo.png"
                            alt="AgroVisor Logo"
                            className="h-24 sm:h-32 md:h-40 w-auto object-contain drop-shadow-2xl"
                            animate={{
                                scale: [1, 1.15, 1, 1.15, 1],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: 1,
                                ease: "easeInOut"
                            }}
                        />
                        <motion.h1
                            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-4 drop-shadow-lg"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            AgroVisor
                        </motion.h1>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

