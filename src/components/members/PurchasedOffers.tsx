import { format } from 'date-fns';
import { useOfferStore } from '../../store/offerStore';
import { Member } from '../../types/member';
import { Tag, Clock } from 'lucide-react';

interface PurchasedOffersProps {
  member: Member;
}

export default function PurchasedOffers({ member }: PurchasedOffersProps) {
  const getOffer = useOfferStore(state => state.getOffer);

  if (!member.purchasedOffers?.length) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-500">No purchased offers</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              Offer
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Purchase Date
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Expiration
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {member.purchasedOffers.map((purchase) => {
            const offer = getOffer(purchase.offerId);
            return (
              <tr key={`${purchase.offerId}-${purchase.purchaseDate}`}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                  <div className="flex items-center">
                    {offer?.imageUrl && (
                      <img
                        src={offer.imageUrl}
                        alt={offer.title}
                        className="h-8 w-8 rounded-lg object-cover mr-3"
                      />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">
                        {offer?.title || 'Unknown Offer'}
                      </div>
                      <div className="text-gray-500">
                        ${offer?.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {format(new Date(purchase.purchaseDate), 'MMM d, yyyy')}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {format(new Date(purchase.expirationDate), 'MMM d, yyyy')}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      purchase.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : purchase.status === 'redeemed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {purchase.status === 'available' && <Tag className="h-3 w-3 mr-1" />}
                    {purchase.status === 'redeemed' && <Clock className="h-3 w-3 mr-1" />}
                    {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}