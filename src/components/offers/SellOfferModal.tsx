import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, CreditCard, DollarSign } from 'lucide-react';
import { Member } from '../../types/member';
import { Offer } from '../../types/offer';
import { useTransactionStore } from '../../store/transactionStore';
import { useMemberStore } from '../../store/memberStore';
import toast from 'react-hot-toast';

interface SellOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: Offer;
  member: Member;
}

export default function SellOfferModal({ isOpen, onClose, offer, member }: SellOfferModalProps) {
  const [paymentType, setPaymentType] = useState<'card' | 'cash'>('card');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const processTransaction = useTransactionStore(state => state.processTransaction);
  const updateMember = useMemberStore(state => state.updateMember);
  const addActivity = useMemberStore(state => state.addActivity);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Process the transaction
      const transaction = await processTransaction({
        type: 'offer_purchase',
        memberId: member.id,
        amount: offer.price,
        description: `Purchase of offer: ${offer.title}`,
        paymentMethod: paymentType === 'cash' 
          ? { type: 'cash' }
          : { 
              type: 'card',
              id: selectedPaymentMethod,
              last4: member.paymentMethods.find(pm => pm.id === selectedPaymentMethod)?.last4 || ''
            },
        metadata: {
          offerId: offer.id,
          originalPrice: offer.originalPrice
        }
      });

      if (transaction) {
        // Add the offer to member's purchased offers
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30); // Default 30-day expiration

        const updatedMember = await updateMember(member.id, {
          purchasedOffers: [
            ...(member.purchasedOffers || []),
            {
              offerId: offer.id,
              purchaseDate: new Date().toISOString(),
              expirationDate: expirationDate.toISOString(),
              status: 'available'
            }
          ],
          lastActivity: new Date().toISOString()
        });

        // Add activity log
        if (updatedMember) {
          addActivity({
            memberId: member.id,
            type: 'offer_purchased',
            description: `Purchased offer: ${offer.title}`,
            timestamp: new Date().toISOString(),
            metadata: {
              offerId: offer.id,
              transactionId: transaction.id,
              amount: offer.price,
              paymentMethod: paymentType
            }
          });
        }

        toast.success('Offer purchased successfully');
        onClose();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process purchase');
    } finally {
      setIsProcessing(false);
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
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
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Process Offer Purchase
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                      {/* Offer Summary */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900">Purchase Summary</h4>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">{offer.title}</span>
                            <span className="text-sm font-medium text-gray-900">
                              ${offer.price.toFixed(2)}
                            </span>
                          </div>
                          {offer.originalPrice && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Original Price</span>
                              <span className="text-sm text-gray-500 line-through">
                                ${offer.originalPrice.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment Type Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Type
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setPaymentType('card')}
                            className={`flex items-center justify-center px-4 py-2 rounded-lg ${
                              paymentType === 'card'
                                ? 'bg-gray-900 text-white'
                                : 'bg-white text-gray-700 border border-gray-300'
                            }`}
                          >
                            <CreditCard className="h-5 w-5 mr-2" />
                            Card
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentType('cash')}
                            className={`flex items-center justify-center px-4 py-2 rounded-lg ${
                              paymentType === 'cash'
                                ? 'bg-gray-900 text-white'
                                : 'bg-white text-gray-700 border border-gray-300'
                            }`}
                          >
                            <DollarSign className="h-5 w-5 mr-2" />
                            Cash
                          </button>
                        </div>
                      </div>

                      {/* Card Payment Method Selection */}
                      {paymentType === 'card' && member.paymentMethods.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Select Payment Method
                          </label>
                          <div className="mt-2 space-y-3">
                            {member.paymentMethods.map((method) => (
                              <label
                                key={method.id}
                                className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${
                                  selectedPaymentMethod === method.id
                                    ? 'border-gray-900 ring-2 ring-gray-900'
                                    : 'border-gray-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value={method.id}
                                  checked={selectedPaymentMethod === method.id}
                                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                  className="sr-only"
                                />
                                <div className="flex w-full items-center justify-between">
                                  <div className="flex items-center">
                                    <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                                    <div className="text-sm">
                                      <p className="font-medium text-gray-900">
                                        •••• {method.last4}
                                      </p>
                                      <p className="text-gray-500">
                                        Expires {method.expiryDate}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={isProcessing || (paymentType === 'card' && !selectedPaymentMethod)}
                          className="inline-flex w-full justify-center rounded-md border border-transparent bg-gray-900 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          {isProcessing ? 'Processing...' : 'Complete Purchase'}
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