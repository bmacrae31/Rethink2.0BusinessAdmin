import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Copy } from 'lucide-react';
import { useOfferStore } from '../../store/offerStore';
import { useMembershipStore } from '../../store/membershipStore';
import { Offer } from '../../types/offer';
import ImageUpload from './ImageUpload';
import toast from 'react-hot-toast';

interface EditOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: Offer;
}

export default function EditOfferModal({ isOpen, onClose, offer }: EditOfferModalProps) {
  const memberships = useMembershipStore((state) => Object.values(state.memberships));
  const updateOffer = useOfferStore((state) => state.updateOffer);

  const [formData, setFormData] = useState({
    title: offer.title,
    description: offer.description,
    imageUrl: offer.imageUrl || '',
    price: offer.price.toString(),
    originalPrice: offer.originalPrice?.toString() || '',
    quantityLimit: offer.quantityLimit?.toString() || '',
    startDate: offer.startDate.split('T')[0],
    endDate: offer.endDate.split('T')[0],
    status: offer.status,
    membershipTiers: offer.membershipTiers,
    metadata: {
      termsAndConditions: offer.metadata?.termsAndConditions || '',
      redemptionInstructions: offer.metadata?.redemptionInstructions || '',
      marketingCopy: offer.metadata?.marketingCopy || '',
      highlightFeatures: offer.metadata?.highlightFeatures || [],
      socialShareText: offer.metadata?.socialShareText || '',
      displayPriority: offer.metadata?.displayPriority || 'normal'
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updatedOffer = await updateOffer(offer.id, {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        quantityLimit: formData.quantityLimit ? parseInt(formData.quantityLimit) : undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      });

      if (updatedOffer) {
        toast.success('Offer updated successfully');
        onClose();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update offer');
    }
  };

  const handleDuplicate = () => {
    // Create a copy of the offer with a new name
    const duplicateData = {
      ...formData,
      title: `${formData.title} (Copy)`,
      status: 'draft' as const
    };

    try {
      const newOffer = useOfferStore.getState().createOffer({
        ...duplicateData,
        price: parseFloat(duplicateData.price),
        originalPrice: duplicateData.originalPrice ? parseFloat(duplicateData.originalPrice) : undefined,
        quantityLimit: duplicateData.quantityLimit ? parseInt(duplicateData.quantityLimit) : undefined,
        startDate: new Date(duplicateData.startDate).toISOString(),
        endDate: new Date(duplicateData.endDate).toISOString()
      });

      toast.success('Offer duplicated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to duplicate offer');
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 flex items-center justify-between">
                      <span>Edit Offer</span>
                      <button
                        type="button"
                        onClick={handleDuplicate}
                        className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Duplicate
                      </button>
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                      {/* Basic Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Offer Title
                          </label>
                          <input
                            type="text"
                            id="title"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
                          />
                        </div>

                        <div className="col-span-2">
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            id="description"
                            required
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
                          />
                        </div>

                        <div>
                          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                            Price ($)
                          </label>
                          <input
                            type="number"
                            id="price"
                            required
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
                          />
                        </div>

                        <div>
                          <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700">
                            Original Price ($)
                          </label>
                          <input
                            type="number"
                            id="originalPrice"
                            min="0"
                            step="0.01"
                            value={formData.originalPrice}
                            onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
                          />
                        </div>
                      </div>

                      {/* Image Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Offer Image
                        </label>
                        <ImageUpload
                          onImageSelect={(file) => {
                            // In production, implement proper image upload
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({ ...formData, imageUrl: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }}
                          previewUrl={formData.imageUrl}
                          onClear={() => setFormData({ ...formData, imageUrl: '' })}
                        />
                      </div>

                      {/* Marketing Settings */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Marketing Settings</h4>
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="marketingCopy" className="block text-sm font-medium text-gray-700">
                              Marketing Copy
                            </label>
                            <textarea
                              id="marketingCopy"
                              rows={3}
                              value={formData.metadata.marketingCopy}
                              onChange={(e) => setFormData({
                                ...formData,
                                metadata: { ...formData.metadata, marketingCopy: e.target.value }
                              })}
                              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
                              placeholder="Enter compelling marketing copy for this offer..."
                            />
                          </div>

                          <div>
                            <label htmlFor="socialShareText" className="block text-sm font-medium text-gray-700">
                              Social Share Text
                            </label>
                            <textarea
                              id="socialShareText"
                              rows={2}
                              value={formData.metadata.socialShareText}
                              onChange={(e) => setFormData({
                                ...formData,
                                metadata: { ...formData.metadata, socialShareText: e.target.value }
                              })}
                              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
                              placeholder="Enter text for social media sharing..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Display Priority
                            </label>
                            <select
                              value={formData.metadata.displayPriority}
                              onChange={(e) => setFormData({
                                ...formData,
                                metadata: { ...formData.metadata, displayPriority: e.target.value }
                              })}
                              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
                            >
                              <option value="low">Low Priority</option>
                              <option value="normal">Normal Priority</option>
                              <option value="high">High Priority</option>
                              <option value="featured">Featured</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Visibility and Status */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Visibility & Status</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                              Status
                            </label>
                            <select
                              id="status"
                              value={formData.status}
                              onChange={(e) => setFormData({
                                ...formData,
                                status: e.target.value as Offer['status']
                              })}
                              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
                            >
                              <option value="draft">Draft</option>
                              <option value="active">Active</option>
                              <option value="paused">Paused</option>
                              <option value="expired">Expired</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Available to Membership Tiers
                            </label>
                            <div className="mt-2 space-y-2">
                              {memberships.map((membership) => (
                                <label key={membership.id} className="inline-flex items-center mr-4">
                                  <input
                                    type="checkbox"
                                    checked={formData.membershipTiers.includes(membership.id)}
                                    onChange={(e) => {
                                      const newTiers = e.target.checked
                                        ? [...formData.membershipTiers, membership.id]
                                        : formData.membershipTiers.filter(id => id !== membership.id);
                                      setFormData({ ...formData, membershipTiers: newTiers });
                                    }}
                                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">{membership.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          className="inline-flex w-full justify-center rounded-md border border-transparent bg-gray-900 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={onClose}
                          className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}