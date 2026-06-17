import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Calendar } from 'lucide-react';
import { useSessionStore, Focus, Gender, UserProfile } from '@/store/sessionStore';

export default function PersonalFocusScreen() {
  const { setAppScreen, setGender, setUserProfile } = useSessionStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [anniversary, setAnniversary] = useState('');
  const [focus, setFocus] = useState<Focus>('FEMALE');

  const handleContinue = () => {
    const profile: UserProfile = { name, phone, birthday, anniversary, focus };
    setUserProfile(profile);
    const g: Gender = focus === 'KIDS' ? 'FEMALE' : focus;
    setGender(g);
    setAppScreen('main');
  };

  const handleSkip = () => {
    setAppScreen('main');
  };

  const focusOptions: Focus[] = ['MALE', 'FEMALE', 'KIDS'];

  return (
    <div className="w-full h-[100dvh] bg-[#0B0B0F] flex flex-col items-center justify-end relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.06)_0%,transparent_60%)] pointer-events-none" />

      <motion.div
        className="w-full max-w-md relative z-10 pb-safe"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 28, stiffness: 220, delay: 0.1 }}
      >
        <div
          className="w-full rounded-t-3xl px-6 pt-6 pb-10"
          style={{
            background: 'linear-gradient(180deg, #141418 0%, #0F0F13 100%)',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 -20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
            backdropFilter: 'blur(40px)',
          }}
        >
          {/* Handle */}
          <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-6" />

          {/* Header */}
          <p
            className="text-[11px] uppercase tracking-[0.3em] mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#D4AF37' }}
          >
            Welcome
          </p>
          <h2
            className="text-3xl text-white mb-2 leading-tight"
            style={{ fontFamily: "'Bodoni Moda', serif" }}
          >
            A more personal Studio11
          </h2>
          <p
            className="text-sm leading-relaxed mb-6"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.45)' }}
          >
            Tell us a little about you to save favourites, speed up booking, and unlock tailored recommendations.
          </p>

          {/* NAME */}
          <div className="mb-3">
            <label
              className="block text-[10px] uppercase tracking-[0.2em] mb-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.4)' }}
            >
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-2xl px-4 py-4 text-white text-base outline-none transition-all"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
              }}
              onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.4)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
            />
          </div>

          {/* PHONE */}
          <div className="mb-3">
            <label
              className="block text-[10px] uppercase tracking-[0.2em] mb-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.4)' }}
            >
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91  ..."
              className="w-full rounded-2xl px-4 py-4 text-white text-base outline-none transition-all"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
              }}
              onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.4)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
            />
          </div>

          {/* BIRTHDAY & ANNIVERSARY row */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label
                className="flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] mb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.4)' }}
              >
                <Gift size={11} style={{ color: '#D4AF37' }} />
                Birthday
              </label>
              <input
                type="date"
                value={birthday}
                onChange={e => setBirthday(e.target.value)}
                className="w-full rounded-2xl px-3 py-3 text-white text-sm outline-none transition-all"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                  colorScheme: 'dark',
                }}
                onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.4)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
            </div>
            <div>
              <label
                className="flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] mb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.4)' }}
              >
                <Calendar size={11} style={{ color: '#D4AF37' }} />
                Anniversary
              </label>
              <input
                type="date"
                value={anniversary}
                onChange={e => setAnniversary(e.target.value)}
                className="w-full rounded-2xl px-3 py-3 text-white text-sm outline-none transition-all"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                  colorScheme: 'dark',
                }}
                onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.4)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
            </div>
          </div>

          {/* 30% off nudge */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl mb-5"
            style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.18)' }}
          >
            <Gift size={14} style={{ color: '#D4AF37', flexShrink: 0 }} />
            <p
              className="text-[11px] leading-relaxed"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(212,175,55,0.85)' }}
            >
              Add your birthday & anniversary to receive <strong>30% off</strong> on those special days!
            </p>
          </div>

          {/* PREFERRED FOCUS */}
          <div className="mb-7">
            <label
              className="block text-[10px] uppercase tracking-[0.2em] mb-3"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.4)' }}
            >
              Preferred Focus
            </label>
            <div className="flex gap-3">
              {focusOptions.map(f => {
                const isActive = focus === f;
                return (
                  <button
                    key={f}
                    onClick={() => setFocus(f)}
                    className="flex-1 py-3 rounded-2xl text-sm uppercase tracking-[0.15em] font-semibold transition-all duration-200 glass-l2"
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(212,175,55,0.5) 0%, rgba(212,175,55,0.22) 100%)'
                        : undefined,
                      color: isActive ? '#D4AF37' : 'rgba(255,255,255,0.55)',
                      borderColor: isActive ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.14)',
                      boxShadow: isActive
                        ? '0 6px 22px rgba(212,175,55,0.18), inset 0 2px 0 rgba(255,255,255,0.22), inset 0 -2px 0 rgba(0,0,0,0.15)'
                        : '0 6px 22px rgba(0,0,0,0.32), inset 0 2px 0 rgba(255,255,255,0.12), inset 0 -2px 0 rgba(0,0,0,0.12)',
                    }}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SKIP / CONTINUE */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 py-4 rounded-2xl text-sm uppercase tracking-[0.18em] glass-l2"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'rgba(255,255,255,0.6)',
                borderColor: 'rgba(255,255,255,0.14)',
                boxShadow: '0 6px 22px rgba(0,0,0,0.32), inset 0 2px 0 rgba(255,255,255,0.12), inset 0 -2px 0 rgba(0,0,0,0.12)',
              }}
            >
              Skip
            </button>
            <button
              onClick={handleContinue}
              className="flex-[2] py-4 rounded-2xl text-sm uppercase tracking-[0.18em] font-semibold glass-l1"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: 'linear-gradient(135deg, rgba(212,175,55,0.75) 0%, rgba(212,175,55,0.45) 100%)',
                color: '#0B0B0F',
                borderColor: 'rgba(212,175,55,0.6)',
                boxShadow: '0 12px 40px rgba(212,175,55,0.22), inset 0 3px 0 rgba(255,255,255,0.30), inset 0 -3px 0 rgba(0,0,0,0.18)',
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
