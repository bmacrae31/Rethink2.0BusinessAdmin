import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Offer, OfferRedemption } from '../types/offer';

interface OfferState {
  offers: Record<string, Offer>;
  redemptions: Record<string, OfferRedemption>;
  createOffer: (data: Omit<Offer, 'id' | 'redemptionCount' | 'createdAt' | 'updatedAt'>) => Offer;
  updateOffer: (id: string, updates: Partial<Omit<Offer, 'id' | 'createdAt'>>) => Offer | null;
  deleteOffer: (id: string) => boolean;
  getOffer: (id: string) => Offer | null;
  redeemOffer: (offerId: string, memberId: string) => Promise<OfferRedemption | null>;
  getOfferRedemptions: (offerId: string) => OfferRedemption[];
  getMemberRedemptions: (memberId: string) => OfferRedemption[];
}

export const useOfferStore = create<OfferState>()(
  persist(
    (set, get) => ({
      offers: {},
      redemptions: {},

      createOffer: (data) => {
        const now = new Date().toISOString();
        const offer: Offer = {
          ...data,
          id: uuidv4(),
          redemptionCount: 0,
          createdAt: now,
          updatedAt: now
        };

        set((state) => ({
          offers: { ...state.offers, [offer.id]: offer }
        }));

        return offer;
      },

      updateOffer: (id, updates) => {
        const offer = get().offers[id];
        if (!offer) return null;

        const updatedOffer: Offer = {
          ...offer,
          ...updates,
          updatedAt: new Date().toISOString()
        };

        set((state) => ({
          offers: { ...state.offers, [id]: updatedOffer }
        }));

        return updatedOffer;
      },

      deleteOffer: (id) => {
        const offer = get().offers[id];
        if (!offer) return false;

        set((state) => {
          const { [id]: _, ...rest } = state.offers;
          return { offers: rest };
        });

        return true;
      },

      getOffer: (id) => {
        return get().offers[id] || null;
      },

      redeemOffer: async (offerId: string, memberId: string) => {
        const offer = get().offers[offerId];
        if (!offer) return null;

        // Check if quantity limit is reached
        if (offer.quantityLimit && offer.redemptionCount >= offer.quantityLimit) {
          throw new Error('Offer redemption limit reached');
        }

        // Check if offer is active
        const now = new Date();
        const startDate = new Date(offer.startDate);
        const endDate = new Date(offer.endDate);
        
        if (now < startDate || now > endDate || offer.status !== 'active') {
          throw new Error('Offer is not currently active');
        }

        const redemption: OfferRedemption = {
          id: uuidv4(),
          offerId,
          memberId,
          redeemedAt: now.toISOString(),
          status: 'completed'
        };

        set((state) => ({
          redemptions: { ...state.redemptions, [redemption.id]: redemption },
          offers: {
            ...state.offers,
            [offerId]: {
              ...offer,
              redemptionCount: offer.redemptionCount + 1,
              updatedAt: now.toISOString()
            }
          }
        }));

        return redemption;
      },

      getOfferRedemptions: (offerId: string) => {
        return Object.values(get().redemptions)
          .filter(redemption => redemption.offerId === offerId)
          .sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime());
      },

      getMemberRedemptions: (memberId: string) => {
        return Object.values(get().redemptions)
          .filter(redemption => redemption.memberId === memberId)
          .sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime());
      }
    }),
    {
      name: 'offer-storage',
      version: 1
    }
  )
);