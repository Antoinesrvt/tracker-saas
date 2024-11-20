import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Check, X, Minus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const CompareFeatures = () => {
  const competitors = [
    {
      name: "Notre Solution",
      highlight: true,
      price: "Gratuit",
      features: {
        "Visualisation Stratégique": true,
        "Connexions Visuelles": true,
        "Gestion des Risques": true,
        "Suivi en Temps Réel": true,
        "Support 24/7": true,
        "Intégration API": true,
        "Analyses Avancées": true,
        "Multi-équipes": "limited",
      },
    },
    {
      name: "Huly",
      price: "€15/mois",
      features: {
        "Visualisation Stratégique": true,
        "Connexions Visuelles": true,
        "Gestion des Risques": true,
        "Suivi en Temps Réel": true,
        "Support 24/7": false,
        "Intégration API": true,
        "Analyses Avancées": true,
        "Multi-équipes": true,
      },
    },
    {
      name: "Asana Goals",
      price: "€20/mois",
      features: {
        "Visualisation Stratégique": "limited",
        "Connexions Visuelles": false,
        "Gestion des Risques": true,
        "Suivi en Temps Réel": true,
        "Support 24/7": false,
        "Intégration API": true,
        "Analyses Avancées": true,
        "Multi-équipes": true,
      },
    },
  ];

  const renderFeatureIcon = (value: boolean | string) => {
    if (value === true) return <Check className="h-5 w-5 text-emerald-400" />;
    if (value === false) return <X className="h-5 w-5 text-red-400/70" />;
    return <Minus className="h-5 w-5 text-blue-400" />;
  };

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-emerald-500/5 blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(white,transparent_85%)] opacity-10" />
      </div>

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400">
            Comparaison des Fonctionnalités
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Découvrez pourquoi notre solution se démarque de la concurrence
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {competitors.map((competitor, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative group"
            >
              <Card
                className={`p-8 ${
                  competitor.highlight
                    ? "bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-emerald-500/10"
                    : "bg-white/5"
                } border-white/10 backdrop-blur-xl rounded-xl
                hover:border-white/20 transition-all duration-500`}
              >
                {competitor.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium">
                      Recommandé
                    </span>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {competitor.name}
                    </h3>
                    <p className="text-white/60">{competitor.price}</p>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(competitor.features).map(
                      ([feature, value], featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-center justify-between"
                        >
                          <span className="text-white/70">{feature}</span>
                          {renderFeatureIcon(value)}
                        </div>
                      )
                    )}
                  </div>

                  {competitor.highlight && (
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
                      Commencer Maintenant
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CompareFeatures;
