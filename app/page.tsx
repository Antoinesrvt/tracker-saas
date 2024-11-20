'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Target,
  Zap,
  Shield,
  Users,
  BarChart3,
  ArrowDown,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ProcessFlow from '@/components/landing/ProcessFlow';
import PricingPlans from '@/components/landing/PricingPlan';

import ContactSection from '@/components/landing/ContactSection';
import FAQ from '@/components/landing/FAQ';
import { useRouter } from 'next/navigation';

const LandingPage = () => {
  const router = useRouter();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.52, 1, 0.36, 1] // Custom cubic bezier for smooth deceleration
      }
    }
  };

  const handleScroll = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  const featureContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const featureCardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section with enhanced gradients */}
      <div className="relative overflow-hidden h-screen flex flex-col justify-between">
        {/* Animated background gradients */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-green-500/20 blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-blue-500/10 to-green-500/10 blur-3xl animate-[pulse_10s_ease-in-out_infinite_1s]" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(white,transparent_85%)] opacity-20" />
        </div>

        <div className="container mx-auto px-4 flex flex-col min-h-screen justify-between py-12 relative">
          {/* Top badge */}
          <motion.div variants={itemVariants} className="text-center pt-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative inline-block"
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-green-500/20 border border-white/20 text-white text-sm backdrop-blur-sm inline-flex items-center gap-2 shadow-lg shadow-purple-500/20"
              >
                <Sparkles className="h-4 w-4 text-purple-300" />
                Découvrez la nouvelle façon de gérer vos objectifs
                <Sparkles className="h-4 w-4 text-green-300" />
              </motion.span>
              <motion.div
                className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-purple-500/50 via-blue-500/50 to-green-500/50 blur-md -z-10"
                animate={{
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
          </motion.div>

          {/* Center content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-5xl mx-auto text-center space-y-12 my-auto"
          >
            <motion.div
              variants={itemVariants}
              className="space-y-8"
              custom={1}
            >
              <motion.h1
                className="text-6xl md:text-7xl font-bold leading-tight"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 1,
                  delay: 0.8,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                  Visualisez
                </span>{' '}
                <span className="text-white">et</span>{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
                  Réalisez
                </span>
              </motion.h1>

              <motion.p
                className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 1,
                  delay: 1.2,
                  ease: 'easeOut'
                }}
              >
                Une plateforme révolutionnaire qui transforme vos ambitions en
                succès mesurables, avec une clarté visuelle exceptionnelle.
              </motion.p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
              custom={2}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-purple-500/20 w-full sm:w-auto transition-all duration-300"
                  onClick={() => {
                    router.push('/dashboard');
                  }}
                >
                  Démarrer Gratuitement
                  <motion.div
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </motion.div>
                </Button>
              </motion.div>

              <Button
                size="lg"
                variant="outline"
                className="border-purple-400/20 bg-purple-500/10 text-white hover:bg-purple-500/20 px-8 py-6 text-lg rounded-xl backdrop-blur-sm w-full sm:w-auto"
              >
                Voir la Démo
              </Button>
            </motion.div>
          </motion.div>

          {/* Bottom scroll button */}
          <motion.button
            variants={itemVariants}
            whileHover={{ y: 5 }}
            className="flex flex-col items-center text-white/80 hover:text-white transition-colors gap-3 pb-8 mx-auto group"
            onClick={handleScroll}
          >
            <span className="text-sm font-medium tracking-wider uppercase">
              Découvrir plus
            </span>
            <motion.div
              className="relative"
              animate={{
                y: [0, 8, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <ArrowDown className="h-5 w-5" />
              <motion.div
                className="absolute inset-0 blur-sm bg-white/30"
                animate={{
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Features Section with enhanced cards */}
      <div className="relative overflow-hidden">
        {/* Enhanced background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-green-500/5 blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(white,transparent_85%)] opacity-10" />
        </div>

        <div className="container mx-auto px-4 py-32 relative">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16 space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-green-400">
              Fonctionnalités Principales
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Des outils puissants pour transformer vos objectifs en
              réalisations concrètes
            </p>
          </motion.div>

          <motion.div
            variants={featureContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <Target className="h-10 w-10" />,
                title: 'Visualisation Stratégique',
                description:
                  'Cartographiez vos objectifs avec une clarté cristalline.',
                gradient: 'from-purple-500 to-blue-500',
                shadowColor: 'purple'
              },
              {
                icon: <Zap className="h-10 w-10" />,
                title: 'Suivi en Temps Réel',
                description: 'Adaptez votre stratégie instantanément.',
                gradient: 'from-blue-500 to-green-500',
                shadowColor: 'blue'
              },
              {
                icon: <Shield className="h-10 w-10" />,
                title: 'Sécurité Intégrée',
                description: 'Protection maximale de vos données.',
                gradient: 'from-green-500 to-emerald-500',
                shadowColor: 'green'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={featureCardVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="relative group"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500`}
                />

                <Card
                  className="relative p-8 bg-white/5 border border-white/10 backdrop-blur-xl
                  hover:border-white/20 transition-all duration-500 rounded-xl
                  shadow-lg hover:shadow-xl overflow-hidden"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative space-y-6">
                    {/* Icon container with gradient background */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                      className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} bg-opacity-10 w-fit
                        shadow-lg shadow-${feature.shadowColor}-500/20`}
                    >
                      <div className="text-white">{feature.icon}</div>
                    </motion.div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-2xl font-semibold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-white/70 text-lg leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    {/* Subtle arrow indicator */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute bottom-4 right-4 text-white/50 group-hover:text-white"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
      {/* <Testimonials /> */}
      <ProcessFlow />
      <PricingPlans />
      {/* <CompareFeatures/> */}
      {/* Stats Section with enhanced design */}

      <div className="relative border-y border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-emerald-500/5 blur-2xl" />
        <div className="container mx-auto px-4 py-24 relative">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              {
                icon: <Users className="h-6 w-6" />,
                value: '10K+',
                label: 'Utilisateurs Actifs',
                gradient: 'from-purple-500/10 to-blue-500/10'
              },
              {
                icon: <Target className="h-6 w-6" />,
                value: '50K+',
                label: 'Objectifs Atteints',
                gradient: 'from-blue-500/10 to-emerald-500/10'
              },
              {
                icon: <BarChart3 className="h-6 w-6" />,
                value: '98%',
                label: 'Satisfaction Client',
                gradient: 'from-emerald-500/10 to-amber-500/10'
              },
              {
                icon: <Zap className="h-6 w-6" />,
                value: '24/7',
                label: 'Support Disponible',
                gradient: 'from-amber-500/10 to-purple-500/10'
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative group"
              >
                <Card
                  className={`p-8 bg-gradient-to-br ${stat.gradient} border-white/10 backdrop-blur-xl
                  hover:border-white/20 transition-all duration-300 rounded-xl
                  shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30`}
                >
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-white/5 w-fit group-hover:scale-110 transition-transform duration-300">
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-sm text-white/60">{stat.label}</div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
      <ContactSection />

      <FAQ />

      {/* CTA Section with enhanced design */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-emerald-500/10 blur-3xl" />
        <div className="container mx-auto px-4 py-32 relative">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Card className="p-12 bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl">
              <motion.div
                variants={itemVariants}
                className="text-center space-y-8"
              >
                <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400">
                  Prêt à Transformer vos Objectifs en Réalité ?
                </h2>

                <p className="text-xl text-white/70 max-w-2xl mx-auto">
                  Rejoignez des milliers d'utilisateurs qui ont déjà
                  révolutionné leur approche de la gestion de projets.
                </p>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 hover:from-purple-600 hover:via-blue-600 hover:to-emerald-600 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-purple-500/20 w-full sm:w-auto"
                  >
                    Commencer Gratuitement
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-white/10 hover:border-white/20 text-white hover:bg-white/5 px-8 py-6 text-lg rounded-xl backdrop-blur-sm w-full sm:w-auto group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative">Voir la Démo</span>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
