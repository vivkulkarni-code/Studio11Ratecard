import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { File as FSFile } from 'expo-file-system';
import { getStudio11Dir, requestStoragePermission } from '../utils/storage';
import * as Haptics from 'expo-haptics';
import { VideoView, useVideoPlayer } from 'expo-video';
import type { VideoPlayer } from 'expo-video';
import { useSessionStore } from '../store/sessionStore';
import type { Service, ServiceVariant, CartItem } from '../store/sessionStore';
import {
  getServicesByGenderAndCategory,
  getServicesByGenderCategoryAndSubCategory,
  getSubCategories,
} from '../data/services';
import { getCategoriesForGender } from '../data/categories';
import { logoAsset, getVideoForCategory } from '../mediaAssets';
import colors from '../../constants/colors';
import { useAccentColor, useAccentDim } from '../hooks/useAccentColor';

const { width, height } = Dimensions.get('window');
function getBookingsDir() {
  return getStudio11Dir('Bookings');
}

export default function MainScreen() {
  const {
    gender, activeCategory, activeSubCategory,
    setAppScreen, setGender, setActiveCategory, setActiveSubCategory,
    drawerService, setDrawerService,
    sessionDrawerOpen, setSessionDrawerOpen,
    profileDrawerOpen, setProfileDrawerOpen,
    decisionModalOpen, decisionModalService, setDecisionModal,
    cart, addToCart, removeFromCart, clearCart,
    profile, getTotalPrice, getTotalDuration,
  } = useSessionStore();

  const accent = useAccentColor();
  const accentDim = useAccentDim();
  const categories = getCategoriesForGender(gender);

  const services = activeSubCategory
    ? getServicesByGenderCategoryAndSubCategory(gender, activeCategory, activeSubCategory)
    : getServicesByGenderAndCategory(gender, activeCategory);

  const subCategories = getSubCategories(gender, activeCategory);

  const videoSource = getVideoForCategory(gender, activeCategory, activeSubCategory || undefined);

  return (
    <View style={styles.root}>
      <Header accent={accent} />

      <View style={styles.body}>
        <CategoryBar
          categories={categories}
          activeCategory={activeCategory}
          onSelect={cat => { setActiveCategory(cat); setActiveSubCategory(''); }}
          accent={accent}
        />

        {subCategories.length > 1 && (
          <SubCategoryBar
            subCategories={subCategories}
            activeSubCategory={activeSubCategory}
            onSelect={sub => setActiveSubCategory(activeSubCategory === sub ? '' : sub)}
            accent={accent}
          />
        )}

        <View style={styles.contentArea}>
          <CinematicArea
            videoSource={videoSource}
            category={activeCategory}
            subCategory={activeSubCategory}
            accent={accent}
          />
          <ServiceList
            services={services}
            accent={accent}
            accentDim={accentDim}
            onServicePress={svc => setDrawerService(svc)}
            cartIds={new Set(cart.map(i => i.service.id))}
          />
        </View>
      </View>

      <BottomNav accent={accent} />

      {drawerService && (
        <ServiceDrawer
          service={drawerService}
          accent={accent}
          accentDim={accentDim}
          onClose={() => setDrawerService(null)}
          onAddToCart={(svc, variant) => {
            addToCart(svc, variant);
            setDrawerService(null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (Math.random() > 0.5) {
              const relatedSubs = getSubCategories(gender, svc.category).filter(s => s !== svc.subCategory);
              if (relatedSubs.length) {
                const fakeSvc = getServicesByGenderCategoryAndSubCategory(gender, svc.category, relatedSubs[0])[0];
                if (fakeSvc) setTimeout(() => setDecisionModal(true, fakeSvc), 700);
              }
            }
          }}
          isInCart={cart.some(i => i.service.id === drawerService.id)}
        />
      )}

      {sessionDrawerOpen && (
        <SessionDrawer
          accent={accent}
          accentDim={accentDim}
          cart={cart}
          profile={profile}
          totalPrice={getTotalPrice()}
          totalDuration={getTotalDuration()}
          onClose={() => setSessionDrawerOpen(false)}
          onRemove={removeFromCart}
          onClear={clearCart}
        />
      )}

      {profileDrawerOpen && (
        <ProfileDrawer accent={accent} onClose={() => setProfileDrawerOpen(false)} />
      )}

      {decisionModalOpen && decisionModalService && (
        <DecisionModal
          service={decisionModalService}
          accent={accent}
          onAdd={() => {
            addToCart(decisionModalService);
            setDecisionModal(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }}
          onDismiss={() => setDecisionModal(false)}
        />
      )}
    </View>
  );
}

function Header({ accent }: { accent: string }) {
  const { setGender, gender, setSessionDrawerOpen, setProfileDrawerOpen, cart, profile } = useSessionStore();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <View style={headerStyles.root}>
      <TouchableOpacity onPress={() => setProfileDrawerOpen(true)} style={headerStyles.profileBtn} activeOpacity={0.75}>
        <View style={[headerStyles.avatar, { borderColor: accent }]}>
          <Text style={[headerStyles.avatarText, { color: accent }]}>
            {profile.name ? profile.name[0].toUpperCase() : '✦'}
          </Text>
        </View>
      </TouchableOpacity>

      <Image source={logoAsset} style={headerStyles.logo} resizeMode="contain" />

      <View style={headerStyles.right}>
        <View style={[headerStyles.genderToggle, { borderColor: accent }]}>
          <TouchableOpacity
            onPress={() => setGender('FEMALE')}
            style={[headerStyles.genderOpt, gender === 'FEMALE' && { backgroundColor: accent }]}
            activeOpacity={0.8}
          >
            <Text style={[headerStyles.genderText, gender === 'FEMALE' && { color: '#000' }]}>♀</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setGender('MALE')}
            style={[headerStyles.genderOpt, gender === 'MALE' && { backgroundColor: colors.silver }]}
            activeOpacity={0.8}
          >
            <Text style={[headerStyles.genderText, gender === 'MALE' && { color: '#000' }]}>♂</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setSessionDrawerOpen(true)} style={headerStyles.cartBtn} activeOpacity={0.8}>
          <Text style={[headerStyles.cartIcon, { color: accent }]}>◈</Text>
          {cartCount > 0 && (
            <View style={[headerStyles.badge, { backgroundColor: accent }]}>
              <Text style={headerStyles.badgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  profileBtn: {},
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  avatarText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 15, fontWeight: '600' },
  logo: { width: 100, height: 48 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  genderToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  genderOpt: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  genderText: {
    fontSize: 16,
    color: colors.muted,
  },
  cartBtn: { padding: 8, position: 'relative' },
  cartIcon: { fontSize: 24 },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, color: '#000', fontWeight: '700' },
});

function CategoryBar({ categories, activeCategory, onSelect, accent }: {
  categories: ReturnType<typeof getCategoriesForGender>;
  activeCategory: string;
  onSelect: (cat: any) => void;
  accent: string;
}) {
  return (
    <View style={catStyles.root}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={catStyles.scroll}>
        {categories.map(cat => {
          const isActive = cat.name === activeCategory;
          return (
            <TouchableOpacity
              key={cat.name}
              onPress={() => onSelect(cat.name)}
              style={[catStyles.btn, isActive && { borderBottomColor: accent, borderBottomWidth: 2 }]}
              activeOpacity={0.75}
            >
              <Text style={catStyles.icon}>{cat.icon}</Text>
              <Text style={[catStyles.label, isActive && { color: accent }]}>{cat.shortName}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const catStyles = StyleSheet.create({
  root: { borderBottomWidth: 1, borderBottomColor: colors.border },
  scroll: { paddingHorizontal: 8, paddingVertical: 6, flexDirection: 'row', gap: 4 },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  icon: { fontSize: 16, marginBottom: 2 },
  label: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.3,
  },
});

function SubCategoryBar({ subCategories, activeSubCategory, onSelect, accent }: {
  subCategories: string[];
  activeSubCategory: string;
  onSelect: (sub: string) => void;
  accent: string;
}) {
  return (
    <View style={subStyles.root}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={subStyles.scroll}>
        {subCategories.map(sub => {
          const isActive = sub === activeSubCategory;
          return (
            <TouchableOpacity
              key={sub}
              onPress={() => onSelect(sub)}
              style={[subStyles.chip, isActive && { backgroundColor: accent, borderColor: accent }]}
              activeOpacity={0.75}
            >
              <Text style={[subStyles.chipText, isActive && { color: '#000' }]}>{sub}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const subStyles = StyleSheet.create({
  root: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 8 },
  scroll: { paddingHorizontal: 12, gap: 8, flexDirection: 'row' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  chipText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: colors.muted,
    letterSpacing: 0.3,
  },
});

function CinematicArea({ videoSource, category, subCategory, accent }: {
  videoSource: number | null;
  category: string;
  subCategory: string;
  accent: string;
}) {
  const key = `${category}_${subCategory}`;

  if (!videoSource) {
    return (
      <View style={cinStyles.root}>
        <LinearGradient
          colors={[accent + '22', colors.background]}
          style={StyleSheet.absoluteFill}
        />
        <Text style={[cinStyles.fallbackCat, { color: accent }]}>{category}</Text>
      </View>
    );
  }

  return <VideoPanel key={key} source={videoSource} accent={accent} category={category} />;
}

function VideoPanel({ source, accent, category }: {
  source: number;
  accent: string;
  category: string;
}) {
  const player = useVideoPlayer(source, (p: VideoPlayer) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <View style={cinStyles.root}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.45)', colors.background]}
        style={cinStyles.vignette}
      />
      <View style={cinStyles.catLabel}>
        <Text style={[cinStyles.catLabelText, { color: accent }]}>{category}</Text>
      </View>
    </View>
  );
}

const cinStyles = StyleSheet.create({
  root: {
    height: 160,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  vignette: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  fallbackCat: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    fontFamily: 'BodoniModa_400Regular',
    fontSize: 22,
    letterSpacing: 1,
  },
  catLabel: {
    position: 'absolute',
    bottom: 12,
    left: 16,
  },
  catLabelText: {
    fontFamily: 'BodoniModa_400Regular',
    fontSize: 20,
    letterSpacing: 1,
  },
});

function ServiceList({ services, accent, accentDim, onServicePress, cartIds }: {
  services: Service[];
  accent: string;
  accentDim: string;
  onServicePress: (svc: Service) => void;
  cartIds: Set<string>;
}) {
  const renderItem = useCallback(({ item }: { item: Service }) => (
    <ServiceCard
      service={item}
      accent={accent}
      accentDim={accentDim}
      inCart={cartIds.has(item.id)}
      onPress={() => onServicePress(item)}
    />
  ), [accent, accentDim, cartIds, onServicePress]);

  return (
    <FlatList
      data={services}
      keyExtractor={s => s.id}
      renderItem={renderItem}
      contentContainerStyle={svcListStyles.content}
      showsVerticalScrollIndicator={false}
      initialNumToRender={8}
      maxToRenderPerBatch={10}
    />
  );
}

const svcListStyles = StyleSheet.create({
  content: { paddingVertical: 8, paddingHorizontal: 12, gap: 8, paddingBottom: 80 },
});

function ServiceCard({ service, accent, accentDim, inCart, onPress }: {
  service: Service;
  accent: string;
  accentDim: string;
  inCart: boolean;
  onPress: () => void;
}) {
  const lowestPrice = service.variants
    ? Math.min(...service.variants.map(v => v.price))
    : service.price;
  const hasVariants = !!service.variants?.length;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[svcCardStyles.root, inCart && { borderColor: accent, borderWidth: 1 }]}>
      <View style={svcCardStyles.left}>
        <Text style={[svcCardStyles.name, { fontFamily: 'Montserrat_300Light' }]}>{service.name}</Text>
        <Text style={svcCardStyles.desc} numberOfLines={1}>{service.description}</Text>
        <View style={svcCardStyles.tags}>
          {service.benefits.slice(0, 3).map((b, i) => (
            <View key={i} style={[svcCardStyles.tag, { borderColor: `${accent}50` }]}>
              <Text style={[svcCardStyles.tagText, { color: accent }]}>{b}</Text>
            </View>
          ))}
          {service.benefits.length > 3 && (
            <View style={[svcCardStyles.tag, { borderColor: `${accent}30` }]}>
              <Text style={[svcCardStyles.tagText, { color: colors.muted }]}>+{service.benefits.length - 3}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={svcCardStyles.right}>
        <Text style={svcCardStyles.duration}>⏱ {service.duration}m</Text>
        <Text style={[svcCardStyles.price, { color: accent }]}>
          {hasVariants ? 'From ' : ''}₹{lowestPrice.toLocaleString('en-IN')}
        </Text>
        <View style={[svcCardStyles.addBtn, { backgroundColor: inCart ? accentDim : `${accent}20`, borderColor: accent }]}>
          <Text style={[svcCardStyles.addBtnText, { color: accent }]}>{inCart ? '✓ Added' : '+ Add'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const svcCardStyles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: colors.radius,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  left: { flex: 1 },
  name: {
    fontSize: 14,
    color: colors.foreground,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  desc: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: colors.muted,
    marginBottom: 8,
    lineHeight: 17,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  tagText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, letterSpacing: 0.2 },
  right: { alignItems: 'flex-end', justifyContent: 'space-between', minWidth: 90 },
  duration: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 11,
    color: colors.muted,
  },
  price: {
    fontFamily: 'BodoniModa_400Regular',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  addBtnText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

function BottomNav({ accent }: { accent: string }) {
  const { setAppScreen } = useSessionStore();
  const navItems = [
    { id: 'gallery', icon: '🖼', label: 'Our Work', action: () => setAppScreen('gallery') },
    { id: 'products', icon: '🧴', label: 'Products', action: () => setAppScreen('products') },
    { id: 'rewards', icon: '⭐', label: 'Rewards', action: () => {} },
    { id: 'selfie', icon: '📸', label: 'Selfie', action: () => {} },
  ];

  return (
    <View style={bnStyles.root}>
      {navItems.map(item => (
        <TouchableOpacity key={item.id} onPress={item.action} style={bnStyles.item} activeOpacity={0.75}>
          <Text style={bnStyles.icon}>{item.icon}</Text>
          <Text style={[bnStyles.label, { color: colors.muted }]}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const bnStyles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
  },
  item: { flex: 1, alignItems: 'center', gap: 2 },
  icon: { fontSize: 18 },
  label: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, letterSpacing: 0.3 },
});

function ServiceDrawer({ service, accent, accentDim, onClose, onAddToCart, isInCart }: {
  service: Service;
  accent: string;
  accentDim: string;
  onClose: () => void;
  onAddToCart: (svc: Service, variant?: ServiceVariant) => void;
  isInCart: boolean;
}) {
  const slideY = useRef(new Animated.Value(height)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const [selectedVariant, setSelectedVariant] = useState<ServiceVariant | undefined>(
    service.variants?.[0]
  );

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideY, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      Animated.timing(bgOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  const close = () => {
    Animated.parallel([
      Animated.timing(slideY, { toValue: height, duration: 280, useNativeDriver: true }),
      Animated.timing(bgOpacity, { toValue: 0, duration: 230, useNativeDriver: true }),
    ]).start(onClose);
  };

  const displayPrice = selectedVariant?.price ?? service.price;
  const displayDuration = selectedVariant?.duration ?? service.duration;

  return (
    <View style={drawerStyles.overlay}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        </Pressable>
      </Animated.View>

      <Animated.View style={[drawerStyles.sheet, { transform: [{ translateY: slideY }] }]}>
        <View style={[drawerStyles.handle, { backgroundColor: accent }]} />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={drawerStyles.header}>
            <Text style={drawerStyles.name}>{service.name}</Text>
            <TouchableOpacity onPress={close} style={drawerStyles.closeBtn} activeOpacity={0.7}>
              <Text style={drawerStyles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={drawerStyles.desc}>{service.description}</Text>

          <View style={drawerStyles.priceRow}>
            <View>
              <Text style={[drawerStyles.price, { color: accent }]}>₹{displayPrice.toLocaleString('en-IN')}</Text>
              <Text style={drawerStyles.duration}>⏱ {displayDuration} minutes</Text>
            </View>
          </View>

          {service.variants && service.variants.length > 0 && (
            <View style={drawerStyles.variantSection}>
              <Text style={drawerStyles.sectionLabel}>SELECT VARIANT</Text>
              <View style={drawerStyles.variantRow}>
                {service.variants.map(v => {
                  const isActive = selectedVariant?.label === v.label;
                  return (
                    <TouchableOpacity
                      key={v.label}
                      onPress={() => setSelectedVariant(v)}
                      style={[
                        drawerStyles.variantChip,
                        isActive && { backgroundColor: accentDim, borderColor: accent },
                      ]}
                      activeOpacity={0.75}
                    >
                      <Text style={[drawerStyles.variantLabel, isActive && { color: accent }]}>{v.label}</Text>
                      <Text style={[drawerStyles.variantPrice, isActive && { color: accent }]}>
                        ₹{v.price.toLocaleString('en-IN')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <View style={drawerStyles.benefitsSection}>
            <Text style={drawerStyles.sectionLabel}>WHAT'S INCLUDED</Text>
            <View style={drawerStyles.benefitsList}>
              {service.benefits.map((b, i) => (
                <View key={i} style={drawerStyles.benefitItem}>
                  <Text style={[drawerStyles.benefitDot, { color: accent }]}>◆</Text>
                  <Text style={drawerStyles.benefitText}>{b}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={drawerStyles.footer}>
          <TouchableOpacity
            onPress={() => onAddToCart(service, selectedVariant)}
            style={[drawerStyles.addBtn, { backgroundColor: accent }]}
            activeOpacity={0.85}
          >
            <Text style={drawerStyles.addBtnText}>
              {isInCart ? '✓ ADDED TO SESSION' : `ADD TO SESSION · ₹${displayPrice.toLocaleString('en-IN')}`}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const drawerStyles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 100, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.75,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
  },
  handle: {
    width: 40,
    height: 3,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  name: { fontFamily: 'BodoniModa_400Regular', fontSize: 22, color: colors.foreground, flex: 1, lineHeight: 28 },
  closeBtn: { padding: 4, marginLeft: 12 },
  closeText: { color: colors.muted, fontSize: 18 },
  desc: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: colors.muted, lineHeight: 21, marginBottom: 16 },
  priceRow: { marginBottom: 20 },
  price: { fontFamily: 'BodoniModa_400Regular', fontSize: 28, letterSpacing: 0.5, marginBottom: 2 },
  duration: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, color: colors.muted },
  sectionLabel: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 2,
    marginBottom: 10,
  },
  variantSection: { marginBottom: 20 },
  variantRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  variantChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  variantLabel: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: colors.muted, marginBottom: 2 },
  variantPrice: { fontFamily: 'BodoniModa_400Regular', fontSize: 14, color: colors.muted },
  benefitsSection: { marginBottom: 20 },
  benefitsList: { gap: 8 },
  benefitItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  benefitDot: { fontSize: 8 },
  benefitText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, color: colors.foreground },
  footer: { marginTop: 8 },
  addBtn: { borderRadius: colors.radius, paddingVertical: 16, alignItems: 'center' },
  addBtnText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    letterSpacing: 1.5,
    color: '#000',
    fontWeight: '700',
  },
});

function SessionDrawer({ accent, accentDim, cart, profile, totalPrice, totalDuration, onClose, onRemove, onClear }: {
  accent: string;
  accentDim: string;
  cart: CartItem[];
  profile: any;
  totalPrice: number;
  totalDuration: number;
  onClose: () => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  const slideX = useRef(new Animated.Value(width)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideX, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      Animated.timing(bgOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  const close = () => {
    Animated.parallel([
      Animated.timing(slideX, { toValue: width, duration: 280, useNativeDriver: true }),
      Animated.timing(bgOpacity, { toValue: 0, duration: 230, useNativeDriver: true }),
    ]).start(onClose);
  };

  const saveBooking = async () => {
    setSaving(true);
    try {
      await requestStoragePermission();
      const bookingsDir = getBookingsDir();
      if (!bookingsDir.exists) {
        bookingsDir.create();
      }
      const booking = {
        id: `booking_${Date.now()}`,
        timestamp: new Date().toISOString(),
        client: profile,
        services: cart.map(i => ({
          name: i.service.name,
          category: i.service.category,
          variant: i.selectedVariant?.label,
          price: i.selectedVariant?.price ?? i.service.price,
          duration: i.selectedVariant?.duration ?? i.service.duration,
          quantity: i.quantity,
        })),
        totalPrice,
        totalDuration,
      };
      const file = new FSFile(bookingsDir, `booking_${Date.now()}.json`);
      file.write(JSON.stringify(booking, null, 2));
      setSaved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      // fallback — booking data not persisted
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={sessionStyles.overlay}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        </Pressable>
      </Animated.View>

      <Animated.View style={[sessionStyles.panel, { transform: [{ translateX: slideX }] }]}>
        <View style={sessionStyles.header}>
          <Text style={sessionStyles.title}>Your Session</Text>
          <TouchableOpacity onPress={close} style={sessionStyles.closeBtn} activeOpacity={0.7}>
            <Text style={sessionStyles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {profile.name ? (
          <View style={[sessionStyles.clientInfo, { backgroundColor: accentDim, borderColor: `${accent}40` }]}>
            <Text style={[sessionStyles.clientName, { color: accent }]}>{profile.name}</Text>
            {profile.phone ? <Text style={sessionStyles.clientPhone}>{profile.phone}</Text> : null}
          </View>
        ) : null}

        <ScrollView style={sessionStyles.cartList} showsVerticalScrollIndicator={false}>
          {cart.length === 0 ? (
            <View style={sessionStyles.empty}>
              <Text style={sessionStyles.emptyText}>No services added yet</Text>
            </View>
          ) : (
            cart.map(item => {
              const price = item.selectedVariant?.price ?? item.service.price;
              return (
                <View key={`${item.service.id}_${item.selectedVariant?.label}`} style={sessionStyles.cartItem}>
                  <View style={sessionStyles.cartItemLeft}>
                    <Text style={sessionStyles.cartItemName}>{item.service.name}</Text>
                    {item.selectedVariant && (
                      <Text style={sessionStyles.cartItemVariant}>{item.selectedVariant.label}</Text>
                    )}
                    <Text style={[sessionStyles.cartItemPrice, { color: accent }]}>
                      ₹{price.toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => onRemove(item.service.id)}
                    style={sessionStyles.removeBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={sessionStyles.removeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </ScrollView>

        {cart.length > 0 && (
          <View style={sessionStyles.footer}>
            <View style={sessionStyles.totals}>
              <View style={sessionStyles.totalRow}>
                <Text style={sessionStyles.totalLabel}>Total Duration</Text>
                <Text style={sessionStyles.totalValue}>{totalDuration} min</Text>
              </View>
              <View style={sessionStyles.totalRow}>
                <Text style={sessionStyles.totalLabel}>Total Amount</Text>
                <Text style={[sessionStyles.totalValue, { color: accent, fontSize: 20 }]}>
                  ₹{totalPrice.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            {saved ? (
              <View style={[sessionStyles.confirmBtn, { backgroundColor: '#2a7a2a' }]}>
                <Text style={sessionStyles.confirmBtnText}>✓ BOOKING SAVED</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={saveBooking}
                style={[sessionStyles.confirmBtn, { backgroundColor: accent }]}
                activeOpacity={0.85}
                disabled={saving}
              >
                <Text style={sessionStyles.confirmBtnText}>
                  {saving ? 'SAVING…' : 'CONFIRM BOOKING'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={onClear} style={sessionStyles.clearBtn} activeOpacity={0.7}>
              <Text style={sessionStyles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const sessionStyles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 100, justifyContent: 'flex-end', flexDirection: 'row' },
  panel: {
    width: width * 0.42,
    backgroundColor: colors.card,
    height: '100%',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    paddingHorizontal: 20,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontFamily: 'BodoniModa_400Regular', fontSize: 22, color: colors.foreground },
  closeBtn: { padding: 4 },
  closeText: { color: colors.muted, fontSize: 18 },
  clientInfo: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  clientName: { fontFamily: 'BodoniModa_400Regular', fontSize: 16, marginBottom: 2 },
  clientPhone: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: colors.muted },
  cartList: { flex: 1 },
  empty: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: colors.muted },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cartItemLeft: { flex: 1, marginRight: 8 },
  cartItemName: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, color: colors.foreground, marginBottom: 2 },
  cartItemVariant: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, color: colors.muted, marginBottom: 3 },
  cartItemPrice: { fontFamily: 'BodoniModa_400Regular', fontSize: 15 },
  removeBtn: { padding: 4 },
  removeBtnText: { color: colors.muted, fontSize: 14 },
  footer: { marginTop: 16, gap: 12 },
  totals: { gap: 6 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, color: colors.muted },
  totalValue: { fontFamily: 'BodoniModa_400Regular', fontSize: 16, color: colors.foreground },
  confirmBtn: { borderRadius: colors.radius, paddingVertical: 14, alignItems: 'center' },
  confirmBtnText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    letterSpacing: 1.5,
    color: '#000',
    fontWeight: '700',
  },
  clearBtn: { alignItems: 'center', paddingVertical: 6 },
  clearBtnText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: colors.muted, textDecorationLine: 'underline' },
});

function ProfileDrawer({ accent, onClose }: { accent: string; onClose: () => void }) {
  const { profile, updateProfile } = useSessionStore();
  const slideX = useRef(new Animated.Value(-width * 0.42)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideX, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      Animated.timing(bgOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  const close = () => {
    Animated.parallel([
      Animated.timing(slideX, { toValue: -width * 0.42, duration: 280, useNativeDriver: true }),
      Animated.timing(bgOpacity, { toValue: 0, duration: 230, useNativeDriver: true }),
    ]).start(onClose);
  };

  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);

  const save = () => {
    updateProfile({ name: name.trim(), phone: phone.trim() });
    close();
  };

  return (
    <View style={profileStyles.overlay}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        </Pressable>
      </Animated.View>

      <Animated.View style={[profileStyles.panel, { transform: [{ translateX: slideX }] }]}>
        <View style={profileStyles.header}>
          <Text style={profileStyles.title}>Profile</Text>
          <TouchableOpacity onPress={close} activeOpacity={0.7}>
            <Text style={{ color: colors.muted, fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={[profileStyles.avatar, { borderColor: accent }]}>
          <Text style={[profileStyles.avatarText, { color: accent }]}>
            {profile.name ? profile.name[0].toUpperCase() : '✦'}
          </Text>
        </View>

        <View style={profileStyles.field}>
          <Text style={[profileStyles.label, { color: accent }]}>Name</Text>
          <TextInput
            style={profileStyles.input}
            value={name}
            onChangeText={setName}
            placeholderTextColor="rgba(255,255,255,0.25)"
            placeholder="Your name"
            selectionColor={accent}
          />
        </View>
        <View style={profileStyles.field}>
          <Text style={[profileStyles.label, { color: accent }]}>Phone</Text>
          <TextInput
            style={profileStyles.input}
            value={phone}
            onChangeText={setPhone}
            placeholderTextColor="rgba(255,255,255,0.25)"
            placeholder="Your phone"
            keyboardType="phone-pad"
            selectionColor={accent}
          />
        </View>

        <View style={profileStyles.infoGrid}>
          {profile.birthday ? (
            <View style={profileStyles.infoItem}>
              <Text style={profileStyles.infoIcon}>🎂</Text>
              <Text style={profileStyles.infoText}>Birthday: {profile.birthday}</Text>
            </View>
          ) : null}
          {profile.anniversary ? (
            <View style={profileStyles.infoItem}>
              <Text style={profileStyles.infoIcon}>💍</Text>
              <Text style={profileStyles.infoText}>Anniversary: {profile.anniversary}</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={save}
          style={[profileStyles.saveBtn, { backgroundColor: accent }]}
          activeOpacity={0.85}
        >
          <Text style={profileStyles.saveBtnText}>SAVE</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const profileStyles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 100, flexDirection: 'row' },
  panel: {
    width: width * 0.38,
    backgroundColor: colors.card,
    height: '100%',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    paddingHorizontal: 20,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontFamily: 'BodoniModa_400Regular', fontSize: 22, color: colors.foreground },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  avatarText: { fontFamily: 'BodoniModa_400Regular', fontSize: 30 },
  field: { marginBottom: 16 },
  label: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, letterSpacing: 1.5, marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: colors.foreground,
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
  },
  infoGrid: { gap: 10, marginBottom: 24 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoIcon: { fontSize: 14 },
  infoText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: colors.muted },
  saveBtn: { borderRadius: colors.radius, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, letterSpacing: 2, color: '#000', fontWeight: '700' },
});

function DecisionModal({ service, accent, onAdd, onDismiss }: {
  service: Service;
  accent: string;
  onAdd: () => void;
  onDismiss: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 65, friction: 9, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={decisionStyles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      </Pressable>
      <Animated.View
        style={[decisionStyles.modal, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}
      >
        <Text style={decisionStyles.eyebrow}>PAIRS PERFECTLY WITH YOUR SELECTION</Text>
        <Text style={[decisionStyles.title, { color: accent }]}>{service.name}</Text>
        <Text style={decisionStyles.desc}>{service.description}</Text>
        <Text style={[decisionStyles.price, { color: accent }]}>
          ₹{service.price.toLocaleString('en-IN')} · {service.duration} min
        </Text>
        <View style={decisionStyles.btns}>
          <TouchableOpacity onPress={onDismiss} style={decisionStyles.dismissBtn} activeOpacity={0.75}>
            <Text style={decisionStyles.dismissText}>No thanks</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onAdd}
            style={[decisionStyles.addBtn, { backgroundColor: accent }]}
            activeOpacity={0.85}
          >
            <Text style={decisionStyles.addBtnText}>Add to Session</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const decisionStyles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 200, alignItems: 'center', justifyContent: 'center' },
  modal: {
    backgroundColor: colors.cardAlt,
    borderRadius: 20,
    padding: 28,
    width: width * 0.5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eyebrow: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 2,
    marginBottom: 10,
  },
  title: { fontFamily: 'BodoniModa_400Regular', fontSize: 22, marginBottom: 8, lineHeight: 28 },
  desc: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, color: colors.muted, lineHeight: 20, marginBottom: 12 },
  price: { fontFamily: 'BodoniModa_400Regular', fontSize: 18, marginBottom: 20 },
  btns: { flexDirection: 'row', gap: 10 },
  dismissBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  dismissText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: colors.muted },
  addBtn: { flex: 1.5, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  addBtnText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: '#000', fontWeight: '600' },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1 },
  contentArea: { flex: 1 },
});
