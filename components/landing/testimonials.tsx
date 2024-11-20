import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import React from 'react'
// Add these new animation variants
const testimonialContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
      duration: 0.8,
    }
  }
};

const testimonialCardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};



function testimonials() {
  return (
    <div className="relative py-24 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-green-500/10 blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(white,transparent_85%)] opacity-10" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-green-400">
            Histoires de Réussite
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Découvrez comment nos utilisateurs transforment leurs objectifs en
            succès mesurables
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={testimonialContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {[
            {
              name: "Marie Laurent",
              role: "Directrice Marketing",
              company: "TechVision",
              image: "/testimonials/marie.jpg", // Add actual image path
              quote:
                "Cette plateforme a révolutionné notre approche des objectifs d'équipe. +150% de productivité en 3 mois.",
              gradient: "from-purple-500 to-blue-500",
              metric: "+150%",
              metricLabel: "Productivité",
            },
            {
              name: "Thomas Dubois",
              role: "Entrepreneur",
              company: "StartupFlow",
              image: "/testimonials/thomas.jpg", // Add actual image path
              quote:
                "La visualisation claire des objectifs nous a permis d'atteindre nos KPIs deux fois plus rapidement.",
              gradient: "from-blue-500 to-green-500",
              metric: "2x",
              metricLabel: "Plus Rapide",
            },
            {
              name: "Sophie Martin",
              role: "Chef de Projet",
              company: "InnovaCorp",
              image: "/testimonials/sophie.jpg", // Add actual image path
              quote:
                "Un outil indispensable qui a transformé notre gestion de projet et augmenté notre ROI de 200%.",
              gradient: "from-green-500 to-emerald-500",
              metric: "+200%",
              metricLabel: "ROI",
            },
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              variants={testimonialCardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="relative group"
            >
              <Card
                className="p-6 bg-white/5 border border-white/10 backdrop-blur-xl
            hover:border-white/20 transition-all duration-500 rounded-xl
            shadow-lg hover:shadow-xl overflow-hidden"
              >
                {/* Gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                <div className="relative space-y-6">
                  {/* Quote */}
                  <p className="text-lg text-white/80 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>

                  {/* Metric Highlight */}
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${testimonial.gradient} bg-opacity-10`}
                  >
                    <span className="text-2xl font-bold text-white">
                      {testimonial.metric}
                    </span>
                    <span className="text-sm text-white/70">
                      {testimonial.metricLabel}
                    </span>
                  </div>

                  {/* Author Info */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12">
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${testimonial.gradient} rounded-full blur-sm opacity-50`}
                      />
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="relative w-12 h-12 rounded-full object-cover border-2 border-white/20"
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-white/60">
                        {testimonial.role} · {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mt-16"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-purple-500/20"
          >
            Rejoignez Nos Success Stories
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

export default testimonials