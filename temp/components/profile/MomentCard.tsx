import React from 'react';
import { motion } from 'framer-motion';

export default function MomentCard({ moment, onClick, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group"
    >
      <img
        src={moment.photo_url}
        alt={moment.event_title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white text-sm font-medium truncate">{moment.event_title}</p>
      </div>
    </motion.div>
  );
}
