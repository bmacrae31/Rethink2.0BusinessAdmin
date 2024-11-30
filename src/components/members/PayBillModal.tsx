import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, DollarSign, CreditCard } from 'lucide-react';
import { Member } from '../../types/member';
import { usePaymentStore } from '../../store/paymentStore';
import { useMemberStore } from '../../store/memberStore';
import { useMembershipStore } from '../../store/membershipStore';
import toast from 'react-hot-toast';
import Decimal from 'decimal.js';

interface PayBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  onPaymentComplete: () => void;
}

export default function PayBillModal({
  isOpen,
  onClose,
  member,
  onPaymentComplete
}: PayBillModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentType, setPaymentType] = useState<'card' | 'cash'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const processBillPayment = usePaymentStore((state) => state.processBillPayment);
  const calculateCashback = usePaymentStore((state) => state.calculateCashback);
  const updateMember = useMemberStore((state) => state.updateMember);
  const addActivity = useMemberStore((state) => state.addActivity);
  const getMembership = useMembershipStore((state) => state.getMembership);

  // Only show active payment methods
  const activePaymentMethods = member.paymentMethods.filter(pm => pm.type === 'credit_card');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member.status || member.status !== 'active') {
      toast.error('Cannot process payments for inactive memberships');
      return;
    }

    const paymentAmount = new Decimal(amount).toNumber();
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    setIsProcessing(true);
    try {
      const membership = getMembership(member.membershipTier);
      if (!membership) {
        throw new Error('Membership not found');
      }

      // Calculate cashback amount
      const cashbackAmount = membership.cashback?.enabled 
        ? calculateCashback(paymentAmount, member.id)
        : 0;

      if (paymentType === 'cash') {
        // Process cash payment
        addActivity({
          memberId: member.id,
          type: 'bill_payment',
          description: `Paid bill: $${paymentAmount.toFixed(2)}${description ? ` - ${description}` : ''} (Cash)`,
          timestamp: new Date().toISOString(),
          metadata: {
            amount: paymentAmount,
            description,
            paymentMethod: 'cash'
          }
        });

        // Update member's rewards balance if cashback earned
        if (cashbackAmount > 0) {
          const updatedMember = await updateMember(member.id, {
            rewardsBalance: new Decimal(member.rewardsBalance).plus(cashbackAmount).toNumber(),
            lastActivity: new Date().toISOString()
          });

          if (updatedMember) {
            addActivity({
              memberId: member.id,
              type: 'cashback_earned',
              description: `Earned $${cashbackAmount.toFixed(2)} cashback from cash payment`,
              timestamp: new Date().toISOString(),
              metadata: {
                amount: cashbackAmount,
                sourceAmount: paymentAmount
              }
            });
          }
        }

        toast.success('Cash payment processed successfully');
        if (cashbackAmount > 0) {
          toast.success(`Earned $${cashbackAmount.toFixed(2)} in cashback rewards!`);
        }
        onPaymentComplete();
        handleClose();
      } else {
        // Process card payment
        const paymentMethod = member.paymentMethods.find(pm => pm.id === selectedPaymentMethod);
        if (!paymentMethod) {
          toast.error('Please select a payment method');
          return;
        }

        const result = await processBillPayment(member.id, {
          amount: paymentAmount,
          description: description || undefined,
          paymentMethod: {
            id: paymentMethod.id,
            last4: paymentMethod.last4
          }
        });

        if (result.success) {
          // Update member's rewards balance if cashback earned
          if (cashbackAmount > 0) {
            await updateMember(member.id, {
              rewardsBalance: new Decimal(member.rewardsBalance).plus(cashbackAmount).toNumber(),
              lastActivity: new Date().toISOString()
            });

            addActivity({
              memberId: member.id,
              type: 'cashback_earned',
              description: `Earned $${cashbackAmount.toFixed(2)} cashback from card payment`,
              timestamp: new Date().toISOString(),
              metadata: {
                amount: cashbackAmount,
                sourceAmount: paymentAmount
              }
            });

            toast.success(`Earned $${cashbackAmount.toFixed(2)} in cashback rewards!`);
          }

          toast.success('Payment processed successfully');
          onPaymentComplete();
          handleClose();
        } else {
          toast.error(result.error || 'Failed to process payment');
        }
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error('Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
    setSelectedPaymentMethod('');
    setPaymentType('card');
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
                    onClick={handleClose}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Pay Bill
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                      <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                          Payment Amount ($)
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            id="amount"
                            required
                            min="0.01"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="block w-full pl-10 pr-12 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description (Optional)
                        </label>
                        <input
                          type="text"
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Enter payment description"
                        />
                      </div>

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

                      {paymentType === 'card' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Payment Method
                          </label>
                          <div className="mt-2 space-y-3">
                            {activePaymentMethods.map((method) => (
                              <label
                                key={method.id}
                                className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${
                                  selectedPaymentMethod === method.id
                                    ? 'border-blue-500 ring-2 ring-blue-500'
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
                                  <div className="ml-3 flex h-5 items-center">
                                    <div
                                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                        selectedPaymentMethod === method.id
                                          ? 'border-blue-500 bg-blue-500'
                                          : 'border-gray-300'
                                      }`}
                                    >
                                      {selectedPaymentMethod === method.id && (
                                        <div className="h-2 w-2 rounded-full bg-white" />
                                      )}
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
                          disabled={isProcessing || !amount || (paymentType === 'card' && !selectedPaymentMethod)}
                          className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          {isProcessing ? 'Processing...' : 'Pay Now'}
                        </button>
                        <button
                          type="button"
                          onClick={handleClose}
                          className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
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