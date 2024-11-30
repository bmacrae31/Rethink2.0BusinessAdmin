import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, CreditCard, User, Mail, Phone, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMemberStore } from '../../store/memberStore';
import { useMembershipStore } from '../../store/membershipStore';
import toast from 'react-hot-toast';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
  const navigate = useNavigate();
  const memberships = useMembershipStore((state) => Object.values(state.memberships));
  const purchaseMembership = useMemberStore((state) => state.purchaseMembership);
  const addActivity = useMemberStore((state) => state.addActivity);

  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<'card' | 'cash'>('card');
  const [purchaseResult, setPurchaseResult] = useState<{
    member: any;
    initialBalance: number;
    membershipName?: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    membershipId: '',
    paymentMethod: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      nameOnCard: '',
      billingZip: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === 'details') {
      if (!formData.membershipId) {
        setError('Please select a membership tier');
        return;
      }
      setStep('payment');
      return;
    }

    if (step === 'payment') {
      try {
        setIsProcessing(true);
        const selectedMembership = memberships.find(m => m.id === formData.membershipId);
        
        if (!selectedMembership) {
          setError('Selected membership not found');
          return;
        }

        // For cash payments, only allow annual memberships
        if (paymentType === 'cash') {
          if (!selectedMembership.yearlyPrice) {
            setError('Cash payments are only available for annual memberships');
            return;
          }
        }

        const result = await purchaseMembership(
          {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone
          },
          formData.membershipId,
          paymentType === 'cash' 
            ? { type: 'cash' }
            : {
                type: 'card',
                ...formData.paymentMethod
              }
        );

        // Add membership purchase activity
        addActivity({
          memberId: result.member.id,
          type: 'membership_purchase',
          description: `${selectedMembership.name} membership purchased with ${paymentType} payment`,
          timestamp: new Date().toISOString(),
          metadata: {
            membershipId: formData.membershipId,
            membershipName: selectedMembership.name,
            paymentMethod: paymentType,
            amount: paymentType === 'cash' 
              ? selectedMembership.yearlyPrice?.firstYear
              : selectedMembership.monthlyPrice || selectedMembership.yearlyPrice?.firstYear
          }
        });

        setPurchaseResult({
          ...result,
          membershipName: selectedMembership.name
        });
        setStep('confirmation');
        toast.success('Membership purchased successfully!');
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to process payment');
        toast.error('Failed to process payment');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // On confirmation step, close modal and optionally navigate
    onClose();
    if (purchaseResult?.member.id) {
      navigate(`/members/${purchaseResult.member.id}`);
    }
  };

  const handleClose = () => {
    setStep('details');
    setError(null);
    setPurchaseResult(null);
    setPaymentType('card');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      membershipId: '',
      paymentMethod: {
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        nameOnCard: '',
        billingZip: ''
      }
    });
    onClose();
  };

  const activeMemberships = memberships.filter(m => m.status === 'active');
  const selectedMembership = activeMemberships.find(m => m.id === formData.membershipId);

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
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      {step === 'confirmation' 
                        ? 'Membership Purchase Successful!'
                        : step === 'payment'
                        ? 'Payment Information'
                        : 'Add New Member'
                      }
                    </Dialog.Title>

                    {error && (
                      <div className="mt-4 rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">{error}</h3>
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                      {step === 'details' && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                First Name
                              </label>
                              <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                  type="text"
                                  id="firstName"
                                  required
                                  value={formData.firstName}
                                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                  className="block w-full pl-10 text-base border-gray-300 rounded-lg focus:ring-black focus:border-black"
                                />
                              </div>
                            </div>
                            <div>
                              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                Last Name
                              </label>
                              <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                  type="text"
                                  id="lastName"
                                  required
                                  value={formData.lastName}
                                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                  className="block w-full pl-10 text-base border-gray-300 rounded-lg focus:ring-black focus:border-black"
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                              Email Address
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="email"
                                id="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="block w-full pl-10 text-base border-gray-300 rounded-lg focus:ring-black focus:border-black"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                              Phone Number
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="tel"
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="block w-full pl-10 text-base border-gray-300 rounded-lg focus:ring-black focus:border-black"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="membershipTier" className="block text-sm font-medium text-gray-700">
                              Select Membership
                            </label>
                            <div className="mt-4 grid grid-cols-1 gap-4">
                              {activeMemberships.map((membership) => (
                                <label
                                  key={membership.id}
                                  className={`
                                    relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none
                                    ${formData.membershipId === membership.id
                                      ? 'border-black ring-2 ring-black'
                                      : 'border-gray-300'
                                    }
                                  `}
                                >
                                  <input
                                    type="radio"
                                    name="membershipTier"
                                    value={membership.id}
                                    checked={formData.membershipId === membership.id}
                                    onChange={(e) => setFormData({ ...formData, membershipId: e.target.value })}
                                    className="sr-only"
                                  />
                                  <div className="flex w-full items-center justify-between">
                                    <div className="flex items-center">
                                      <div className="text-sm">
                                        <p className="font-medium text-gray-900">{membership.name}</p>
                                        <p className="text-gray-500">{membership.description}</p>
                                      </div>
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {membership.monthlyPrice && (
                                        <div>${membership.monthlyPrice}/month</div>
                                      )}
                                      {membership.yearlyPrice && (
                                        <div className="text-sm text-gray-500">
                                          ${membership.yearlyPrice.firstYear}/year
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {step === 'payment' && selectedMembership && (
                        <>
                          <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h4 className="text-sm font-medium text-gray-900">Order Summary</h4>
                            <div className="mt-2 flex justify-between">
                              <span className="text-sm text-gray-500">{selectedMembership.name}</span>
                              <span className="text-sm font-medium text-gray-900">
                                ${selectedMembership.monthlyPrice}/month
                              </span>
                            </div>
                            {selectedMembership.rewardValue > 0 && (
                              <div className="mt-1 flex justify-between">
                                <span className="text-sm text-gray-500">Initial Rewards Balance</span>
                                <span className="text-sm font-medium text-green-600">
                                  ${selectedMembership.rewardValue}
                                </span>
                              </div>
                            )}
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
                            <>
                              <div>
                                <label htmlFor="nameOnCard" className="block text-sm font-medium text-gray-700">
                                  Name on Card
                                </label>
                                <input
                                  type="text"
                                  id="nameOnCard"
                                  required
                                  value={formData.paymentMethod.nameOnCard}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    paymentMethod: { ...formData.paymentMethod, nameOnCard: e.target.value }
                                  })}
                                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                                />
                              </div>

                              <div>
                                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                                  Card Number
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <CreditCard className="h-5 w-5 text-gray-400" />
                                  </div>
                                  <input
                                    type="text"
                                    id="cardNumber"
                                    required
                                    value={formData.paymentMethod.cardNumber}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      paymentMethod: { ...formData.paymentMethod, cardNumber: e.target.value }
                                    })}
                                    className="block w-full pl-10 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base"
                                    placeholder="4242 4242 4242 4242"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                                    Expiry Date
                                  </label>
                                  <input
                                    type="text"
                                    id="expiryDate"
                                    required
                                    value={formData.paymentMethod.expiryDate}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      paymentMethod: { ...formData.paymentMethod, expiryDate: e.target.value }
                                    })}
                                    className="mt-1 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base"
                                    placeholder="MM/YY"
                                  />
                                </div>
                                <div>
                                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                                    CVV
                                  </label>
                                  <input
                                    type="text"
                                    id="cvv"
                                    required
                                    value={formData.paymentMethod.cvv}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      paymentMethod: { ...formData.paymentMethod, cvv: e.target.value }
                                    })}
                                    className="mt-1 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base"
                                    placeholder="123"
                                  />
                                </div>
                              </div>

                              <div>
                                <label htmlFor="billingZip" className="block text-sm font-medium text-gray-700">
                                  Billing ZIP Code
                                </label>
                                <input
                                  type="text"
                                  id="billingZip"
                                  required
                                  value={formData.paymentMethod.billingZip}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    paymentMethod: { ...formData.paymentMethod, billingZip: e.target.value }
                                  })}
                                  className="mt-1 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base"
                                />
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {step === 'confirmation' && purchaseResult && (
                        <div className="space-y-6">
                          <div className="rounded-md bg-green-50 p-4">
                            <div className="flex">
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">
                                  Membership purchased successfully!
                                </h3>
                                <div className="mt-2 text-sm text-green-700">
                                  <p>
                                    {purchaseResult.member.name} has been enrolled in the {purchaseResult.membershipName} membership.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-900">Membership Details</h4>
                            <dl className="mt-2 space-y-1">
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Member Name</dt>
                                <dd className="text-sm font-medium text-gray-900">{purchaseResult.member.name}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Membership</dt>
                                <dd className="text-sm font-medium text-gray-900">{purchaseResult.membershipName}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Initial Rewards Balance</dt>
                                <dd className="text-sm font-medium text-green-600">${purchaseResult.initialBalance}</dd>
                              </div>
                            </dl>
                          </div>

                          <div className="flex flex-col space-y-3">
                            <button
                              type="submit"
                              className="inline-flex justify-center rounded-md border border-transparent bg-black px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                            >
                              View Member Details
                            </button>
                            <button
                              type="button"
                              onClick={handleClose}
                              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      )}

                      {step !== 'confirmation' && (
                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            disabled={isProcessing}
                            className="inline-flex w-full justify-center rounded-md border border-transparent bg-black px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isProcessing ? 'Processing...' : step === 'payment' ? 'Purchase Membership' : 'Continue'}
                          </button>
                          <button
                            type="button"
                            onClick={step === 'payment' ? () => setStep('details') : handleClose}
                            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                          >
                            {step === 'payment' ? 'Back' : 'Cancel'}
                          </button>
                        </div>
                      )}
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