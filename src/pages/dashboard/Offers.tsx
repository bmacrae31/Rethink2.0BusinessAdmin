import { useState } from 'react';
import { Plus, Search, Filter, Tag, Edit, Copy, Eye, Trash2 } from 'lucide-react';
import { useOfferStore } from '../../store/offerStore';
import CreateOfferModal from '../../components/offers/CreateOfferModal';
import EditOfferModal from '../../components/offers/EditOfferModal';
import OfferAnalytics from '../../components/offers/OfferAnalytics';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Offers() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  
  const offers = useOfferStore((state) => Object.values(state.offers));
  const deleteOffer = useOfferStore((state) => state.deleteOffer);

  const filteredOffers = offers.filter(offer =>
    (searchTerm === '' || 
     offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     offer.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedStatus.length === 0 || selectedStatus.includes(offer.status))
  );

  const handleDelete = (offerId: string) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      deleteOffer(offerId);
      toast.success('Offer deleted successfully');
    }
  };

  const handleDuplicate = (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;

    const { createOffer } = useOfferStore.getState();
    const newOffer = createOffer({
      ...offer,
      title: `${offer.title} (Copy)`,
      status: 'draft',
      id: undefined,
      redemptionCount: undefined,
      createdAt: undefined,
      updatedAt: undefined
    });

    toast.success('Offer duplicated successfully');
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Special Offers</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create and manage special offers for your members.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Offer
          </button>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mt-8">
        <OfferAnalytics />
      </div>

      {/* Filters */}
      <div className="mt-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-lg border-gray-300 pl-10 focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => {
                const options = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedStatus(options);
              }}
              className="rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
              multiple
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="expired">Expired</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredOffers.map((offer) => (
          <div
            key={offer.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            {offer.imageUrl && (
              <div className="relative">
                <img
                  src={offer.imageUrl}
                  alt={offer.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button
                    onClick={() => setEditingOffer(offer.id)}
                    className="p-1 rounded-full bg-white shadow-md hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(offer.id)}
                    className="p-1 rounded-full bg-white shadow-md hover:bg-gray-100"
                  >
                    <Copy className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="p-1 rounded-full bg-white shadow-md hover:bg-gray-100"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{offer.title}</h3>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    offer.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : offer.status === 'draft'
                      ? 'bg-gray-100 text-gray-800'
                      : offer.status === 'expired'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4">{offer.description}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Price</span>
                  <span className="font-medium text-gray-900">${offer.price.toFixed(2)}</span>
                </div>

                {offer.originalPrice && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Original Price</span>
                    <span className="text-gray-500 line-through">
                      ${offer.originalPrice.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Valid Until</span>
                  <span className="text-gray-900">
                    {format(new Date(offer.endDate), 'MMM d, yyyy')}
                  </span>
                </div>

                {offer.quantityLimit && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Remaining</span>
                    <span className="text-gray-900">
                      {Math.max(0, offer.quantityLimit - offer.redemptionCount)} of {offer.quantityLimit}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {offer.membershipTiers.map((tierId) => (
                    <span
                      key={tierId}
                      className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tierId}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CreateOfferModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {editingOffer && (
        <EditOfferModal
          isOpen={true}
          onClose={() => setEditingOffer(null)}
          offer={offers.find(o => o.id === editingOffer)!}
        />
      )}
    </div>
  );
}