import photo1 from '@assets/Picsart_24-07-12_14-12-25-736_1782162273208.png';
import photo2 from '@assets/Picsart_24-07-12_14-16-03-557_1782162273275.png';
import photo3 from '@assets/Picsart_24-07-12_14-25-05-857_1782162273309.png';
import photo4 from '@assets/Picsart_24-07-12_14-27-12-630_1782162273360.png';
import photo5 from '@assets/Picsart_24-07-12_15-37-48-757_1782162273399.png';

export interface GalleryPhoto {
  id: string;
  src: string;
  category: string;
  caption?: string;
}

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  { id: 'g1', src: photo1, category: 'Hair Color',   caption: 'Multi-tone Highlights' },
  { id: 'g2', src: photo2, category: 'Hair Styling', caption: 'Layered Blowout' },
  { id: 'g3', src: photo3, category: 'Hair Color',   caption: 'Balayage & Curls' },
  { id: 'g4', src: photo4, category: 'Hair Styling', caption: 'Voluminous Layers' },
  { id: 'g5', src: photo5, category: 'Hair Styling', caption: 'Highlights & Styling' },
];
