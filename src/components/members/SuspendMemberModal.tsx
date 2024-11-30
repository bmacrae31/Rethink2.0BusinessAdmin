import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, AlertTriangle } from 'lucide-react';
import { Member } from '../../types/member';
import { useMemberStore } from '../../store/memberStore';
import toast from 'react-hot-toast';

interface SuspendMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  onUpdate: (member: Member) => void;
}

export default function SuspendMemberModal({
  isOpen,
  onClose,
  member,
  onUpdate
}: SuspendMemberModalProps) {
  const updateMember = useMemberStore(state => state.updateMember);
  const addActivity = useMemberStore(state => state.addActivity);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newStatus = member.status === 'active' ? 'stopped' : 'active';
      const updatedMember = await updateMember(member.id, {
        status: newStatus,
        autoRenew: newStatus === 'active',
        lastActivity: new Date().toISOString()
      });

      if (updatedMember) {
        // Add activity log
        addActivity({
          memberId: member.id,
          type: newStatus === 'stopped' ? 'membership_stopped' : 'membership_restarted',
          description: `Membership ${newStatus === 'stopped' ? 'stopped' : 'restarted'}`,
          timestamp: new Date().toISOString(),
          metadata: {
            previousStatus: member.status,
            newStatus: newStatus
          }
        });

        onUpdate(updatedMember);
        toast.success(`Membership successfully ${newStatus === 'stopped' ? 'stopped' : 'restarted'}`);
        onClose();
      }
    } catch (error) {
      console.error('Failed to update membership status:', error);
      toast.error('Failed to update membership status');
    }
  };

  const isActive = member.status === 'active';

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
              <Dialog.Panel className="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
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
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      {isActive ? 'Stop' : 'Restart'} Membership
                    </Dialog.Title>
                    <div className="mt-2">
                      {isActive ? (
                        <div className="space-y-4">
                          <p className="text-sm text-gray-500">
                            Are you sure you want to stop {member.name}'s membership? This will:
                          </p>
                          <ul className="list-disc pl-5 text-sm text-gray-500">
                            <li>Stop recurring billing</li>
                            <li>Disable rewards redemption</li>
                            <li>Pause benefit usage</li>
                            <li>Change membership status to stopped</li>
                          </ul>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm text-gray-500">
                            Are you sure you want to restart {member.name}'s membership? This will:
                          </p>
                          <ul className="list-disc pl-5 text-sm text-gray-500">
                            <li>Resume recurring billing</li>
                            <li>Enable rewards redemption</li>
                            <li>Restore benefit usage</li>
                            <li>Change membership status to active</li>
                          </ul>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleSubmit} className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                          isActive
                            ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                            : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                        }`}
                      >
                        {isActive ? 'Stop Membership' : 'Restart Membership'}
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                      >
                        Cancel
                      </button>
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