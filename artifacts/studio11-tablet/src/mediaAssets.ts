export const logoAsset: number = require('../../../attached_assets/logo_transparent.png');

export const categoryImages: Record<string, number> = {
  'HAIR STYLING': require('../../../attached_assets/Hair_Styling_1782099710436.png'),
  'HAIR TREATMENTS & SPAS': require('../../../attached_assets/Hair_Styling_1782099710436.png'),
  'BODY TREATMENTS': require('../../../attached_assets/Body_treatments_1782099710530.png'),
  'SKIN CARE': require('../../../attached_assets/skin-care_1782099710312.png'),
  'FACIALS': require('../../../attached_assets/Facials_1782099710482.png'),
  'NAIL CARE': require('../../../attached_assets/Mani-_Padi_1782099710395.png'),
  'MAKE UP': require('../../../attached_assets/Make-up_1782099710414.png'),
  'BRIDAL & GROMAL': require('../../../attached_assets/Groomal_1782099710464.png'),
  'MASSAGES & BODY SPA': require('../../../attached_assets/Body_treatments_1782099710530.png'),
};

export const maleCategoryVideos: Record<string, number> = {
  'HAIR STYLING_Cuts': require('../../../attached_assets/Male_Cuts_1782364361295.mp4'),
  'HAIR STYLING_Styling': require('../../../attached_assets/Male_Cuts_1782364361295.mp4'),
  'HAIR STYLING_Colors': require('../../../attached_assets/Male_colors_1782244651541.mp4'),
  'HAIR STYLING': require('../../../attached_assets/Male_Cuts_1782364361295.mp4'),
  'HAIR TREATMENTS & SPAS': require('../../../attached_assets/male_Hair_treatments_Spas2_1782364361261.mp4'),
  'BODY TREATMENTS': require('../../../attached_assets/Male_Body_treatments_1782364361317.mp4'),
  'SKIN CARE': require('../../../attached_assets/Male_Skin_Care_Mask_1782364361339.mp4'),
  'FACIALS': require('../../../attached_assets/Male_Facials_1782244651523.mp4'),
  'NAIL CARE': require('../../../attached_assets/Male-_Body_Spa_1782104764661.mp4'),
  'MAKE UP': require('../../../attached_assets/Male_Makeup_1782374586852.mp4'),
  'BRIDAL & GROMAL': require('../../../attached_assets/Male_Groomal_1782374586829.mp4'),
  'MASSAGES & BODY SPA': require('../../../attached_assets/Male-_Body_Spa_1782104764661.mp4'),
};

export const femaleCategoryVideos: Record<string, number> = {
  'HAIR STYLING_Cuts': require('../../../attached_assets/cuts_1781949331237.mp4'),
  'HAIR STYLING_Styling': require('../../../attached_assets/hair_Styling_1781949362487.mp4'),
  'HAIR STYLING_Colors': require('../../../attached_assets/colors_1781949381451.mp4'),
  'HAIR STYLING': require('../../../attached_assets/cuts_1781949331237.mp4'),
  'HAIR TREATMENTS & SPAS_Texture': require('../../../attached_assets/Texure_1782058341128.mp4'),
  'HAIR TREATMENTS & SPAS': require('../../../attached_assets/InShot_20260622_213343466_1782144367064.mp4'),
  'BODY TREATMENTS': require('../../../attached_assets/Female_Body_spa_1782104764707.mp4'),
  'SKIN CARE_De-Tan': require('../../../attached_assets/De-tan_1782058353670.mp4'),
  'SKIN CARE_Clean Up': require('../../../attached_assets/Clean_Up_1782058365550.mp4'),
  'SKIN CARE_Mask': require('../../../attached_assets/Mask_1782058380380.mp4'),
  'SKIN CARE': require('../../../attached_assets/De-tan_1782058353670.mp4'),
  'FACIALS': require('../../../attached_assets/Facials_1782057585099.mp4'),
  'NAIL CARE': require('../../../attached_assets/grok_video_2026-06-17-14-00-05_1781685081657.mp4'),
  'MAKE UP': require('../../../attached_assets/Female_makeup_1782244651585.mp4'),
  'BRIDAL & GROMAL': require('../../../attached_assets/grok_video_2026-06-17-17-44-23_1781699536476.mp4'),
  'MASSAGES & BODY SPA': require('../../../attached_assets/InShot_20260621_224522079_1782062291405.mp4'),
};

export function getVideoForCategory(gender: 'MALE' | 'FEMALE', category: string, subCategory?: string): number | null {
  const map = gender === 'MALE' ? maleCategoryVideos : femaleCategoryVideos;
  const key = subCategory ? `${category}_${subCategory}` : category;
  return map[key] ?? map[category] ?? null;
}
