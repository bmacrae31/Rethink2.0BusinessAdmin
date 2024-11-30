import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { MemberFilter } from '../../types/member';

interface MemberFilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filters: MemberFilter;
  onApplyFilters: (filters: MemberFilter) => void;
}

export default function MemberFilterDialog({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}: MemberFilterDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  const membershipTiers = ['Gold', 'Silver', 'Bronze'];
  const statusOptions = ['active', 'inactive'];

  const toggleTier = (tier: string) => {
    const newTiers = filters.membershipTier.includes(tier)
      ? filters.membershipTier.filter(t => t !== tier)
      : [...filters.membershipTier, tier];
    onApplyFilters({ ...filters, membershipTier: newTiers });
  };

  const toggleStatus = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    onApplyFilters({ ...filters, status: newStatus });
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
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Filter Members
                    </Dialog.Title>
                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                      {/* Membership Tier Filter */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Membership Tier</h4>
                        <div className="mt-2 space-y-2">
                          {membershipTiers.map((tier) => (
                            <label key={tier} className="inline-flex items-center mr-4">
                              <input
                                type="checkbox"
                                checked={filters.membershipTier.includes(tier)}
                                onChange={() => toggleTier(tier)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">{tier}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Status Filter */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Status</h4>
                        <div className="mt-2 space-y-2">
                          {statusOptions.map((status) => (
                            <label key={status} className="inline-flex items-center mr-4">
                              <input
                                type="checkbox"
                                checked={filters.status.includes(status)}
                                onChange={() => toggleStatus(status)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Join Date Range */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Join Date Range</h4>
                        <div className="mt-2 grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-700">From</label>
                            <input
                              type="date"
                              value={filters.dateRange?.start || ''}
                              onChange={(e) =>
                                onApplyFilters({
                                  ...filters,
                                  dateRange: {
                                    start: e.target.value,
                                    end: filters.dateRange?.end || e.target.value,
                                  },
                                })
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700">To</label>
                            <input
                              type="date"
                              value={filters.dateRange?.end || ''}
                              onChange={(e) =>
                                onApplyFilters({
                                  ...filters,
                                  dateRange: {
                                    start: filters.dateRange?.start || e.target.value,
                                    end: e.target.value,
                                  },
                                })
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Apply Filters
                        </button>
                        <button
                          type="button"
                          onClick={onClose}
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