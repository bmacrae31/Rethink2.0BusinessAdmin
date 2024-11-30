import React, { useState, useEffect } from 'react';
import { Eye, Paintbrush } from 'lucide-react';
import MembershipCardEditor from './MembershipCardEditor';

interface StorefrontEditorProps {
  config: any;
  onChange: (config: any) => void;
  memberships: any[];
}

export default function StorefrontEditor({ config, onChange, memberships }: StorefrontEditorProps) {
  const [activeMembershipId, setActiveMembershipId] = useState(memberships[0]?.id);

  // Initialize card configs for any new memberships
  useEffect(() => {
    const newConfig = { ...config };
    let hasChanges = false;

    memberships.forEach(membership => {
      if (!newConfig.cards[membership.id]) {
        hasChanges = true;
        newConfig.cards[membership.id] = {
          backgroundColor: '#ffffff',
          buttonColor: '#000000',
          isFeatured: false,
          displayOrder: Object.keys(newConfig.cards).length + 1,
          visibilityType: 'public',
          salesCopy: {
            title: membership.name,
            description: membership.description || '',
            callToAction: 'Get Started',
            benefits: membership.benefits?.map((b: any) => b.name) || []
          }
        };
      }
    });

    if (hasChanges) {
      onChange(newConfig);
    }
  }, [memberships, config, onChange]);

  const handleCardUpdate = (membershipId: string, field: string, value: any) => {
    onChange({
      ...config,
      cards: {
        ...config.cards,
        [membershipId]: {
          ...config.cards[membershipId],
          [field]: value
        }
      }
    });
  };

  // Sort memberships by display order
  const sortedMemberships = [...memberships].sort((a, b) => {
    const orderA = config.cards[a.id]?.displayOrder || 0;
    const orderB = config.cards[b.id]?.displayOrder || 0;
    return orderA - orderB;
  });

  return (
    <div className="grid grid-cols-12 gap-8">
      {/* Settings Panel */}
      <div className="col-span-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 sticky top-24">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-900 rounded-lg">
              <Paintbrush className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Storefront Settings
            </h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Header Text
              </label>
              <input
                type="text"
                value={config.headerText || ''}
                onChange={(e) => onChange({ ...config, headerText: e.target.value })}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
                placeholder="Enter header text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Background Color
              </label>
              <input
                type="color"
                value={config.backgroundColor || '#ffffff'}
                onChange={(e) => onChange({ ...config, backgroundColor: e.target.value })}
                className="mt-1 block w-full h-10 rounded-lg border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Card Style
              </label>
              <select
                value={config.cardStyle?.borderRadius || 'rounded'}
                onChange={(e) => onChange({
                  ...config,
                  cardStyle: { ...config.cardStyle, borderRadius: e.target.value }
                })}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
              >
                <option value="rounded">Rounded Corners</option>
                <option value="sharp">Sharp Corners</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Font Style
              </label>
              <select
                value={config.cardStyle?.fontFamily || 'tahoma'}
                onChange={(e) => onChange({
                  ...config,
                  cardStyle: { ...config.cardStyle, fontFamily: e.target.value }
                })}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
              >
                <option value="tahoma">Tahoma</option>
                <option value="sans">Modern Sans-serif</option>
                <option value="serif">Classic Serif</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Membership Cards Editor */}
      <div className="col-span-8 space-y-6">
        {sortedMemberships.map((membership) => (
          <div
            key={membership.id}
            onClick={() => setActiveMembershipId(membership.id)}
            className="transition-all duration-200"
          >
            <MembershipCardEditor
              membership={membership}
              cardConfig={config.cards[membership.id]}
              onUpdate={(field, value) => handleCardUpdate(membership.id, field, value)}
              isActive={membership.id === activeMembershipId}
              allMemberships={memberships}
            />
          </div>
        ))}
      </div>
    </div>
  );
}