import { useState, useEffect } from 'react';
import { Eye, Paintbrush, Save } from 'lucide-react';
import StorefrontEditor from '../../components/storefront/StorefrontEditor';
import StorefrontPreview from '../../components/storefront/StorefrontPreview';
import { useSettings } from '../../context/SettingsContext';
import { useMembershipStore } from '../../store/membershipStore';
import { useStorefrontStore } from '../../store/storefrontStore';
import toast from 'react-hot-toast';

export default function Storefront() {
  const { settings } = useSettings();
  const memberships = useMembershipStore((state) => Object.values(state.memberships));
  const savedConfig = useStorefrontStore((state) => state.getConfig());
  const saveConfig = useStorefrontStore((state) => state.saveConfig);
  
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [storefrontConfig, setStorefrontConfig] = useState(savedConfig || {
    headerText: 'Choose the perfect membership for you',
    backgroundColor: '#ffffff',
    cardStyle: {
      borderRadius: 'rounded',
      fontFamily: 'tahoma',
    },
    cards: memberships.reduce((acc, membership) => ({
      ...acc,
      [membership.id]: {
        backgroundColor: '#ffffff',
        buttonColor: '#000000',
        isFeatured: false,
        displayOrder: 1,
        visibilityType: 'public',
        salesCopy: {
          title: membership.name,
          description: membership.description || '',
          callToAction: 'Get Started',
          benefits: membership.benefits?.map(b => b.name) || []
        }
      }
    }), {}),
    showYearlyToggle: true,
    isYearlySelected: false
  });

  const handleSave = () => {
    saveConfig(storefrontConfig);
    toast.success('Storefront configuration saved successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto py-8 px-4">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div className="sm:flex-auto">
            <div className="flex items-center">
              {isPreviewMode && (
                <button
                  onClick={() => setIsPreviewMode(false)}
                  className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Eye className="h-5 w-5" />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Customer Storefront</h1>
                <p className="mt-2 text-sm text-gray-600">
                  {isPreviewMode 
                    ? 'Preview how your storefront will appear to customers on mobile devices'
                    : 'Customize your membership storefront and share it with customers'}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
            {!isPreviewMode && (
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            )}
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              {isPreviewMode ? 'Edit Storefront' : 'Mobile Preview'}
            </button>
          </div>
        </div>

        {isPreviewMode ? (
          <div className="max-w-sm mx-auto bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="text-sm font-medium text-gray-500">Mobile Preview</div>
            </div>
            <div className="p-4">
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <StorefrontPreview
                  config={storefrontConfig}
                  memberships={memberships}
                  businessName={settings?.branding?.businessName}
                  logoUrl={settings?.branding?.logoUrl}
                />
              </div>
            </div>
          </div>
        ) : (
          <StorefrontEditor
            config={storefrontConfig}
            onChange={setStorefrontConfig}
            memberships={memberships}
          />
        )}
      </div>
    </div>
  );
}