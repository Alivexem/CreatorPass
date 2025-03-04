export interface PassRules {
  allowChat: 'silver' | 'all' | 'none';
  allowInteractions: 'bronze' | 'all' | 'none';
  allowDownload: 'bronze' | 'all' | 'none';
  allowGifting: 'all';
}

export interface Pass {
  _id: string;
  category: 'Bronze' | 'Silver' | 'Gold' | 'Free';
  price: number;
  expirationDays: number | null;
  imageUrl: string;
  mintCount: number;
  createdAt: string;
  address: string;
  ownerUsername: string;
  ownerImage: string;
  cardTag: string;
  rules: PassRules;
  owners: string[]; // List of addresses that own this pass
}

export const DEFAULT_RULES: PassRules = {
  allowChat: 'silver',
  allowInteractions: 'bronze',
  allowDownload: 'bronze',
  allowGifting: 'all'
}; 