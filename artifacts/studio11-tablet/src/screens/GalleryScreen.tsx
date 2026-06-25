import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSessionStore } from '../store/sessionStore';
import { bundledGalleryPhotos, galleryCategories } from '../data/galleryPhotos';
import { logoAsset } from '../mediaAssets';
import colors from '../../constants/colors';
import { useAccentColor } from '../hooks/useAccentColor';
import { getStudio11Dir, requestStoragePermission } from '../utils/storage';

const { width, height } = Dimensions.get('window');
const COLS = 3;
const THUMB_SIZE = (width - 32 - 16) / COLS;

interface DevicePhoto {
  id: string;
  uri: string;
  category: string;
}

export default function GalleryScreen() {
  const setAppScreen = useSessionStore(s => s.setAppScreen);
  const accent = useAccentColor();
  const [activeCategory, setActiveCategory] = useState('All');
  const [devicePhotos, setDevicePhotos] = useState<DevicePhoto[]>([]);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [lightboxUri, setLightboxUri] = useState<string | null>(null);

  useEffect(() => {
    loadDevicePhotos();
  }, []);

  const loadDevicePhotos = async () => {
    const granted = await requestStoragePermission();
    if (!granted) {
      setPermissionDenied(true);
      return;
    }
    setPermissionDenied(false);
    try {
      const dir = getStudio11Dir('OurWork');
      if (!dir.exists) return;
      const files = dir.list();
      const imgs = files
        .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f.uri.split('/').pop() ?? ''))
        .map((f, i) => ({ id: `dev-${i}`, uri: f.uri, category: 'Our Work' }));
      setDevicePhotos(imgs);
    } catch {
      // no device photos
    }
  };

  // Device filesystem photos first, then bundled gallery photos
  const allPhotos = [
    ...devicePhotos.map(p => ({
      id: p.id,
      source: undefined as number | undefined,
      category: p.category,
      uri: p.uri as string | undefined,
    })),
    ...bundledGalleryPhotos.map(p => ({
      id: p.id,
      source: p.source as number | undefined,
      category: p.category,
      uri: undefined as string | undefined,
    })),
  ];

  const categories = [
    ...galleryCategories,
    ...(devicePhotos.length ? ['Our Work'] : []),
  ];

  const filtered = activeCategory === 'All'
    ? allPhotos
    : allPhotos.filter(p => p.category === activeCategory);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setAppScreen('main')} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={[styles.backText, { color: accent }]}>← Back</Text>
        </TouchableOpacity>
        <Image source={logoAsset} style={styles.logo} resizeMode="contain" />
        <TouchableOpacity onPress={loadDevicePhotos} style={styles.refreshBtn} activeOpacity={0.7}>
          <Text style={[styles.refreshText, { color: accent }]}>↺ Refresh</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Our Work</Text>
      <Text style={styles.sub}>A curated collection of our finest transformations</Text>

      {permissionDenied && (
        <View style={styles.permissionBanner}>
          <Text style={styles.permissionText}>
            Storage permission is needed to load photos from the tablet's Documents folder.
          </Text>
          <TouchableOpacity onPress={loadDevicePhotos} style={[styles.permissionBtn, { borderColor: accent }]}>
            <Text style={[styles.permissionBtnText, { color: accent }]}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, flexDirection: 'row' }}>
          {['All', ...categories].map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.filterChip,
                activeCategory === cat && { backgroundColor: accent, borderColor: accent },
              ]}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterText, activeCategory === cat && { color: '#000' }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={COLS}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ gap: 8, marginBottom: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setLightboxUri(item.uri ?? String(item.id))}
            activeOpacity={0.85}
            style={styles.thumb}
          >
            {item.source ? (
              <Image source={item.source} style={styles.thumbImg} resizeMode="cover" />
            ) : item.uri ? (
              <Image source={{ uri: item.uri }} style={styles.thumbImg} resizeMode="cover" />
            ) : null}
            <View style={styles.thumbOverlay} />
          </TouchableOpacity>
        )}
      />

      {lightboxUri && (
        <Modal transparent visible animationType="fade" onRequestClose={() => setLightboxUri(null)}>
          <TouchableOpacity style={styles.lightbox} activeOpacity={1} onPress={() => setLightboxUri(null)}>
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
            {lightboxUri.startsWith('file://') || lightboxUri.startsWith('http') ? (
              <Image source={{ uri: lightboxUri }} style={styles.lightboxImg} resizeMode="contain" />
            ) : (
              <Image
                source={bundledGalleryPhotos.find(p => p.id === lightboxUri)?.source as number}
                style={styles.lightboxImg}
                resizeMode="contain"
              />
            )}
            <TouchableOpacity onPress={() => setLightboxUri(null)} style={styles.lightboxClose}>
              <Text style={styles.lightboxCloseText}>✕</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 8,
  },
  backBtn: { padding: 8, minWidth: 60 },
  backText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 15 },
  logo: { width: 90, height: 44 },
  refreshBtn: { padding: 8, minWidth: 60, alignItems: 'flex-end' },
  refreshText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14 },
  title: {
    fontFamily: 'BodoniModa_400Regular',
    fontSize: 34,
    color: colors.foreground,
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 4,
  },
  sub: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 8,
  },
  permissionBanner: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    alignItems: 'center',
    gap: 8,
  },
  permissionText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },
  permissionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 20,
  },
  permissionBtnText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  filterRow: { marginBottom: 12 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  filterText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: colors.muted,
    letterSpacing: 0.5,
  },
  grid: { paddingHorizontal: 16, paddingBottom: 40 },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  thumbImg: { width: '100%', height: '100%' },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  lightbox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxImg: {
    width: width * 0.85,
    height: height * 0.75,
    borderRadius: 12,
  },
  lightboxClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxCloseText: { color: '#fff', fontSize: 16 },
});
