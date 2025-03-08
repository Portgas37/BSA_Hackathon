"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useAnimation } from "framer-motion"
import { ChevronDown } from "lucide-react"

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
        threshold: 0.1,
      }
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 }
    })
  }

  const petitions = [
    {
      title: "Environmental Protection Act",
      supporters: "1,234",
      description: "Support legislation for reducing carbon emissions and protecting wildlife.",
      status: "Active"
    },
    {
      title: "Digital Privacy Rights",
      supporters: "2,156",
      description: "Advocate for stronger digital privacy laws and data protection.",
      status: "Active"
    },
    {
      title: "Education Reform",
      supporters: "987",
      description: "Promote equal access to quality education and modern learning resources.",
      status: "Active"
    }
  ]

  return (
    <section 
      ref={ref} 
      className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center py-20 w-full"
    >
      <motion.div 
        initial="hidden" 
        animate={controls} 
        variants={variants} 
        className="container mx-auto px-4 max-w-6xl"
      >
        {/* Petitions Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-light mb-6">Active Petitions</h2>
          <p className="text-xl max-w-2xl mx-auto text-gray-600 dark:text-gray-300 mb-12">
            Join our community in making a difference. Sign petitions anonymously using zero-knowledge proofs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {petitions.map((petition, i) => (
            <motion.div
              key={petition.title}
              custom={i}
              variants={cardVariants}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-cyan-500/20 hover:border-cyan-500/50 transition-all"
            >
              <h3 className="text-xl font-medium mb-2 text-cyan-500">{petition.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{petition.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {petition.supporters} supporters
                </span>
                <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">
                  Sign Petition
                </button>
              </div>
              <div className="mt-4 flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                <span className="text-sm text-gray-500">{petition.status}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="mt-16 flex justify-center">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronDown size={32} className="text-cyan-500/50" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}