import React from "react";
import { motion } from "framer-motion";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Mail, MessageSquare } from 'lucide-react';

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

const ContactSection = () => {
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
            Contactez-nous
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Découvrez comment nous pouvons vous aider à atteindre vos objectifs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Demo Booking Card */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Card className="p-8 bg-gradient-to-br from-purpele-900 to-blue-900 border-white/10 backdrop-blur-xl hover:border-white/20 transition-all duration-500 h-full">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Calendar className="h-8 w-8 text-purple-400 mb-4" />
                  <h3 className="text-2xl font-bold text-white">Réserver une démo</h3>
                  <p className="text-white/60">
                    Planifiez une session de 30 minutes avec notre équipe pour découvrir notre solution
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white/80">
                    <MessageSquare className="h-5 w-5 text-purple-400" />
                    <span>Démonstration personnalisée</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <MessageSquare className="h-5 w-5 text-purple-400" />
                    <span>Questions & Réponses</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 text-white"
                >
                  Réserver maintenant
                  <Calendar className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Contact Form Card */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Card className="p-8 bg-gradient-to-br from-purpele-900 to-emerald-900 border-white/10 backdrop-blur-xl hover:border-white/20 transition-all duration-500">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Mail className="h-8 w-8 text-blue-400 mb-4" />
                  <h3 className="text-2xl font-bold text-white">Envoyez-nous un message</h3>
                  <p className="text-white/60">
                    Notre équipe vous répondra dans les plus brefs délais
                  </p>
                </div>

                <form className="space-y-4">
                  <Input
                    placeholder="Nom"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                  <Textarea
                    placeholder="Message"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[120px]"
                  />
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:opacity-90 text-white"
                  >
                    Envoyer
                    <Mail className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection; 