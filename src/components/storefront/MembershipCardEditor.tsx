import { useState, useEffect } from 'react';
import { CheckCircle, DollarSign, Tag } from 'lucide-react';

interface MembershipCardEditorProps {
  membership: any;
  cardConfig: any;
  onUpdate: (field: string, value: any) => void;
  isActive: boolean;
  allMemberships: any[];
}

export default function MembershipCardEditor({ 
  membership, 
  cardConfig = {
    salesCopy: {
      title: '',
      description: '',
      callToAction: 'Get Started',
      benefits: []
    },
    backgroundColor: '#ffffff',
    buttonColor: '#000000',
    displayOrder: 1,
    visibilityType: 'public'
  },
  onUpdate,
  isActive,
  allMemberships
}: MembershipCardEditorProps) {
  const [localConfig, setLocalConfig] = useState(cardConfig);

  useEffect(() => {
    setLocalConfig(cardConfig);
  }, [cardConfig]);

  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...(localConfig.salesCopy?.benefits || [])];
    newBenefits[index] = value;
    
    onUpdate('salesCopy', {
      ...localConfig.salesCopy,
      benefits: newBenefits.filter(Boolean)
    });
  };

  const handleDisplayOrderChange = (newOrder: number) => {
    const currentOrders = allMemberships.map(m => ({
      id: m.id,
      order: cardConfig.displayOrder || 1
    }));

    const conflictingMembership = currentOrders.find(m => m.order === newOrder && m.id !== membership.id);
    if (conflictingMembership) {
      onUpdate('displayOrder', newOrder);
      const event = new CustomEvent('updateDisplayOrder', {
        detail: {
          membershipId: conflictingMembership.id,
          newOrder: cardConfig.displayOrder
        }
      });
      window.dispatchEvent(event);
    } else {
      onUpdate('displayOrder', newOrder);
    }
  };

  return (
    <div
      className={`bg-gray-50 rounded-xl border-2 p-6 ${
        isActive 
          ? 'border-gray-900 bg-white' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${isActive ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'}`}>
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {membership.name}
            </h3>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>
                ${membership.monthlyPrice}/mo
                {membership.yearlyPrice && ` or $${membership.yearlyPrice.firstYear}/yr`}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Display Order:</span>
            <select
              value={localConfig.displayOrder || 1}
              onChange={(e) => handleDisplayOrderChange(parseInt(e.target.value))}
              className="w-20 rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm bg-white"
            >
              {Array.from({ length: allMemberships.length }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>#{num}</option>
              ))}
            </select>
          </div>
          <select
            value={localConfig.visibilityType || 'public'}
            onChange={(e) => onUpdate('visibilityType', e.target.value)}
            className="rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm bg-white"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Display Name</label>
          <input
            type="text"
            value={localConfig.salesCopy?.title || membership.name}
            onChange={(e) => onUpdate('salesCopy', {
              ...localConfig.salesCopy,
              title: e.target.value
            })}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm bg-white"
            placeholder="Enter display name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Call to Action</label>
          <input
            type="text"
            value={localConfig.salesCopy?.callToAction || 'Get Started'}
            onChange={(e) => onUpdate('salesCopy', {
              ...localConfig.salesCopy,
              callToAction: e.target.value
            })}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm bg-white"
            placeholder="e.g., Get Started, Join Now"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Brief Description
        </label>
        <textarea
          value={localConfig.salesCopy?.description || ''}
          onChange={(e) => onUpdate('salesCopy', {
            ...localConfig.salesCopy,
            description: e.target.value
          })}
          rows={2}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm bg-white"
          placeholder="Enter a short description"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Membership Benefits
        </label>
        <div className="grid grid-cols-2 gap-3">
          {Array(8).fill('').map((_, index) => (
            <div 
              key={index} 
              className="flex items-center space-x-2 p-2 rounded-lg bg-white border border-gray-200"
            >
              <CheckCircle className="h-5 w-5 text-black flex-shrink-0" />
              <input
                type="text"
                value={localConfig.salesCopy?.benefits?.[index] || ''}
                onChange={(e) => handleBenefitChange(index, e.target.value)}
                className="block w-full border-0 p-0 text-sm placeholder-gray-400 focus:ring-0"
                placeholder={`Enter benefit ${index + 1}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={localConfig.isFeatured || false}
            onChange={(e) => onUpdate('isFeatured', e.target.checked)}
            className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
          />
          <span className="text-sm font-medium text-gray-700">Featured Plan</span>
        </label>

        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Card Color</label>
            <input
              type="color"
              value={localConfig.backgroundColor || '#ffffff'}
              onChange={(e) => onUpdate('backgroundColor', e.target.value)}
              className="block w-full h-8 rounded-lg border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Button Color</label>
            <input
              type="color"
              value={localConfig.buttonColor || '#000000'}
              onChange={(e) => onUpdate('buttonColor', e.target.value)}
              className="block w-full h-8 rounded-lg border-gray-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}