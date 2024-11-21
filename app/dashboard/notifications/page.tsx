'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Bell, Mail, MessageSquare, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock notifications data
const notifications = [
  {
    id: 1,
    type: 'message',
    title: 'New Message',
    description: 'John Doe sent you a message',
    time: '5 minutes ago',
    read: false,
  },
  {
    id: 2,
    type: 'email',
    title: 'Email Verification',
    description: 'Please verify your email address',
    time: '1 hour ago',
    read: true,
  },
  // Add more mock notifications as needed
];

export default function Page() {
  return (
    <div className="p-6 space-y-8">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent mb-2">
            Notifications
          </h1>
          <p className="text-white/60">Stay updated with your latest notifications</p>
        </div>
        <Button variant="outline" size="icon" className="text-white/60 hover:text-white">
          <Settings className="h-4 w-4" />
        </Button>
      </motion.header>

      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className={`
                backdrop-blur-xl 
                ${notification.read ? 'bg-white/5' : 'bg-white/10'} 
                border-white/10 p-4
                hover:bg-white/15 transition-colors
              `}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-white/5">
                  {notification.type === 'message' ? (
                    <MessageSquare className="h-5 w-5 text-blue-400" />
                  ) : notification.type === 'email' ? (
                    <Mail className="h-5 w-5 text-green-400" />
                  ) : (
                    <Bell className="h-5 w-5 text-yellow-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium">{notification.title}</h3>
                    <span className="text-sm text-white/40">{notification.time}</span>
                  </div>
                  <p className="text-white/60">{notification.description}</p>
                </div>
                {!notification.read && (
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
} 