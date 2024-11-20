import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Mail, Building2 } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
};

const PricingPlans = () => {
  const plans = [
    {
      name: "Starter",
      price: "Gratuit",
      period: "pour toujours",
      description: "Pour commencer avec la gestion d'objectifs",
      features: [
        "1 projet actif",
        "Visualisation basique",
        "Suivi des objectifs",
        "Tableau de bord personnel",
        "Support communautaire"
      ],
      gradient: "from-purple-500/10 to-blue-500/10",
      buttonGradient: "from-purple-500 to-blue-500",
      recommended: false
    },
    {
      name: "Free-lance",
      price: "19€",
      period: "par mois",
      description: "Pour les professionnels indépendants",
      features: [
        "3 projets actifs",
        "Visualisation avancée",
        "Gestion des risques",
        "Analyses basiques",
        "Support prioritaire",
        "Exports PDF",
        "Intégration Calendar"
      ],
      gradient: "from-blue-500/10 to-emerald-500/10",
      buttonGradient: "from-blue-500 to-emerald-500",
      recommended: true
    },
    {
      name: "Équipe",
      price: "49€",
      period: "par mois",
      description: "Pour les petites équipes jusqu'à 10 personnes",
      features: [
        "Projets illimités",
        "10 membres d'équipe",
        "Visualisation complète",
        "Gestion des risques avancée",
        "Analyses détaillées",
        "Support prioritaire 24/7",
        "Toutes les intégrations",
        "Exports personnalisés"
      ],
      gradient: "from-emerald-500/10 to-amber-500/10",
      buttonGradient: "from-emerald-500 to-amber-500",
      recommended: false
    }
  ];

  return (
    <section className="relative py-32 overflow-hidden">
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
            Plans & Tarification
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Choisissez le plan qui correspond à vos besoins
          </p>
        </motion.div>

        <div className="space-y-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative group"
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 text-white text-sm font-medium">
                      Recommandé
                    </span>
                  </div>
                )}

                <Card className={`p-8 bg-purple-950 bg-gradient-to-br ${plan.gradient} border-white/10 backdrop-blur-xl
                  hover:border-white/20 transition-all duration-500 rounded-xl
                  ${plan.recommended ? 'scale-105' : ''}`}>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                      <p className="text-white/60">{plan.description}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-white">{plan.price}</div>
                      <div className="text-sm text-white/60">{plan.period}</div>
                    </div>

                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-white/80">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full bg-gradient-to-r ${plan.buttonGradient} hover:opacity-90 text-white`}
                    >
                      Commencer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Card className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 border-white/10 backdrop-blur-xl hover:border-white/20 transition-all duration-500 rounded-xl">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="space-y-6 flex-1">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-8 w-8 text-white/80" />
                      <h3 className="text-2xl font-bold text-white">Enterprise</h3>
                    </div>
                    <p className="text-white/60 max-w-xl">
                      Solution sur mesure pour les moyennes et grandes entreprises avec un accompagnement personnalisé
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Check className="h-5 w-5 text-emerald-400" />
                      <span className="text-white/80 block">Déploiement personnalisé</span>
                    </div>
                    <div className="space-y-2">
                      <Check className="h-5 w-5 text-emerald-400" />
                      <span className="text-white/80 block">Membres illimités</span>
                    </div>
                    <div className="space-y-2">
                      <Check className="h-5 w-5 text-emerald-400" />
                      <span className="text-white/80 block">Support dédié</span>
                    </div>
                    <div className="space-y-2">
                      <Check className="h-5 w-5 text-emerald-400" />
                      <span className="text-white/80 block">Formation sur mesure</span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <Button
                    size="lg"
                    className="bg-white hover:bg-white/90 text-slate-900"
                  >
                    Contactez-nous
                    <Mail className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;