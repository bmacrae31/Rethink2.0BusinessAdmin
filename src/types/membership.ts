// Add to existing types
export interface StorefrontContent {
  displayOrder: number;
  isHidden: boolean;
  visibilityType: 'public' | 'private' | 'hidden';
  allowedMemberIds?: string[];
  salesCopy: {
    title: string;
    description: string;
    features: string;
    callToAction: string;
  };
}