import React from "react";
import { motion } from "framer-motion";
import { Card } from '@/components/ui/card';
import {
  Target,
  BarChart3,
  Users,
  Zap,
  ArrowRight,
  CheckCircle2,
  Eye,
  Brain,
  Workflow,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const ProcessFlow = () => {
  const steps = [
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Visualisez",
      description:
        "Cartographiez vos objectifs avec notre vue stratégique innovante",
      gradient: "from-purple-500 to-blue-500",
      features: [
        "Vue hiérarchique",
        "Connexions visuelles",
        "Filtres intelligents",
      ],
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Planifiez",
      description: "Développez votre stratégie avec des outils puissants",
      gradient: "from-blue-500 to-green-500",
      features: [
        "Création d'objectifs",
        "Assignation d'équipes",
        "Gestion des ressources",
      ],
    },
    {
      icon: <Workflow className="h-6 w-6" />,
      title: "Exécutez",
      description: "Transformez vos plans en actions concrètes",
      gradient: "from-green-500 to-emerald-500",
      features: [
        "Tableaux Kanban",
        "Suivi en temps réel",
        "Métriques détaillées",
      ],
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Réussissez",
      description: "Atteignez vos objectifs avec une clarté exceptionnelle",
      gradient: "from-emerald-500 to-amber-500",
      features: [
        "Analyses avancées",
        "Rapports de progression",
        "Célébration des succès",
      ],
    },
  ];

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-emerald-500/5 blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(white,transparent_85%)] opacity-10" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20 space-y-4"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400">
            Comment ça fonctionne
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Une approche structurée pour transformer vos ambitions en
            réalisations concrètes
          </p>
        </motion.div>

        {/* Process Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative group"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 right-0 w-full h-[2px] bg-gradient-to-r from-white/10 to-transparent transform translate-x-1/2 -translate-y-1/2 z-0" />
              )}

              <Card
                className="relative bg-white/5 border border-white/10 backdrop-blur-sm
                hover:border-white/20 transition-all duration-500 overflow-hidden"
              >
                <div className="p-6 space-y-6">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`p-3 rounded-xl bg-gradient-to-br ${step.gradient} bg-opacity-10 w-fit
                      shadow-lg`}
                  >
                    <div className="text-white">{step.icon}</div>
                  </motion.div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="text-white/70">{step.description}</p>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3">
                    {step.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-2 text-white/60"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Step Number */}
                <div className="absolute top-4 right-4 text-4xl font-bold text-white/10">
                  {index + 1}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessFlow;
