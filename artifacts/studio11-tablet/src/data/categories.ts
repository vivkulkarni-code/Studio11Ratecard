import type { CategoryName, Gender } from '../store/sessionStore';

export interface CategoryConfig {
  name: CategoryName;
  shortName: string;
  genders: Gender[];
}

export const allCategories: CategoryConfig[] = [
  { name: 'HAIR STYLING', shortName: 'Hair Styling', genders: ['MALE', 'FEMALE'] },
  { name: 'HAIR TREATMENTS & SPAS', shortName: 'Hair Treats', genders: ['MALE', 'FEMALE'] },
  { name: 'BODY TREATMENTS', shortName: 'Body Treats', genders: ['MALE', 'FEMALE'] },
  { name: 'SKIN CARE', shortName: 'Skin Care', genders: ['MALE', 'FEMALE'] },
  { name: 'FACIALS', shortName: 'Facials', genders: ['MALE', 'FEMALE'] },
  { name: 'NAIL CARE', shortName: 'Nail Care', genders: ['MALE', 'FEMALE'] },
  { name: 'MAKE UP', shortName: 'Make Up', genders: ['MALE', 'FEMALE'] },
  { name: 'BRIDAL & GROMAL', shortName: 'Bridal', genders: ['MALE', 'FEMALE'] },
  { name: 'MASSAGES & BODY SPA', shortName: 'Massage', genders: ['MALE', 'FEMALE'] },
];

export function getCategoriesForGender(gender: Gender): CategoryConfig[] {
  return allCategories.filter(c => c.genders.includes(gender));
}
