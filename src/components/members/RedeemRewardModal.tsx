import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Gift, AlertCircle } from 'lucide-react';
import { Member } from '../../types/member';
import { useMemberStore } from '../../store/memberStore';
import toast from 'react-hot-toast';

interface RedeemRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  onUpdate: (member: Member) => void;
}

export default function RedeemRewardModal({
  isOpen,
  onClose,
  member,
  onUpdate
}: RedeemRewardModalProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const updateMember = useMemberStore(state => state.updateMember);
  const addActivity = useMemberStore(state => state.addActivity);

  const canRedeemValue = member.status === 'active';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canRedeemValue) {
      toast.error('Cannot redeem rewards while membership is not active');
      return;
    }

    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    try {
      const rewardAmount = parseFloat(amount);
      if (rewardAmount > member.rewardsBalance) {
        toast.error('Redemption amount cannot exceed available balance');
        return;
      }

      const updatedMember = await updateMember(member.id, {
        rewardsBalance: member.rewardsBalance - rewardAmount,
        lastActivity: new Date().toISOString(),
      });

      if (updatedMember) {
        // Add activity log
        addActivity({
          memberId: member.id,
          type: 'reward_redemption',
          description: `Redeemed $${rewardAmount.toFixed(2)} in rewards${note ? ` - ${note}` : ''}`,
          timestamp: new Date().toISOString(),
          metadata: {
            amount: rewardAmount,
            note: note || undefined
          }
        });

        onUpdate(updatedMember);
        toast.success(`Successfully redeemed $${rewardAmount.toFixed(2)} in rewards`);
        handleClose();
      }
    } catch (error) {
      console.error('Failed to redeem rewards:', error);
      toast.error('Failed to redeem rewards');
    }
  };

  const handleClose = () => {
    setAmount('');
    setNote('');
    setIsConfirming(false);
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
                    <Gift className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Redeem Rewards
                    </Dialog.Title>

                    {!canRedeemValue ? (
                      <div className="mt-4 rounded-md bg-yellow-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                              Membership is not active
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>Rewards cannot be redeemed while the membership is not active.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Available Balance: ${member.rewardsBalance.toFixed(2)}
                        </p>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                      <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                          Redemption Amount ($)
                        </label>
                        <input
                          type="number"
                          id="amount"
                          required
                          min="0.01"
                          step="0.01"
                          max={member.rewardsBalance}
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                            !canRedeemValue ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          disabled={!canRedeemValue}
                        />
                      </div>

                      <div>
                        <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                          Note (Optional)
                        </label>
                        <textarea
                          id="note"
                          rows={3}
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                            !canRedeemValue ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          disabled={!canRedeemValue}
                        />
                      </div>

                      {isConfirming && canRedeemValue && (
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
                                  Are you sure you want to redeem ${amount} from {member.name}'s rewards
                                  balance?
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={!canRedeemValue || !amount}
                          className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                            canRedeemValue
                              ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                              : 'bg-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isConfirming ? 'Confirm Redemption' : 'Redeem Rewards'}
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