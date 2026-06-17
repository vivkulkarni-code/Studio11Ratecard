import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSessionStore } from '@/store/sessionStore';
import logoPath from '@assets/logo_transparent.png';

export default function IntroScreen() {
  const setAppScreen = useSessionStore(s => s.setAppScreen);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppScreen('focus');
    }, 3000);
    return () => clearTimeout(timer);
  }, [setAppScreen]);

  return (
    <div className="w-full h-[100dvh] bg-[#0B0B0F] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,transparent_55%)] pointer-events-none" />

      <motion.div
        className="flex flex-col items-center z-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      >
        <motion.div
          className="mb-5 drop-shadow-[0_0_32px_rgba(212,175,55,0.35)]"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
        >
          <img
            src={logoPath}
            alt="Studio11 Logo"
            className="h-24 w-auto object-contain"
          />
        </motion.div>

        <motion.h1
          className="text-4xl md:text-6xl text-white tracking-[0.45em] ml-[0.45em] mb-3 text-center"
          style={{ fontFamily: "'Bodoni Moda', serif" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          STUDIO11
        </motion.h1>

        <motion.div
          className="h-[1px] mb-4"
          style={{ background: '#D4AF37' }}
          initial={{ width: 0 }}
          animate={{ width: 56 }}
          transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
        />

        <motion.p
          className="text-[11px] tracking-[0.3em] uppercase"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#D4AF37', opacity: 0.8 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          Luxury Salon Experience
        </motion.p>

        <motion.p
          className="text-[10px] tracking-[0.2em] uppercase mt-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(212,175,55,0.5)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0.3, 0.5] }}
          transition={{ duration: 2, delay: 1.5, repeat: Infinity, repeatType: 'mirror' }}
        >
          About Our Salon
        </motion.p>
      </motion.div>
    </div>
  );
}
