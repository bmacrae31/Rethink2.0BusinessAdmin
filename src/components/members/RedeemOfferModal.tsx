import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Tag, AlertCircle } from 'lucide-react';
import { Member } from '../../types/member';
import { updateMember } from '../../api/members';

interface RedeemOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  onUpdate: (member: Member) => void;
}

export default function RedeemOfferModal({
  isOpen,
  onClose,
  member,
  onUpdate
}: RedeemOfferModalProps) {
  const [selectedBenefit, setSelectedBenefit] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const availableBenefits = member.benefits.filter(benefit => !benefit.used);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    try {
      const updatedBenefits = member.benefits.map(benefit => 
        benefit.name === selectedBenefit ? { ...benefit, used: true } : benefit
      );

      const updatedMember = await updateMember(member.id, {
        benefits: updatedBenefits,
        lastActivity: new Date().toISOString(),
      });

      if (updatedMember) {
        onUpdate(updatedMember);
        onClose();
        resetForm();
      }
    } catch (error) {
      console.error('Failed to redeem benefit:', error);
    }
  };

  const resetForm = () => {
    setSelectedBenefit('');
    setIsConfirming(false);
  };

  const handleClose = () => {
    resetForm();
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
              <Dialog.Panel className="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
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
                    <Tag className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Redeem Benefit
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                      {availableBenefits.length === 0 ? (
                        <p className="text-sm text-gray-500">No available benefits to redeem.</p>
                      ) : (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Select Benefit to Redeem
                            </label>
                            <select
                              value={selectedBenefit}
                              onChange={(e) => setSelectedBenefit(e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              required
                            >
                              <option value="">Select a benefit</option>
                              {availableBenefits.map((benefit, index) => (
                                <option key={index} value={benefit.name}>
                                  {benefit.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {isConfirming && (
                            <div className="rounded-md bg-yellow-50 p-4">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                                </div>
                                <div className="ml-3">
                                  <h3 className="text-sm font-medium text-yellow-800">
                                    Confirm Redemption
                                  </h3>
                                  <div className="mt-2 text-sm text-yellow-700">
                                    <p>
                                      Are you sure you want to redeem the "{selectedBenefit}" benefit for {member.name}?
                                      This action cannot be undone.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                            <button
                              type="submit"
                              className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                              disabled={!selectedBenefit}
                            >
                              {isConfirming ? 'Confirm Redemption' : 'Redeem Benefit'}
                            </button>
                            <button
                              type="button"
                              onClick={handleClose}
                              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
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