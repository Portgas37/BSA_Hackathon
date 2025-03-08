"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useAnimation } from "framer-motion"

export function SecondPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)
  const controls = useAnimation()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          controls.start("visible")
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
      },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [controls])

  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] } },
  }

  return (
    <section ref={ref} className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <motion.div initial="hidden" animate={controls} variants={variants} className="text-center px-4">
        <h2 className="text-5xl font-light mb-6">Empowering Privacy</h2>
        <p className="text-xl max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
          Mina Protocol enables a new generation of applications that put privacy and security first.
        </p>
      </motion.div>
    </section>
  )
}

