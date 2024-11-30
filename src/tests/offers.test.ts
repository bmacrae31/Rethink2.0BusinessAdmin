import { describe, it, expect, beforeEach } from 'vitest';
import { useOfferStore } from '../store/offerStore';
import { Offer } from '../types/offer';

describe('Offer Store', () => {
  let store: ReturnType<typeof useOfferStore>;
  
  beforeEach(() => {
    store = useOfferStore.getState();
    useOfferStore.setState({ offers: {}, redemptions: {} });
  });

  const mockOffer: Omit<Offer, 'id' | 'redemptionCount' | 'createdAt' | 'updatedAt'> = {
    title: 'Test Offer',
    description: 'Test Description',
    price: 99.99,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000).toISOString(),
    status: 'draft',
    membershipTiers: ['tier1']
  };

  it('should create an offer', () => {
    const offer = store.createOffer(mockOffer);
    expect(offer.id).toBeDefined();
    expect(offer.title).toBe(mockOffer.title);
    expect(offer.redemptionCount).toBe(0);
  });

  it('should update an offer', () => {
    const offer = store.createOffer(mockOffer);
    const updated = store.updateOffer(offer.id, { title: 'Updated Title' });
    expect(updated?.title).toBe('Updated Title');
  });

  it('should delete an offer', () => {
    const offer = store.createOffer(mockOffer);
    const result = store.deleteOffer(offer.id);
    expect(result).toBe(true);
    expect(store.getOffer(offer.id)).toBeNull();
  });

  it('should redeem an offer', async () => {
    const offer = store.createOffer({ ...mockOffer, status: 'active' });
    const redemption = await store.redeemOffer(offer.id, 'member1');
    expect(redemption?.status).toBe('completed');
    
    const updatedOffer = store.getOffer(offer.id);
    expect(updatedOffer?.redemptionCount).toBe(1);
  });

  it('should not redeem an expired offer', async () => {
    const offer = store.createOffer({
      ...mockOffer,
      status: 'active',
      endDate: new Date(Date.now() - 86400000).toISOString()
    });
    
    await expect(store.redeemOffer(offer.id, 'member1')).rejects.toThrow();
  });

  it('should not redeem beyond quantity limit', async () => {
    const offer = store.createOffer({
      ...mockOffer,
      status: 'active',
      quantityLimit: 1
    });
    
    await store.redeemOffer(offer.id, 'member1');
    await expect(store.redeemOffer(offer.id, 'member2')).rejects.toThrow();
  });
});