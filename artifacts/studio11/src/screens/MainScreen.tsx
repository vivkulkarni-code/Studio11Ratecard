import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, X, Plus, Scissors, Camera, ShoppingBag, Star, User, ScanFace, ShoppingCart, Gift, Calendar, ImageIcon } from 'lucide-react';
import { useSessionStore, BottomTab, UserProfile } from '@/store/sessionStore';
import { getServicesByGenderCategoryAndSubCategory, getServicesByGenderAndCategory } from '@/data/services';
import { categoryTaglines, categoryGradients, MALE_CATEGORIES, FEMALE_CATEGORIES } from '@/data/categories';
import { getSubCategories } from '@/data/categories';
import { getRecommendations } from '@/data/recommendations';
import { useAccentColor } from '@/hooks/useAccentColor';
import { useSwipe } from '@/hooks/useSwipe';
import logoPath from '@assets/logo_transparent.png';
import maniPadiVideoUrl from '@assets/grok_video_2026-06-17-14-00-05_1781685081657.mp4';
import bridalVideoUrl from '@assets/grok_video_2026-06-17-17-44-23_1781699536476.mp4';
import femaleCutsVideoUrl from '@assets/cuts_1781949331237.mp4';
import femaleStylingVideoUrl from '@assets/hair_Styling_1781949362487.mp4';
import femaleColorsVideoUrl from '@assets/colors_1781949381451.mp4';
import facialsVideoUrl from '@assets/Facials_1782057585099.mp4';
import textureVideoUrl from '@assets/Texure_1782058341128.mp4';
import detanVideoUrl from '@assets/De-tan_1782058353670.mp4';
import cleanUpVideoUrl from '@assets/Clean_Up_1782058365550.mp4';
import maskVideoUrl from '@assets/Mask_1782058380380.mp4';
import bodyTreatmentsVideoUrl from '@assets/InShot_20260621_224522079_1782062291405.mp4';
import hairSpaVideoUrl from '@assets/InShot_20260622_213343466_1782144367064.mp4';
import maleBodySpaVideoUrl from '@assets/Male-_Body_Spa_1782104764661.mp4';
import femaleBodySpaVideoUrl from '@assets/Female_Body_spa_1782104764707.mp4';
import maleSkinCareImgUrl from '@assets/skin-care_1782099710312.png';
import maleManiPadiImgUrl from '@assets/Mani-_Padi_1782099710395.png';
import maleMakeupImgUrl from '@assets/Make-up_1782099710414.png';
import maleHairStylingImgUrl from '@assets/Hair_Styling_1782099710436.png';
import maleGroomalImgUrl from '@assets/Groomal_1782099710464.png';
import maleFacialsImgUrl from '@assets/Facials_1782099710482.png';
import maleColorsImgUrl from '@assets/Colors_1782099710505.png';
import maleBodyTreatmentsImgUrl from '@assets/Body_treatments_1782099710530.png';

/* ─── Service name bracket parser ─────────────────────────────────────────── */
function toSentenceCase(str: string): string {
  const inner = str.replace(/^\(|\)$/g, '').trim();
  const fixed = inner.charAt(0).toUpperCase() + inner.slice(1).toLowerCase();
  return `(${fixed})`;
}

function ServiceNameDisplay({ name }: { name: string }) {
  const match = name.match(/^(.*?)(\s*\(.*\))\s*$/);
  if (!match) {
    return <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>{name}</span>;
  }
  return (
    <>
      <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>{match[1].trim()}</span>
      <span
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '0.68em',
          fontWeight: 300,
          opacity: 0.52,
          letterSpacing: '0.03em',
          display: 'block',
          marginTop: '2px',
        }}
      >
        {toSentenceCase(match[2].trim())}
      </span>
    </>
  );
}

/* ─── Root screen ──────────────────────────────────────────────────────────── */
export default function MainScreen() {
  const { gender, activeCategory, setActiveCategory, activeBottomTab } = useSessionStore();
  const cats = gender === 'MALE' ? MALE_CATEGORIES : FEMALE_CATEGORIES;

  const handleNext = () => {
    const idx = cats.indexOf(activeCategory);
    if (idx < cats.length - 1) setActiveCategory(cats[idx + 1]);
  };
  const handlePrev = () => {
    const idx = cats.indexOf(activeCategory);
    if (idx > 0) setActiveCategory(cats[idx - 1]);
  };
  const swipeHandlers = useSwipe({ onSwipeLeft: handleNext, onSwipeRight: handlePrev });

  return (
    <div className="w-full h-[100dvh] flex flex-col bg-background relative overflow-hidden">
      <Header />

      {activeBottomTab === 'menu' ? (
        <>
          <CategoryTabs cats={cats} />
          <SubCategoryTabs />
          <div className="flex-1 flex flex-col min-h-0 relative" {...swipeHandlers}>
            <CinematicArea />
            <ServiceList />
          </div>
        </>
      ) : (
        <ComingSoonScreen />
      )}

      <BottomNav />

      {/* Overlays */}
      <ServiceDrawer />
      <DecisionModal />
      <SessionDrawer />
      <ProfileDrawer />
      <CategoryStoryIntro />
    </div>
  );
}

/* ─── Header ───────────────────────────────────────────────────────────────── */
function Header() {
  const { gender, setGender, itemCount, totalPrice, setSessionDrawerOpen, setProfileDrawerOpen } = useSessionStore();
  const { accent, accentGlow } = useAccentColor();
  const count = itemCount();

  return (
    <div className="fixed top-0 left-0 right-0 h-[58px] bg-black/65 backdrop-blur-2xl border-b border-white/10 z-50 flex items-center justify-between px-4 md:px-5">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <img
          src={logoPath}
          alt="Studio11"
          className="h-7 w-auto object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]"
        />
        <span
          className="text-white tracking-[0.32em] uppercase text-[13px] font-semibold hidden sm:block"
          style={{ fontFamily: "'Bodoni Moda', serif" }}
        >
          STUDIO11
        </span>
      </div>

      {/* Gender toggle */}
      <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 shrink-0">
        {(['MALE', 'FEMALE'] as const).map(g => (
          <button
            key={g}
            data-testid={`button-header-gender-${g}`}
            onClick={() => setGender(g)}
            className="px-3 py-1 text-[9px] md:text-[10px] rounded-full uppercase tracking-widest transition-all"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              background: gender === g ? accent : 'transparent',
              color: gender === g ? '#0B0B0F' : 'rgba(255,255,255,0.55)',
              fontWeight: gender === g ? 700 : 400,
              boxShadow: gender === g ? accentGlow : 'none',
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Right icons: profile + cart */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Profile icon */}
        <button
          data-testid="button-profile"
          onClick={() => setProfileDrawerOpen(true)}
          className="relative w-9 h-9 rounded-full border flex items-center justify-center transition-all glass-l2"
          style={{ borderColor: 'rgba(255,255,255,0.18)' }}
        >
          <User size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
        </button>

        {/* Cart / session icon */}
        <button
          data-testid="button-session"
          onClick={() => setSessionDrawerOpen(true)}
          className="relative w-9 h-9 rounded-full border flex items-center justify-center transition-all glass-l2"
          style={{ borderColor: count > 0 ? `${accent}50` : 'rgba(255,255,255,0.18)' }}
        >
          <ShoppingCart size={16} style={{ color: count > 0 ? accent : 'rgba(255,255,255,0.7)' }} />
          {count > 0 && (
            <div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ background: accent, color: '#0B0B0F', boxShadow: accentGlow }}
            >
              {count}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Sparkle particles ────────────────────────────────────────────────────── */
function Sparkle({ color, count = 3 }: { color: string; count?: number }) {
  const POSITIONS = [
    { left: '18%', top: '25%', dx: '-6px', dy: '-10px', delay: 0 },
    { left: '75%', top: '18%', dx: '6px', dy: '-12px', delay: 0.5 },
    { left: '45%', top: '70%', dx: '0px', dy: '10px', delay: 1.1 },
  ].slice(0, count);

  return (
    <>
      {POSITIONS.map((p, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            width: '3px',
            height: '3px',
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 3px ${color}, 0 0 6px ${color}`,
            pointerEvents: 'none',
            animation: `glitter-drift 3.5s ease-out ${p.delay}s infinite`,
            ['--dx' as any]: p.dx,
            ['--dy' as any]: p.dy,
          }}
        />
      ))}
    </>
  );
}

/* ─── Category tabs — Level 1 (deepest glass) ─────────────────────────────── */
function CategoryTabs({ cats }: { cats: string[] }) {
  const { activeCategory, setActiveCategory } = useSessionStore();
  const { accent } = useAccentColor();

  return (
    <div className="pt-[58px] flex-none border-b border-white/10 bg-black/40 backdrop-blur-md relative z-40">
      <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-4 py-3 gap-3">
        {cats.map(cat => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              data-testid={`tab-category-${cat}`}
              onClick={() => setActiveCategory(cat as any)}
              className="shrink-0 rounded-full px-4 py-2 text-[9px] uppercase tracking-[0.18em] transition-all duration-300 relative overflow-hidden glass-l1"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: isActive
                  ? `linear-gradient(135deg, ${accent}55 0%, ${accent}22 100%)`
                  : 'linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 100%)',
                color: isActive ? accent : 'rgba(255,255,255,0.6)',
                fontWeight: isActive ? 700 : 400,
                borderColor: isActive ? `${accent}55` : 'rgba(255,255,255,0.22)',
                transform: isActive ? 'scale(1.06)' : 'scale(1)',
                boxShadow: isActive
                  ? `0 12px 40px ${accent}22, inset 0 3px 0 rgba(255,255,255,0.30), inset 0 -3px 0 rgba(0,0,0,0.22), inset 3px 0 0 rgba(255,255,255,0.10), inset -3px 0 0 rgba(0,0,0,0.10)`
                  : '0 12px 40px rgba(0,0,0,0.45), inset 0 3px 0 rgba(255,255,255,0.28), inset 0 -3px 0 rgba(0,0,0,0.22), inset 3px 0 0 rgba(255,255,255,0.10), inset -3px 0 0 rgba(0,0,0,0.10)',
              }}
            >
              {isActive && <Sparkle color={accent} count={5} />}
              <span className="relative z-10">{cat}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Sub-category tabs — Level 2 (medium glass) ──────────────────────────── */
function SubCategoryTabs() {
  const { gender, activeCategory, activeSubCategory, setActiveSubCategory } = useSessionStore();
  const { accent } = useAccentColor();

  const subCats = getSubCategories(gender, activeCategory);

  useEffect(() => {
    if (subCats.length > 0 && (!activeSubCategory || !subCats.includes(activeSubCategory))) {
      setActiveSubCategory(subCats[0]);
    }
  }, [activeCategory, gender]);

  if (subCats.length <= 1) return null;

  return (
    <div className="flex-none bg-black/30 backdrop-blur-md border-b border-white/8 z-39 relative">
      <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-4 py-2.5 gap-2">
        {subCats.map(sub => {
          const isActive = activeSubCategory === sub;
          return (
            <button
              key={sub}
              data-testid={`tab-subcategory-${sub}`}
              onClick={() => setActiveSubCategory(sub)}
              className="shrink-0 rounded-full px-4 py-1.5 text-[9px] uppercase tracking-[0.15em] transition-all duration-200 relative overflow-hidden glass-l2"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: isActive
                  ? `linear-gradient(135deg, ${accent}40 0%, ${accent}18 100%)`
                  : 'linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%)',
                color: isActive ? accent : 'rgba(255,255,255,0.42)',
                fontWeight: isActive ? 600 : 400,
                borderColor: isActive ? `${accent}45` : 'rgba(255,255,255,0.16)',
                boxShadow: isActive
                  ? `0 6px 22px ${accent}20, inset 0 2px 0 rgba(255,255,255,0.22), inset 0 -2px 0 rgba(0,0,0,0.15)`
                  : '0 6px 22px rgba(0,0,0,0.32), inset 0 2px 0 rgba(255,255,255,0.22), inset 0 -2px 0 rgba(0,0,0,0.15), inset 2px 0 0 rgba(255,255,255,0.06), inset -2px 0 0 rgba(0,0,0,0.06)',
              }}
            >
              {isActive && <Sparkle color={accent} count={4} />}
              <span className="relative z-10">{sub}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Per-subcategory / category media map ─────────────────────────────────── */
type MediaEntry = { type: 'video'; src: string } | { type: 'image'; src: string };

const CATEGORY_MEDIA: Partial<Record<string, MediaEntry>> = {
  // Female — category level
  'FEMALE::SPAS & MASSAGE': { type: 'video', src: femaleBodySpaVideoUrl },
  'FEMALE::MANI PADI': { type: 'video', src: maniPadiVideoUrl },
  'FEMALE::BRIDAL':    { type: 'video', src: bridalVideoUrl },
  'FEMALE::FACIALS':   { type: 'video', src: facialsVideoUrl },
  // Male — category level
  'MALE::SPAS & MASSAGE':    { type: 'video', src: maleBodySpaVideoUrl },
  'MALE::HAIR STYLING':      { type: 'image', src: maleHairStylingImgUrl },
  'MALE::GROOMAL':           { type: 'image', src: maleGroomalImgUrl },
  'MALE::SKIN CARE':         { type: 'image', src: maleSkinCareImgUrl },
  'MALE::FACIALS':           { type: 'image', src: maleFacialsImgUrl },
  'MALE::MANI PADI':         { type: 'image', src: maleManiPadiImgUrl },
  'MALE::MAKEUP':            { type: 'image', src: maleMakeupImgUrl },
  'MALE::BODY TREATMENTS':   { type: 'image', src: maleBodyTreatmentsImgUrl },
  // Male — sub-category level (HAIR STYLING)
  'MALE::HAIR STYLING::Colors': { type: 'image', src: maleColorsImgUrl },
  // Female — sub-category level (HAIR STYLING)
  'FEMALE::HAIR STYLING::Cuts':    { type: 'video', src: femaleCutsVideoUrl },
  'FEMALE::HAIR STYLING::Styling': { type: 'video', src: femaleStylingVideoUrl },
  'FEMALE::HAIR STYLING::Colors':  { type: 'video', src: femaleColorsVideoUrl },
  // Female — HAIR TREATMENTS & SPAS category + sub-categories
  'FEMALE::HAIR TREATMENTS & SPAS':             { type: 'video', src: hairSpaVideoUrl },
  'FEMALE::HAIR TREATMENTS & SPAS::Texture':   { type: 'video', src: textureVideoUrl },
  'FEMALE::HAIR TREATMENTS & SPAS::Hair Spas': { type: 'video', src: hairSpaVideoUrl },
  // Female — SKIN CARE sub-categories
  'FEMALE::SKIN CARE::De-Tan':  { type: 'video', src: detanVideoUrl },
  'FEMALE::SKIN CARE::Clean Up': { type: 'video', src: cleanUpVideoUrl },
  'FEMALE::SKIN CARE::Mask':    { type: 'video', src: maskVideoUrl },
  // Female — BODY TREATMENTS category
  'FEMALE::BODY TREATMENTS': { type: 'video', src: bodyTreatmentsVideoUrl },
};

function getCategoryMedia(gender: string, category: string, subCategory?: string): MediaEntry | null {
  if (subCategory) {
    const subKey = `${gender}::${category}::${subCategory}`;
    if (CATEGORY_MEDIA[subKey]) return CATEGORY_MEDIA[subKey]!;
  }
  return CATEGORY_MEDIA[`${gender}::${category}`] ?? null;
}

/* ─── Cinematic / media area ───────────────────────────────────────────────── */
function CinematicArea() {
  const { activeCategory, activeSubCategory, gender } = useSessionStore();
  const { accent } = useAccentColor();
  const gradient = categoryGradients[activeCategory];
  const tagline = categoryTaglines[activeCategory];
  const media = getCategoryMedia(gender, activeCategory, activeSubCategory);

  return (
    <div className="relative h-[140px] w-full flex-none overflow-hidden border-b border-white/10 flex items-center justify-center shrink-0">
      <AnimatePresence mode="popLayout">
        {media ? (
          <motion.div
            key={`${gender}-${activeCategory}-${activeSubCategory}-media`}
            className="absolute inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {media.type === 'video' ? (
              <video
                src={media.src}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img src={media.src} alt={activeCategory} className="w-full h-full object-cover" />
            )}
          </motion.div>
        ) : (
          <motion.div
            key={activeCategory}
            className="absolute inset-0 z-0"
            style={{ background: gradient }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/35 z-0" />

      {/* Category tagline overlay */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 w-full">
        <p
          className="text-[10px] uppercase tracking-[0.25em]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: `${accent}99` }}
        >
          {tagline}
        </p>
      </div>

      {/* Badge: shows "media" indicator when video/image is active, placeholder when not */}
      <div
        className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
        style={{
          background: 'rgba(0,0,0,0.45)',
          border: media ? '1px solid rgba(255,255,255,0.18)' : '1px dashed rgba(255,255,255,0.18)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <ImageIcon size={10} style={{ color: media ? accent : `${accent}60` }} />
        <span
          className="text-[8px] uppercase tracking-[0.15em]"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: media ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.28)',
          }}
        >
          {media ? (activeSubCategory || activeCategory) : `${activeSubCategory || activeCategory} media`}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[1px] z-10" style={{ backgroundImage: `linear-gradient(to right, transparent, ${accent}60, transparent)` }} />
    </div>
  );
}

/* ─── Service list — Level 3 (subtlest glass) ──────────────────────────────── */
function ServiceList() {
  const { gender, activeCategory, activeSubCategory, selectService, selectedService, sessionItems, itemCount, sessionDrawerOpen } = useSessionStore();
  const { accent, accentMuted, accentBorder } = useAccentColor();

  const services = activeSubCategory
    ? getServicesByGenderCategoryAndSubCategory(gender, activeCategory, activeSubCategory)
    : getServicesByGenderAndCategory(gender, activeCategory);

  const sessionIds = new Set(sessionItems.map(i => i.service.id));

  const steps = ['DISCOVER', 'BUILD SESSION', 'REVIEW', 'BOOK'];
  let activeIdx = 0;
  if (itemCount() > 0) activeIdx = 1;
  if (sessionDrawerOpen) activeIdx = 2;

  return (
    <div className="flex-1 overflow-y-auto pb-[72px]">
      {/* Progress strip */}
      <div className="flex items-center justify-center gap-3 py-3 border-b border-white/5 bg-black/20">
        {steps.map((step, idx) => {
          const isActive = idx === activeIdx;
          const isPast = idx < activeIdx;
          return (
            <div key={step} className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full transition-all duration-500"
                style={{
                  background: isActive ? accent : isPast ? `${accent}70` : 'rgba(255,255,255,0.2)',
                  transform: isActive ? 'scale(1.5)' : 'scale(1)',
                  boxShadow: isActive ? `0 0 8px ${accent}` : 'none',
                }}
              />
              <span
                className="text-[8px] uppercase tracking-widest transition-colors duration-500"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: isActive ? accent : isPast ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)',
                  display: isActive ? 'block' : 'none',
                }}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {/* Service cards — glass-l3 */}
      <AnimatePresence mode="popLayout">
        {services.map((service, i) => {
          const isSelected = selectedService?.id === service.id;
          const isInSession = sessionIds.has(service.id);
          const hasSelection = !!selectedService;

          return (
            <motion.div
              key={service.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: hasSelection && !isSelected ? 0.45 : 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => selectService(service)}
              data-testid={`card-service-${service.id}`}
              className="relative cursor-pointer mx-3 my-2 px-4 py-4 rounded-2xl flex items-center gap-3 transition-all duration-300 glass-l3"
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${accent}18 0%, ${accent}06 100%)`
                  : isInSession
                    ? 'linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)'
                    : 'linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)',
                borderColor: isSelected ? `${accent}45` : isInSession ? `${accent}25` : 'rgba(255,255,255,0.10)',
                boxShadow: isSelected
                  ? `0 4px 20px ${accent}20, inset 0 1px 0 rgba(255,255,255,0.20), inset 0 -1px 0 rgba(0,0,0,0.14)`
                  : '0 3px 14px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.10)',
              }}
            >
              {/* Tick / checkbox */}
              <div
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
                style={{
                  borderColor: isInSession ? accent : isSelected ? `${accent}80` : 'rgba(255,255,255,0.22)',
                  background: isInSession
                    ? accent
                    : isSelected
                      ? `${accent}20`
                      : 'rgba(255,255,255,0.04)',
                }}
              >
                {isInSession && <Check size={12} style={{ color: '#0B0B0F' }} strokeWidth={3} />}
                {isSelected && !isInSession && <Check size={12} style={{ color: accent }} strokeWidth={2} />}
              </div>

              {/* Name */}
              <div className="flex flex-col flex-1 min-w-0">
                <h3
                  className="text-[15px] text-white leading-tight"
                  style={{ fontFamily: "'Bodoni Moda', serif" }}
                >
                  <ServiceNameDisplay name={service.name} />
                </h3>
                <p
                  className="text-[9px] mt-1 uppercase tracking-[0.14em]"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: `${accent}60` }}
                >
                  {isInSession ? 'In session' : service.variants ? 'Multiple options' : 'Tap to explore'}
                </p>
              </div>

              {/* Right tick indicator for in-session */}
              {isInSession && (
                <div
                  className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: `${accent}20` }}
                >
                  <Check size={10} style={{ color: accent }} strokeWidth={2.5} />
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/* ─── Bottom nav — liquid glass tabs ──────────────────────────────────────── */
function BottomNav() {
  const { activeBottomTab, setActiveBottomTab, setAppScreen } = useSessionStore();
  const { accent } = useAccentColor();

  const tabs: { key: BottomTab; label: string; icon: React.ReactNode }[] = [
    { key: 'menu', label: 'Menu', icon: <Scissors size={18} /> },
    { key: 'ourwork', label: 'Our Work', icon: <Camera size={18} /> },
    { key: 'selfie', label: 'Selfie', icon: <ScanFace size={18} /> },
    { key: 'products', label: 'Products', icon: <ShoppingBag size={18} /> },
    { key: 'rewards', label: 'Rewards', icon: <Star size={18} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[66px] bg-black/70 backdrop-blur-2xl border-t border-white/10 z-40 flex items-center justify-around px-2 gap-1">
      {tabs.map(tab => {
        const isActive = activeBottomTab === tab.key;
        return (
          <button
            key={tab.key}
            data-testid={`bottom-tab-${tab.key}`}
            onClick={() => tab.key === 'ourwork' ? setAppScreen('gallery') : setActiveBottomTab(tab.key)}
            className="flex flex-col items-center gap-0.5 py-1.5 px-2.5 rounded-2xl transition-all duration-200 relative overflow-hidden flex-1 glass-l2"
            style={{
              background: isActive
                ? `linear-gradient(135deg, ${accent}30 0%, ${accent}10 100%)`
                : 'linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
              color: isActive ? accent : 'rgba(255,255,255,0.35)',
              borderColor: isActive ? `${accent}35` : 'rgba(255,255,255,0.10)',
              boxShadow: isActive
                ? `0 6px 22px ${accent}15, inset 0 2px 0 rgba(255,255,255,0.22), inset 0 -2px 0 rgba(0,0,0,0.15)`
                : '0 4px 16px rgba(0,0,0,0.28), inset 0 2px 0 rgba(255,255,255,0.14), inset 0 -2px 0 rgba(0,0,0,0.10)',
            }}
          >
            <div style={{ filter: isActive ? `drop-shadow(0 0 5px ${accent}99)` : 'none' }}>
              {tab.icon}
            </div>
            <span
              className="text-[8px] uppercase tracking-[0.1em] leading-none"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Coming soon placeholder ──────────────────────────────────────────────── */
function ComingSoonScreen() {
  const { activeBottomTab } = useSessionStore();
  const { accent } = useAccentColor();

  const labels: Record<BottomTab, string> = {
    menu: 'Menu',
    ourwork: 'Our Work',
    products: 'Products',
    rewards: 'Rewards',
    selfie: 'Selfie Studio',
  };

  const icons: Record<BottomTab, React.ReactNode> = {
    menu: <Scissors size={28} />,
    ourwork: <Camera size={28} />,
    products: <ShoppingBag size={28} />,
    rewards: <Star size={28} />,
    selfie: <ScanFace size={28} />,
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center pt-[58px] pb-[66px] bg-[#0B0B0F]">
      <motion.div
        className="flex flex-col items-center text-center px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-6 border"
          style={{ background: `${accent}10`, borderColor: `${accent}30`, color: accent }}
        >
          {icons[activeBottomTab]}
        </div>
        <h2
          className="text-3xl text-white mb-3 uppercase tracking-[0.3em]"
          style={{ fontFamily: "'Bodoni Moda', serif" }}
        >
          {labels[activeBottomTab]}
        </h2>
        <div className="h-[1px] w-12 mb-4" style={{ background: accent }} />
        <p
          className="text-sm uppercase tracking-[0.2em] mb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: `${accent}80` }}
        >
          Coming Soon
        </p>
        <p
          className="text-xs leading-relaxed max-w-[260px] mt-3"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.3)' }}
        >
          We're crafting something extraordinary. Stay tuned for an elevated experience.
        </p>
      </motion.div>
    </div>
  );
}

/* ─── Service detail drawer ────────────────────────────────────────────────── */
function ServiceDrawer() {
  const { drawerOpen, setDrawerOpen, selectedService, addToSession, sessionItems } = useSessionStore();
  const { accent, accentGlow } = useAccentColor();
  const [adding, setAdding] = useState(false);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [showMore, setShowMore] = useState(false);

  const hasVariants = !!(selectedService?.variants && selectedService.variants.length > 0);
  const activeVariant = hasVariants ? selectedService!.variants![selectedVariantIdx] : null;

  const displayPrice = activeVariant
    ? (activeVariant.price === 0 ? 'Consult Us' : `₹${activeVariant.price.toLocaleString('en-IN')}`)
    : selectedService?.price === 0 ? 'Consult Us' : selectedService ? `₹${selectedService.price.toLocaleString('en-IN')}` : '';

  const displayDuration = activeVariant ? activeVariant.duration : selectedService?.duration ?? 0;

  const handleAdd = () => {
    if (!selectedService) return;
    setAdding(true);
    setTimeout(() => {
      const serviceToAdd = hasVariants && activeVariant
        ? { ...selectedService, price: activeVariant.price, duration: activeVariant.duration, name: `${selectedService.name} — ${activeVariant.label}` }
        : selectedService;
      addToSession(serviceToAdd);
      setAdding(false);
    }, 800);
  };

  const alreadyAdded = selectedService ? sessionItems.some(i => i.service.id === selectedService.id || i.service.name.startsWith(selectedService.name + ' —')) : false;

  return (
    <AnimatePresence>
      {drawerOpen && selectedService && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            key={selectedService.id}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            onDragEnd={(_, { offset, velocity }) => {
              if (offset.y > 100 || velocity.y > 500) setDrawerOpen(false);
            }}
            onAnimationStart={() => { setSelectedVariantIdx(0); setShowMore(false); }}
            className="fixed bottom-0 left-0 right-0 bg-[#0A0A0C]/97 backdrop-blur-2xl border-t border-white/15 rounded-t-3xl z-50 flex flex-col max-h-[85vh]"
            style={{ borderTopColor: `${accent}20` }}
          >
            <div className="w-full flex justify-center pt-4 pb-2 shrink-0 cursor-grab">
              <div className="w-[40px] h-[4px] rounded-full" style={{ background: `${accent}40` }} />
            </div>

            <div className="px-6 pb-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: `${accent}80` }}>
                    {selectedService.subCategory}
                  </p>
                  <h2 className="text-2xl text-white leading-tight" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
                    <ServiceNameDisplay name={selectedService.name} />
                  </h2>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="text-white/30 hover:text-white/60 mt-1">
                  <X size={20} />
                </button>
              </div>

              {/* Variants — shown before price if service has them */}
              {hasVariants && (
                <div className="mb-5">
                  <p className="text-[9px] uppercase tracking-[0.2em] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.3)' }}>
                    Choose option
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedService.variants!.map((v, idx) => {
                      const isActive = idx === selectedVariantIdx;
                      return (
                        <button
                          key={v.label}
                          onClick={() => setSelectedVariantIdx(idx)}
                          className="px-4 py-2 rounded-xl text-xs uppercase tracking-widest border transition-all duration-200"
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: 300,
                            background: isActive ? `linear-gradient(135deg, ${accent}30 0%, ${accent}10 100%)` : 'rgba(255,255,255,0.04)',
                            borderColor: isActive ? `${accent}60` : 'rgba(255,255,255,0.12)',
                            color: isActive ? accent : 'rgba(255,255,255,0.5)',
                          }}
                        >
                          {v.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Duration + Price */}
              <div className="flex items-center gap-4 mb-5">
                <span
                  className="border text-xs px-3 py-1 rounded-full uppercase tracking-widest"
                  style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}
                >
                  {displayDuration} MIN
                </span>
                <span
                  className="text-2xl"
                  style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, color: accent }}
                >
                  {displayPrice}
                </span>
              </div>

              {/* Description + More toggle */}
              <div className="mb-5">
                <p className="text-sm leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.55)' }}>
                  {selectedService.description}
                </p>
                {selectedService.fullDescription && (
                  <>
                    <AnimatePresence>
                      {showMore && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm leading-relaxed mt-3 overflow-hidden"
                          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.42)' }}
                        >
                          {selectedService.fullDescription}
                        </motion.p>
                      )}
                    </AnimatePresence>
                    <button
                      onClick={() => setShowMore(v => !v)}
                      className="mt-2 text-[10px] uppercase tracking-[0.18em] border-b border-dashed pb-[1px] transition-colors duration-150"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: `${accent}90`, borderColor: `${accent}40` }}
                    >
                      {showMore ? 'Less' : 'More'}
                    </button>
                  </>
                )}
              </div>

              {/* Includes */}
              <h4 className="text-xs uppercase tracking-widest mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.35)' }}>
                Includes:
              </h4>
              <div className="flex flex-wrap gap-2 mb-7">
                {selectedService.benefits.map(b => (
                  <span
                    key={b}
                    className="border text-xs px-3 py-1 rounded-full"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.45)' }}
                  >
                    {b}
                  </span>
                ))}
              </div>

              {!alreadyAdded ? (
                <button
                  data-testid="button-add-to-session"
                  onClick={handleAdd}
                  className="liquid-glass-accent w-full relative font-semibold uppercase tracking-widest py-4 rounded-2xl transition-transform active:scale-[0.98]"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    background: `linear-gradient(135deg, ${accent}88 0%, ${accent}44 100%)`,
                    color: '#0B0B0F',
                    borderColor: `${accent}60`,
                    boxShadow: `${accentGlow}, inset 0 1px 0 rgba(255,255,255,0.35)`,
                  }}
                >
                  {adding ? (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <Check size={20} />
                      <span>Added</span>
                    </motion.div>
                  ) : (
                    'Add to Session'
                  )}
                </button>
              ) : (
                <div
                  className="liquid-glass w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", borderColor: `${accent}30`, color: `${accent}70` }}
                >
                  <Check size={16} />
                  <span>In Session</span>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Decision / upsell modal ──────────────────────────────────────────────── */
function DecisionModal() {
  const { showDecisionModal, setShowDecisionModal, lastAddedService, gender, sessionItems, addToSession, setSessionDrawerOpen } = useSessionStore();
  const { accent, accentMuted, accentGlow } = useAccentColor();

  if (!showDecisionModal || !lastAddedService) return null;

  const sessionIds = new Set(sessionItems.map(i => i.service.id));
  const recommendedServices = getRecommendations(lastAddedService, gender, sessionIds);

  const handleAddMore = () => setShowDecisionModal(false);
  const handleReview = () => {
    setShowDecisionModal(false);
    setSessionDrawerOpen(true);
  };

  return (
    <AnimatePresence>
      {showDecisionModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[#121216] border border-white/12 rounded-3xl p-7 w-full max-w-sm"
            style={{ borderColor: `${accent}15` }}
          >
            <div className="flex flex-col items-center text-center mb-7">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4 border"
                style={{ background: accentMuted, borderColor: `${accent}30` }}
              >
                <Check style={{ color: accent }} size={22} />
              </div>
              <h3 className="text-[10px] uppercase tracking-widest mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.5)' }}>
                Added to Session
              </h3>
              <h2 className="text-xl text-white leading-tight" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
                <ServiceNameDisplay name={lastAddedService.name} />
              </h2>
            </div>

            {recommendedServices.length > 0 && (
              <div className="mb-7">
                <h4
                  className="text-[10px] uppercase tracking-widest mb-3 text-center"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.35)' }}
                >
                  Frequently Paired With
                </h4>
                <div className="flex flex-col gap-2">
                  {recommendedServices.map(rec => (
                    <div
                      key={rec.id}
                      className="border rounded-full pl-4 pr-1 py-1 flex items-center justify-between"
                      style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}
                    >
                      <div className="flex flex-col flex-1 min-w-0 pr-2">
                        <span className="text-sm text-white/70 truncate" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>{rec.name}</span>
                        <span className="text-[10px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: `${accent}90` }}>
                          ₹{rec.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <button
                        data-testid={`button-add-rec-${rec.id}`}
                        onClick={() => addToSession(rec)}
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
                        style={{ background: accent, color: '#0B0B0F' }}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                data-testid="button-add-more"
                onClick={handleAddMore}
                className="liquid-glass w-full text-white text-xs uppercase tracking-widest py-4 rounded-xl transition-all hover:scale-[1.01]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", borderColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.8)' }}
              >
                Add More Services
              </button>
              <button
                data-testid="button-review-session"
                onClick={handleReview}
                className="liquid-glass-accent w-full font-semibold text-xs uppercase tracking-widest py-4 rounded-xl transition-all hover:scale-[1.02]"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background: `linear-gradient(135deg, ${accent}88 0%, ${accent}44 100%)`,
                  color: '#0B0B0F',
                  borderColor: `${accent}60`,
                  boxShadow: `${accentGlow}, inset 0 1px 0 rgba(255,255,255,0.35)`,
                }}
              >
                Review Session
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Session drawer (cart) ────────────────────────────────────────────────── */
function SessionDrawer() {
  const { sessionDrawerOpen, setSessionDrawerOpen, sessionItems, removeFromSession, totalPrice, totalDuration } = useSessionStore();
  const { accent, accentGlow } = useAccentColor();

  const handleWhatsApp = () => {
    const total = totalPrice();
    const serviceList = sessionItems.map(i => `• ${i.service.name} — ₹${i.service.price.toLocaleString('en-IN')}`).join('\n');
    const msg = `Hello Studio11,\n\nI would like to book the following services:\n\n${serviceList}\n\nTotal: ₹${total.toLocaleString('en-IN')}\nPreferred Date: \nPreferred Time: \n\nPlease confirm availability.`;
    window.open(`https://wa.me/919999999999?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <AnimatePresence>
      {sessionDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSessionDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-[min(380px,90vw)] bg-[#0D0D11] border-l border-white/10 z-[80] flex flex-col shadow-2xl"
            style={{ borderLeftColor: `${accent}15` }}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
              <h2 className="text-2xl text-white tracking-widest uppercase" style={{ fontFamily: "'Bodoni Moda', serif" }}>My Session</h2>
              <button data-testid="button-close-session" onClick={() => setSessionDrawerOpen(false)} className="text-white/50 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-6 flex flex-col gap-4">
              {sessionItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/25 gap-4">
                  <span className="italic text-xl" style={{ fontFamily: "'Bodoni Moda', serif" }}>Your session is empty</span>
                  <p className="text-xs text-center leading-relaxed max-w-[200px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Browse the menu and add services to build your perfect session.
                  </p>
                </div>
              ) : (
                sessionItems.map(item => (
                  <div
                    key={item.service.id}
                    data-testid={`session-item-${item.service.id}`}
                    className="flex items-start justify-between border-b pb-4"
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                  >
                    <div className="flex flex-col pr-4">
                      <span className="text-base text-white leading-snug mb-1" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
                        <ServiceNameDisplay name={item.service.name} />
                      </span>
                      <span className="text-sm font-medium tracking-wide" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: accent }}>
                        {item.service.price === 0 ? 'Consult Us' : `₹${item.service.price.toLocaleString('en-IN')}`}
                      </span>
                    </div>
                    <button
                      data-testid={`button-remove-${item.service.id}`}
                      onClick={() => removeFromSession(item.service.id)}
                      className="text-white/20 hover:text-red-400 transition-colors shrink-0 mt-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {sessionItems.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-black/20 shrink-0">
                <div className="flex items-end justify-between mb-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.45)' }}>
                      Total Duration
                    </span>
                    <span className="text-white text-lg" style={{ fontFamily: "'Bodoni Moda', serif" }}>{totalDuration()} Min</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.45)' }}>
                      Total Price
                    </span>
                    <span className="text-3xl leading-none" style={{ fontFamily: "'Bodoni Moda', serif", color: accent }}>
                      ₹{totalPrice().toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <button
                  data-testid="button-book-appointment"
                  onClick={handleWhatsApp}
                  className="liquid-glass-accent w-full font-semibold text-xs uppercase tracking-widest py-4 rounded-xl hover:scale-[1.02] transition-transform mb-3"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    background: `linear-gradient(135deg, ${accent}99 0%, ${accent}55 100%)`,
                    color: '#0B0B0F',
                    borderColor: `${accent}65`,
                    boxShadow: `${accentGlow}, inset 0 1px 0 rgba(255,255,255,0.4)`,
                  }}
                >
                  Book Appointment
                </button>
                <button
                  data-testid="button-whatsapp"
                  onClick={handleWhatsApp}
                  className="liquid-glass w-full font-semibold text-xs uppercase tracking-widest py-4 rounded-xl transition-all hover:scale-[1.01]"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", borderColor: `${accent}40`, color: accent }}
                >
                  WhatsApp Booking
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Profile drawer ───────────────────────────────────────────────────────── */
function ProfileDrawer() {
  const { profileDrawerOpen, setProfileDrawerOpen, userProfile, setUserProfile, setGender } = useSessionStore();
  const { accent, accentGlow } = useAccentColor();

  const [name, setName] = useState(userProfile?.name ?? '');
  const [phone, setPhone] = useState(userProfile?.phone ?? '');
  const [birthday, setBirthday] = useState(userProfile?.birthday ?? '');
  const [anniversary, setAnniversary] = useState(userProfile?.anniversary ?? '');

  useEffect(() => {
    if (profileDrawerOpen) {
      setName(userProfile?.name ?? '');
      setPhone(userProfile?.phone ?? '');
      setBirthday(userProfile?.birthday ?? '');
      setAnniversary(userProfile?.anniversary ?? '');
    }
  }, [profileDrawerOpen, userProfile]);

  const isSpecialDay = (dateStr: string) => {
    if (!dateStr) return false;
    const today = new Date();
    const d = new Date(dateStr);
    const diff = (new Date(today.getFullYear(), d.getMonth(), d.getDate()).getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86400000;
    return diff >= 0 && diff <= 30;
  };

  const bdaySoon = isSpecialDay(birthday);
  const anniSoon = isSpecialDay(anniversary);
  const hasDiscount = bdaySoon || anniSoon;

  const handleSave = () => {
    const updated: UserProfile = {
      name,
      phone,
      birthday,
      anniversary,
      focus: userProfile?.focus ?? 'FEMALE',
    };
    setUserProfile(updated);
    setProfileDrawerOpen(false);
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
    colorScheme: 'dark' as any,
  };

  return (
    <AnimatePresence>
      {profileDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setProfileDrawerOpen(false)}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[70]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 210 }}
            className="fixed top-0 right-0 bottom-0 w-[min(360px,90vw)] bg-[#0E0E12] border-l border-white/10 z-[80] flex flex-col shadow-2xl overflow-hidden"
            style={{ borderLeftColor: `${accent}15` }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
              <div>
                <h2 className="text-xl text-white tracking-widest uppercase" style={{ fontFamily: "'Bodoni Moda', serif" }}>My Profile</h2>
                <p className="text-[10px] mt-0.5 uppercase tracking-[0.15em]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: `${accent}70` }}>
                  {userProfile?.name ? `Welcome, ${userProfile.name.split(' ')[0]}` : 'Personal details'}
                </p>
              </div>
              <button onClick={() => setProfileDrawerOpen(false)} className="text-white/40 hover:text-white/70 transition-colors">
                <X size={22} />
              </button>
            </div>

            {/* 30% off banner */}
            {hasDiscount && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-4 mt-4 px-4 py-3 rounded-2xl flex items-center gap-3"
                style={{ background: `${accent}15`, border: `1px solid ${accent}35` }}
              >
                <Gift size={18} style={{ color: accent, flexShrink: 0 }} />
                <div>
                  <p className="text-xs font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: accent }}>
                    30% Off Unlocked!
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.5)' }}>
                    {bdaySoon && 'Birthday'}{bdaySoon && anniSoon && ' & '}{anniSoon && 'Anniversary'} special within 30 days
                  </p>
                </div>
              </motion.div>
            )}

            {/* Form */}
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-6 py-5 flex flex-col gap-4">
              {/* Name */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.4)' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = `${accent}50`)}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.4)' }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 ..."
                  className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = `${accent}50`)}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                />
              </div>

              {/* Birthday */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.4)' }}>
                  <Gift size={11} style={{ color: bdaySoon ? accent : 'rgba(255,255,255,0.4)' }} />
                  Birthday
                  {bdaySoon && <span className="text-[9px] px-1.5 py-0.5 rounded-full ml-1" style={{ background: `${accent}25`, color: accent }}>30% off</span>}
                </label>
                <input
                  type="date"
                  value={birthday}
                  onChange={e => setBirthday(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = `${accent}50`)}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                />
              </div>

              {/* Anniversary */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.4)' }}>
                  <Calendar size={11} style={{ color: anniSoon ? accent : 'rgba(255,255,255,0.4)' }} />
                  Anniversary
                  {anniSoon && <span className="text-[9px] px-1.5 py-0.5 rounded-full ml-1" style={{ background: `${accent}25`, color: accent }}>30% off</span>}
                </label>
                <input
                  type="date"
                  value={anniversary}
                  onChange={e => setAnniversary(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = `${accent}50`)}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                />
              </div>

              {/* Note about discount */}
              {!hasDiscount && (birthday || anniversary) && (
                <div
                  className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <Gift size={13} style={{ color: `${accent}60`, flexShrink: 0, marginTop: 1 }} />
                  <p className="text-[10px] leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.35)' }}>
                    You'll receive a <span style={{ color: accent }}>30% discount</span> automatically on your birthday & anniversary!
                  </p>
                </div>
              )}
            </div>

            {/* Save button */}
            <div className="px-6 pb-8 pt-4 border-t border-white/10 shrink-0">
              <button
                onClick={handleSave}
                className="liquid-glass-accent w-full py-4 rounded-2xl font-semibold text-xs uppercase tracking-widest transition-all hover:scale-[1.01]"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background: `linear-gradient(135deg, ${accent}88 0%, ${accent}44 100%)`,
                  color: '#0B0B0F',
                  borderColor: `${accent}60`,
                  boxShadow: `${accentGlow}, inset 0 1px 0 rgba(255,255,255,0.35)`,
                }}
              >
                Save Profile
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Category flash intro overlay ────────────────────────────────────────── */
function CategoryStoryIntro() {
  const { activeCategory } = useSessionStore();
  const { accent } = useAccentColor();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const t = setTimeout(() => setShow(false), 1400);
    return () => clearTimeout(t);
  }, [activeCategory]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 bg-black/95 z-[90] flex flex-col items-center justify-center pointer-events-none"
        >
          <motion.h2
            initial={{ scale: 0.9, opacity: 0, filter: 'blur(10px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            exit={{ scale: 1.05, opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-5xl md:text-7xl text-white uppercase tracking-[0.3em] mb-4 text-center"
            style={{ fontFamily: "'Bodoni Moda', serif", marginLeft: '0.3em' }}
          >
            {activeCategory}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-xs uppercase tracking-[0.2em] text-center px-6"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: `${accent}80` }}
          >
            {categoryTaglines[activeCategory]}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
