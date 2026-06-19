/**
 * Cross-sell recommendations derived from Studio11 sales data analysis.
 * Source: 18,944 bills across 2024–2025, 8,075 multi-service bills.
 *
 * Top co-purchase pairs (male):
 *   BEARD_GROOM + HAIR_CUT      1,972×
 *   CLEAN_MASK  + HAIR_CUT        194×
 *   HAIR_CUT    + HAIR_TREATMENT  184×
 *   HAIR_CUT    + HEAD_MASSAGE    141×
 *   HAIR_COLOR  + HAIR_CUT        106×
 *   BEARD_GROOM + HAIR_TREATMENT   64×
 *   BEARD_GROOM + CLEAN_MASK       57×
 *
 * Top co-purchase pairs (female):
 *   THREADING   + WAXING        1,351×
 *   HAIR_CUT    + THREADING       440×
 *   HAIR_STYLE  + THREADING       240×
 *   HAIR_CUT    + HAIR_TREATMENT  170×
 *   CLEAN_MASK  + THREADING       163×
 *   HAIR_COLOR  + HAIR_CUT        141×
 *   HAIR_TREATMENT + THREADING    132×
 *   HAIR_COLOR  + THREADING       131×
 *   HAIR_CUT    + WAXING          125×
 *   CLEAN_MASK  + WAXING          102×
 */

import { CategoryName, Gender, Service } from '@/store/sessionStore';
import { maleServices, femaleServices } from '@/data/services';

type SubCatHint = Partial<Record<CategoryName, string>>;

interface Rule {
  categories: CategoryName[];
  preferSubCategory?: SubCatHint;
}

const MALE_RULES: Partial<Record<CategoryName, Rule>> = {
  'HAIR STYLING': {
    // 1,972× beard, 194× clean-up, 184× treatment, 141× head massage
    categories: ['GROOMAL', 'SKIN CARE', 'HAIR TREATMENTS & SPAS', 'SPAS & MASSAGE'],
    preferSubCategory: { 'SKIN CARE': 'Clean Up', 'SPAS & MASSAGE': 'Head Massage' },
  },
  'GROOMAL': {
    // 1,972× haircut, 64× treatment, 57× clean-up
    categories: ['HAIR STYLING', 'SKIN CARE', 'HAIR TREATMENTS & SPAS'],
    preferSubCategory: { 'SKIN CARE': 'Clean Up', 'HAIR TREATMENTS & SPAS': 'Treatments' },
  },
  'HAIR TREATMENTS & SPAS': {
    // 184× haircut, 64× beard, 36× clean-up
    categories: ['HAIR STYLING', 'GROOMAL', 'SKIN CARE'],
    preferSubCategory: { 'SKIN CARE': 'Clean Up' },
  },
  'SKIN CARE': {
    // 194× haircut, 36× treatment, 19× head massage
    categories: ['HAIR STYLING', 'GROOMAL', 'SPAS & MASSAGE'],
    preferSubCategory: { 'SPAS & MASSAGE': 'Head Massage' },
  },
  'FACIALS': {
    // 16× haircut, body spa
    categories: ['HAIR STYLING', 'SKIN CARE', 'SPAS & MASSAGE'],
    preferSubCategory: { 'SPAS & MASSAGE': 'Head Massage' },
  },
  'SPAS & MASSAGE': {
    // 24× haircut, 22× beard, 13× clean-up
    categories: ['HAIR STYLING', 'GROOMAL', 'SKIN CARE'],
    preferSubCategory: { 'SKIN CARE': 'Clean Up' },
  },
};

const FEMALE_RULES: Partial<Record<CategoryName, Rule>> = {
  'HAIR STYLING': {
    // 486× threading, 176× treatment, 150× waxing, 65× hair spa
    categories: ['BODY TREATMENTS', 'HAIR TREATMENTS & SPAS', 'SKIN CARE'],
    preferSubCategory: {
      'BODY TREATMENTS': 'Threading',
      'HAIR TREATMENTS & SPAS': 'Treatments',
      'SKIN CARE': 'Clean Up',
    },
  },
  'HAIR TREATMENTS & SPAS': {
    // 464× haircut, 186× threading, 85× waxing, 83× clean-up
    categories: ['HAIR STYLING', 'BODY TREATMENTS', 'SKIN CARE'],
    preferSubCategory: { 'BODY TREATMENTS': 'Threading', 'SKIN CARE': 'Clean Up' },
  },
  'BODY TREATMENTS': {
    // Threading ↔ Waxing handled inline (1,572×); then 459× haircut, 198× clean-up, 103× mani-pedi
    categories: ['HAIR STYLING', 'SKIN CARE', 'MANI PADI'],
    preferSubCategory: { 'SKIN CARE': 'Clean Up' },
  },
  'SKIN CARE': {
    // 183× threading, 138× waxing, 32× haircut, 31× facial
    categories: ['BODY TREATMENTS', 'HAIR STYLING', 'FACIALS'],
    preferSubCategory: { 'BODY TREATMENTS': 'Threading' },
  },
  'FACIALS': {
    // 75× threading, 48× waxing, 25× haircut, 31× clean-up
    categories: ['BODY TREATMENTS', 'SKIN CARE', 'MANI PADI'],
    preferSubCategory: { 'BODY TREATMENTS': 'Threading', 'SKIN CARE': 'Clean Up' },
  },
  'MANI PADI': {
    // 86× threading, 59× waxing, 75× hair style
    categories: ['BODY TREATMENTS', 'HAIR STYLING', 'SKIN CARE'],
    preferSubCategory: { 'BODY TREATMENTS': 'Threading', 'SKIN CARE': 'Clean Up' },
  },
  'SPAS & MASSAGE': {
    // 62× threading, 43× waxing, 87× hair style
    categories: ['BODY TREATMENTS', 'HAIR STYLING', 'SKIN CARE'],
    preferSubCategory: { 'BODY TREATMENTS': 'Threading', 'SKIN CARE': 'Clean Up' },
  },
  'MAKEUP': {
    categories: ['HAIR STYLING', 'FACIALS', 'BRIDAL'],
  },
  'BRIDAL': {
    categories: ['MAKEUP', 'HAIR STYLING', 'FACIALS'],
  },
};

/**
 * Pick the best candidate from a list:
 * - If a preferred sub-category hint is given, prefer the cheapest from that sub-category.
 * - Otherwise pick the cheapest non-zero service (entry-level add-on converts best).
 */
function pickBest(
  candidates: Service[],
  preferSubCat: string | undefined
): Service | undefined {
  if (candidates.length === 0) return undefined;
  if (preferSubCat) {
    const preferred = candidates.filter(s => s.subCategory === preferSubCat);
    if (preferred.length > 0) {
      return preferred.slice().sort((a, b) => a.price - b.price)[0];
    }
  }
  return candidates.slice().sort((a, b) => a.price - b.price)[0];
}

export function getRecommendations(
  addedService: Service,
  gender: Gender,
  sessionServiceIds: Set<string>
): Service[] {
  const allServices = gender === 'MALE' ? maleServices : femaleServices;

  const alreadyAdded = (s: Service) =>
    sessionServiceIds.has(s.id) || s.id === addedService.id;

  const availableIn = (cat: CategoryName, subCat?: string) =>
    allServices.filter(
      s =>
        s.category === cat &&
        s.price > 0 &&
        !alreadyAdded(s) &&
        (!subCat || s.subCategory === subCat)
    );

  const picks: Service[] = [];

  // ── Special case: BODY TREATMENTS — threading ↔ waxing (1,572× co-purchase) ──
  if (gender === 'FEMALE' && addedService.category === 'BODY TREATMENTS') {
    const isThreading = addedService.subCategory === 'Threading';
    const crossSubCat = isThreading ? 'Waxing' : 'Threading';
    const crossPool = availableIn('BODY TREATMENTS', crossSubCat);
    const cross = pickBest(crossPool, crossSubCat);
    if (cross) picks.push(cross);
  }

  // ── Standard category recommendations ─────────────────────────────────────
  const rules =
    gender === 'MALE'
      ? MALE_RULES[addedService.category]
      : FEMALE_RULES[addedService.category];

  if (rules) {
    for (const cat of rules.categories) {
      if (picks.length >= 3) break;
      const hint = rules.preferSubCategory?.[cat];
      const pool = availableIn(cat);
      const pick = pickBest(pool, hint);
      if (pick && !picks.some(p => p.id === pick.id)) picks.push(pick);
    }
  }

  return picks.slice(0, 3);
}
