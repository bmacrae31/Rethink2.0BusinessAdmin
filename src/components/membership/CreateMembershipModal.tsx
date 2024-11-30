import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { useMembershipStore } from '../../store/membershipStore';

interface CreateMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (membership: any) => void;
}

export default function CreateMembershipModal({ isOpen, onClose, onCreate }: CreateMembershipModalProps) {
  const createMembership = useMembershipStore((state) => state.createMembership);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    paymentType: 'monthly' as 'monthly' | 'yearly' | 'both',
    monthlyPrice: '',
    yearlyFirstPrice: '',
    yearlySecondPrice: '',
    rewardValue: '',
    rewardFrequency: 'Monthly' as const,
    benefits: [] as Array<{
      name: string;
      frequency: 'Monthly' | 'Quarterly' | 'Yearly';
      expiresInMonths: number;
    }>,
    status: 'draft' as const,
    cashback: undefined as undefined | {
      enabled: boolean;
      rate: number;
      limits?: {
        perTransaction?: number;
        monthly?: number;
        annual?: number;
      };
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const membership = {
      name: formData.name,
      description: formData.description,
      monthlyPrice: formData.monthlyPrice ? Number(formData.monthlyPrice) : undefined,
      yearlyPrice: formData.yearlyFirstPrice && formData.yearlySecondPrice ? {
        firstYear: Number(formData.yearlyFirstPrice),
        secondYear: Number(formData.yearlySecondPrice)
      } : undefined,
      benefits: formData.benefits || [],
      rewardValue: Number(formData.rewardValue),
      rewardFrequency: formData.rewardFrequency,
      status: formData.status,
      cashback: formData.cashback
    };

    createMembership(membership);
    onClose();
  };

  const addBenefit = () => {
    setFormData({
      ...formData,
      benefits: [
        ...formData.benefits,
        { name: '', frequency: 'Monthly', expiresInMonths: 1 }
      ]
    });
  };

  const updateBenefit = (index: number, field: string, value: any) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = { ...newBenefits[index], [field]: value };
    setFormData({ ...formData, benefits: newBenefits });
  };

  const removeBenefit = (index: number) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index)
    });
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
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Create New Membership Tier
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                      {/* Basic Information */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Tier Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                          rows={3}
                        />
                      </div>

                      {/* Payment Options */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Type
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                          {['monthly', 'yearly', 'both'].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setFormData({ ...formData, paymentType: type as any })}
                              className={`
                                px-4 py-2 rounded-lg text-sm font-medium
                                ${formData.paymentType === type
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }
                                border
                              `}
                            >
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Pricing */}
                      {(formData.paymentType === 'monthly' || formData.paymentType === 'both') && (
                        <div>
                          <label htmlFor="monthlyPrice" className="block text-sm font-medium text-gray-700">
                            Monthly Price ($)
                          </label>
                          <input
                            type="number"
                            id="monthlyPrice"
                            value={formData.monthlyPrice}
                            onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      )}

                      {(formData.paymentType === 'yearly' || formData.paymentType === 'both') && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="yearlyFirstPrice" className="block text-sm font-medium text-gray-700">
                              First Year Price ($)
                            </label>
                            <input
                              type="number"
                              id="yearlyFirstPrice"
                              value={formData.yearlyFirstPrice}
                              onChange={(e) => setFormData({ ...formData, yearlyFirstPrice: e.target.value })}
                              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <label htmlFor="yearlySecondPrice" className="block text-sm font-medium text-gray-700">
                              Second Year Price ($)
                            </label>
                            <input
                              type="number"
                              id="yearlySecondPrice"
                              value={formData.yearlySecondPrice}
                              onChange={(e) => setFormData({ ...formData, yearlySecondPrice: e.target.value })}
                              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                      )}

                      {/* Rewards */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="rewardValue" className="block text-sm font-medium text-gray-700">
                            Reward Value ($)
                          </label>
                          <input
                            type="number"
                            id="rewardValue"
                            value={formData.rewardValue}
                            onChange={(e) => setFormData({ ...formData, rewardValue: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="rewardFrequency" className="block text-sm font-medium text-gray-700">
                            Reward Frequency
                          </label>
                          <select
                            id="rewardFrequency"
                            value={formData.rewardFrequency}
                            onChange={(e) => setFormData({ ...formData, rewardFrequency: e.target.value as 'Monthly' | 'Yearly' })}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                          >
                            <option value="Monthly">Monthly</option>
                            <option value="Yearly">Yearly</option>
                          </select>
                        </div>
                      </div>

                      {/* Cashback Settings */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium text-gray-700">
                            Enable Cashback
                          </label>
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              cashback: formData.cashback?.enabled
                                ? undefined
                                : { enabled: true, rate: 5 }
                            })}
                            className={`${
                              formData.cashback?.enabled
                                ? 'bg-blue-600'
                                : 'bg-gray-200'
                            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                          >
                            <span
                              className={`${
                                formData.cashback?.enabled ? 'translate-x-5' : 'translate-x-0'
                              } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                            />
                          </button>
                        </div>

                        {formData.cashback?.enabled && (
                          <>
                            <div>
                              <label htmlFor="cashbackRate" className="block text-sm font-medium text-gray-700">
                                Cashback Rate (%)
                              </label>
                              <input
                                type="number"
                                id="cashbackRate"
                                value={formData.cashback.rate}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  cashback: {
                                    ...formData.cashback!,
                                    rate: Number(e.target.value)
                                  }
                                })}
                                min="0"
                                max="100"
                                step="0.1"
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Cashback Limits (Optional)
                              </label>
                              <div className="mt-2 grid grid-cols-3 gap-4">
                                <div>
                                  <label htmlFor="perTransaction" className="block text-xs text-gray-500">
                                    Per Transaction
                                  </label>
                                  <input
                                    type="number"
                                    id="perTransaction"
                                    value={formData.cashback.limits?.perTransaction || ''}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      cashback: {
                                        ...formData.cashback!,
                                        limits: {
                                          ...formData.cashback!.limits,
                                          perTransaction: Number(e.target.value) || undefined
                                        }
                                      }
                                    })}
                                    min="0"
                                    step="0.01"
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    placeholder="No limit"
                                  />
                                </div>
                                <div>
                                  <label htmlFor="monthly" className="block text-xs text-gray-500">
                                    Monthly
                                  </label>
                                  <input
                                    type="number"
                                    id="monthly"
                                    value={formData.cashback.limits?.monthly || ''}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      cashback: {
                                        ...formData.cashback!,
                                        limits: {
                                          ...formData.cashback!.limits,
                                          monthly: Number(e.target.value) || undefined
                                        }
                                      }
                                    })}
                                    min="0"
                                    step="0.01"
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    placeholder="No limit"
                                  />
                                </div>
                                <div>
                                  <label htmlFor="annual" className="block text-xs text-gray-500">
                                    Annual
                                  </label>
                                  <input
                                    type="number"
                                    id="annual"
                                    value={formData.cashback.limits?.annual || ''}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      cashback: {
                                        ...formData.cashback!,
                                        limits: {
                                          ...formData.cashback!.limits,
                                          annual: Number(e.target.value) || undefined
                                        }
                                      }
                                    })}
                                    min="0"
                                    step="0.01"
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    placeholder="No limit"
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Benefits */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <label className="block text-sm font-medium text-gray-700">Benefits</label>
                          <button
                            type="button"
                            onClick={addBenefit}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            Add benefit
                          </button>
                        </div>
                        <div className="space-y-4">
                          {formData.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-start space-x-4">
                              <div className="flex-1 space-y-4">
                                <input
                                  type="text"
                                  value={benefit.name}
                                  onChange={(e) => updateBenefit(index, 'name', e.target.value)}
                                  placeholder="Benefit name"
                                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                  <select
                                    value={benefit.frequency}
                                    onChange={(e) => updateBenefit(index, 'frequency', e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                                  >
                                    <option value="Monthly">Monthly</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Yearly">Yearly</option>
                                  </select>
                                  <div className="flex items-center space-x-2">
                                    <div className="relative flex-1">
                                      <input
                                        type="number"
                                        value={benefit.expiresInMonths}
                                        onChange={(e) => updateBenefit(index, 'expiresInMonths', Number(e.target.value))}
                                        min="1"
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                                      />
                                      <span className="absolute right-0 top-1/2 -translate-y-1/2 pr-3 text-sm text-gray-500">
                                        expires in months
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeBenefit(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <select
                          id="status"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'active' | 'inactive' })}
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                        >
                          <option value="draft">Draft</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>

                      {/* Submit Buttons */}
                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Create Membership
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