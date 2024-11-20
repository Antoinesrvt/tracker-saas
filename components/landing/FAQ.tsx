import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Plus, Minus } from 'lucide-react';
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

const FAQ = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const faqs = [
    {
      category: "Fondamentaux",
      questions: [
        {
          q: "Comment fonctionne la hiérarchie des objectifs ?",
          a: "Notre système utilise une structure à quatre niveaux : Fondations (base), Actions (tâches quotidiennes), Stratégies (objectifs à moyen terme), et Vision (objectifs à long terme). Chaque niveau s'appuie sur les précédents pour créer une progression cohérente.",
        },
        {
          q: "Puis-je personnaliser les types d'objectifs ?",
          a: "Actuellement, les quatre catégories sont fixes pour maintenir une structure claire, mais vous pouvez personnaliser les étiquettes et les descriptions au sein de chaque catégorie.",
        },
      ],
    },
    {
      category: "Fonctionnalités",
      questions: [
        {
          q: "Comment suivre la progression des objectifs ?",
          a: "Chaque objectif dispose d'indicateurs de progression en temps réel, de métriques détaillées et d'un tableau de bord visuel. Vous pouvez suivre le temps passé, le budget utilisé et les risques identifiés.",
        },
        {
          q: "Les objectifs peuvent-ils être interconnectés ?",
          a: "Oui, vous pouvez créer des connexions visuelles entre les objectifs pour montrer leurs interdépendances et leur impact sur la stratégie globale.",
        },
      ],
    },
    {
      category: "Collaboration",
      questions: [
        {
          q: "Comment gérer les permissions d'équipe ?",
          a: "Vous pouvez assigner différents rôles (administrateur, manager, membre) avec des permissions spécifiques pour chaque niveau d'objectif.",
        },
        {
          q: "Existe-t-il des outils de communication intégrés ?",
          a: "Oui, chaque objectif dispose d'une section de mises à jour, de commentaires et de notifications en temps réel pour faciliter la communication d'équipe.",
        },
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400">
            Questions Fréquentes
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Tout ce que vous devez savoir pour commencer
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-28"
        >
          {faqs.map((category, categoryIndex) => (
            <motion.div key={categoryIndex} variants={itemVariants}>
              <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-xl rounded-xl">
                <h3 className="text-xl font-semibold text-white mb-6">
                  {category.category}
                </h3>
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <div key={faqIndex} className="space-y-2">
                      <button
                        onClick={() =>
                          setOpenIndex(
                            openIndex === categoryIndex * 10 + faqIndex
                              ? null
                              : categoryIndex * 10 + faqIndex
                          )
                        }
                        className="w-full text-left flex items-center justify-between gap-4 group"
                      >
                        <span className="text-white/90 group-hover:text-white transition-colors">
                          {faq.q}
                        </span>
                        {openIndex === categoryIndex * 10 + faqIndex ? (
                          <Minus className="h-4 w-4 text-white/60" />
                        ) : (
                          <Plus className="h-4 w-4 text-white/60" />
                        )}
                      </button>
                      <motion.div
                        initial={false}
                        animate={{
                          height:
                            openIndex === categoryIndex * 10 + faqIndex
                              ? "auto"
                              : 0,
                          opacity:
                            openIndex === categoryIndex * 10 + faqIndex ? 1 : 0,
                        }}
                        className="overflow-hidden"
                      >
                        <p className="text-white/70 text-sm leading-relaxed pt-2">
                          {faq.a}
                        </p>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Support CTA */}
        <motion.div variants={itemVariants} className="text-center space-y-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-white">
              Besoin de plus d'aide ?
            </h3>
            <p className="text-white/70">
              Notre équipe de support est disponible 24/7 pour vous aider
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8"
            >
              Contacter le Support
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/10 hover:bg-white/5 text-white"
            >
              Consulter la Documentation
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
