import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSessionStore } from '../store/sessionStore';
import { logoAsset } from '../mediaAssets';
import colors from '../../constants/colors';
import { useAccentColor } from '../hooks/useAccentColor';
import { getStudio11Dir, requestStoragePermission, ensureStudio11Dir } from '../utils/storage';

const { width, height } = Dimensions.get('window');
const COLS = 4;
const THUMB_SIZE = (width - 40 - 12 * (COLS - 1)) / COLS;

interface Product {
  id: string;
  uri: string;
  name: string;
}

export default function ProductsScreen() {
  const setAppScreen = useSessionStore(s => s.setAppScreen);
  const accent = useAccentColor();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [lightbox, setLightbox] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const granted = await requestStoragePermission();
    if (!granted) {
      setPermissionDenied(true);
      setLoading(false);
      return;
    }
    setPermissionDenied(false);
    try {
      const dir = await ensureStudio11Dir('Products');
      const files = dir.list();
      const imgs = files
        .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f.uri.split('/').pop() ?? ''))
        .map((f, i) => {
          const filename = f.uri.split('/').pop() ?? '';
          return {
            id: `prod-${i}`,
            uri: f.uri,
            name: filename.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '),
          };
        });
      setProducts(imgs);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setAppScreen('main')} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={[styles.backText, { color: accent }]}>← Back</Text>
        </TouchableOpacity>
        <Image source={logoAsset} style={styles.logo} resizeMode="contain" />
        <TouchableOpacity onPress={loadProducts} style={styles.refreshBtn} activeOpacity={0.7}>
          <Text style={[styles.refreshText, { color: accent }]}>↺ Refresh</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Products</Text>
      <Text style={styles.sub}>Explore our curated product collection</Text>

      {permissionDenied ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyTitle}>Storage Permission Required</Text>
          <Text style={styles.emptyDesc}>
            This app needs access to your tablet's storage to display products.
          </Text>
          <TouchableOpacity
            onPress={loadProducts}
            style={[styles.reloadBtn, { borderColor: accent }]}
            activeOpacity={0.75}
          >
            <Text style={[styles.reloadText, { color: accent }]}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={accent} size="large" />
          <Text style={styles.loadingText}>Loading products…</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No Products Yet</Text>
          <Text style={styles.emptyDesc}>
            Place product images in:{'\n'}
            <Text style={[styles.emptyPath, { color: accent }]}>
              Documents/Studio11/Products/
            </Text>
            {'\n\n'}
            Supported formats: JPG, PNG, WebP
          </Text>
          <TouchableOpacity
            onPress={loadProducts}
            style={[styles.reloadBtn, { borderColor: accent }]}
            activeOpacity={0.75}
          >
            <Text style={[styles.reloadText, { color: accent }]}>Reload</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={p => p.id}
          numColumns={COLS}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setLightbox(item)}
              activeOpacity={0.85}
              style={styles.card}
            >
              <Image source={{ uri: item.uri }} style={styles.cardImg} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.cardGradient}
              />
              <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {lightbox && (
        <Modal transparent visible animationType="fade" onRequestClose={() => setLightbox(null)}>
          <TouchableOpacity style={styles.lightbox} activeOpacity={1} onPress={() => setLightbox(null)}>
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
            <Image source={{ uri: lightbox.uri }} style={styles.lightboxImg} resizeMode="contain" />
            <Text style={styles.lightboxName}>{lightbox.name}</Text>
            <TouchableOpacity onPress={() => setLightbox(null)} style={styles.lightboxClose}>
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
    marginBottom: 20,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: colors.muted,
    marginTop: 12,
  },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyTitle: {
    fontFamily: 'BodoniModa_400Regular',
    fontSize: 24,
    color: colors.foreground,
    marginBottom: 12,
  },
  emptyDesc: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  emptyPath: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
  },
  reloadBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderRadius: colors.radius,
  },
  reloadText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    letterSpacing: 1.5,
  },
  grid: { paddingHorizontal: 16, paddingBottom: 40 },
  card: {
    width: THUMB_SIZE,
    height: THUMB_SIZE * 1.25,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  cardImg: { ...StyleSheet.absoluteFillObject },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: THUMB_SIZE * 0.5,
  },
  cardName: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 11,
    color: '#fff',
    letterSpacing: 0.5,
  },
  lightbox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxImg: {
    width: width * 0.8,
    height: height * 0.7,
    borderRadius: 12,
  },
  lightboxName: {
    fontFamily: 'BodoniModa_400Regular',
    fontSize: 20,
    color: '#fff',
    marginTop: 20,
    textAlign: 'center',
    textTransform: 'capitalize',
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
