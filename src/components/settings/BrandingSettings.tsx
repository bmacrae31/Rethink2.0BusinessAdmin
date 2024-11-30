import { useState } from 'react';
import toast from 'react-hot-toast';
import { BrandingSettings as BrandingSettingsType } from '../../types/settings';
import { updateBrandingSettings } from '../../api/settings';

interface BrandingSettingsProps {
  settings: BrandingSettingsType;
  onSettingsUpdate: (settings: BrandingSettingsType) => void;
}

export default function BrandingSettings({ settings, onSettingsUpdate }: BrandingSettingsProps) {
  const [formData, setFormData] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updatedSettings = await updateBrandingSettings({
        ...formData,
        logoUrl: formData.logoUrl.trim()
      });
      
      onSettingsUpdate(updatedSettings.branding);
      toast.success('Branding settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update branding settings.');
      console.error('Settings update error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Logo Settings */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Business Logo</label>
        <div className="mt-2 flex items-center space-x-6">
          <div className="flex-shrink-0">
            <img
              src={formData.logoUrl}
              alt="Business logo"
              className="h-16 w-auto object-contain"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = 'https://via.placeholder.com/160x50?text=Logo';
                toast.error('Failed to load logo image. Please check the URL.');
              }}
            />
          </div>
        </div>
        <div className="mt-2">
          <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700">
            Logo URL
          </label>
          <input
            type="url"
            id="logoUrl"
            value={formData.logoUrl}
            onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter your logo URL"
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter a direct URL to your logo image (e.g., https://example.com/logo.png)
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex justify-center rounded-md border border-transparent bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}