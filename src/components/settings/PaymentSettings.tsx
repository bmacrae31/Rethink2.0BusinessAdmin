import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { PaymentSettings as PaymentSettingsType } from '../../types/settings';
import { updatePaymentSettings } from '../../api/settings';

interface PaymentSettingsProps {
  settings: PaymentSettingsType;
  onSettingsUpdate: (settings: PaymentSettingsType) => void;
}

export default function PaymentSettings({ settings, onSettingsUpdate }: PaymentSettingsProps) {
  const [formData, setFormData] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const updatedSettings = await updatePaymentSettings(formData);
      onSettingsUpdate(updatedSettings.payment);
      setMessage({ type: 'success', text: 'Payment settings updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update payment settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Provider */}
      <div>
        <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
          Payment Provider
        </label>
        <select
          id="provider"
          value={formData.provider}
          onChange={(e) => setFormData({ ...formData, provider: e.target.value as 'fortis' | 'stripe' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="fortis">Fortis</option>
          <option value="stripe">Stripe</option>
        </select>
      </div>

      {/* Environment Toggle */}
      <div>
        <label htmlFor="environment" className="block text-sm font-medium text-gray-700">
          Environment
        </label>
        <select
          id="environment"
          value={formData.environment}
          onChange={(e) => setFormData({ ...formData, environment: e.target.value as 'test' | 'live' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="test">Test Mode</option>
          <option value="live">Live Mode</option>
        </select>
        {formData.environment === 'test' && (
          <p className="mt-2 text-sm text-gray-500">
            Test mode allows you to test your integration without processing real transactions.
          </p>
        )}
      </div>

      {/* API Keys */}
      <div className="space-y-4">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
            API Key
          </label>
          <input
            type="text"
            id="apiKey"
            value={formData.apiKey}
            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder={`Enter your ${formData.provider} API key`}
          />
        </div>

        <div>
          <label htmlFor="secretKey" className="block text-sm font-medium text-gray-700">
            Secret Key
          </label>
          <input
            type="password"
            id="secretKey"
            value={formData.secretKey}
            onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder={`Enter your ${formData.provider} secret key`}
          />
        </div>
      </div>

      {/* Environment Warning */}
      {formData.environment === 'live' && (
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Live Mode Active</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You are configuring live payment credentials. Make sure to use your production API
                  keys, as these will process real transactions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Message */}
      {message && (
        <div
          className={`rounded-md p-4 ${
            message.type === 'success' ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle
                className={`h-5 w-5 ${
                  message.type === 'success' ? 'text-green-400' : 'text-red-400'
                }`}
              />
            </div>
            <div className="ml-3">
              <p
                className={`text-sm font-medium ${
                  message.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {message.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}