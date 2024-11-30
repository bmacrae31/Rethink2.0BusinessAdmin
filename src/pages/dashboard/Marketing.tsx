import { useState } from 'react';
import { Mail, Eye, Send, CheckCircle } from 'lucide-react';
import EmailTemplateEditor from '../../components/marketing/EmailTemplateEditor';
import EmailPreview from '../../components/marketing/EmailPreview';
import { useSettings } from '../../context/SettingsContext';
import toast from 'react-hot-toast';

export default function Marketing() {
  const { settings } = useSettings();
  const [selectedTemplate, setSelectedTemplate] = useState('welcome');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [templates, setTemplates] = useState({
    welcome: {
      enabled: true,
      subject: 'Welcome to {BusinessName}, {CustomerName}!',
      body: `Welcome {CustomerName}!

We're excited to have you as part of our {MembershipName} family!

Here's what you can look forward to:
• Exclusive Rewards: Earn rewards every time you visit
• Special Offers: Get access to members-only promotions and benefits

Your current rewards balance: ${'{RewardsBalance}'}

Start exploring your membership today and make the most out of your experience.

If you have any questions, we're always here to help.

Welcome aboard!
{BusinessName}

{BusinessLogo}`
    },
    rewards: {
      enabled: true,
      subject: 'Your Rewards Update from {BusinessName}',
      body: `Hi {CustomerName},

Here's your current rewards update:

Current Balance: ${'{RewardsBalance}'}
Membership: {MembershipName}
Expiration: {ExpirationDate}

Don't forget to use your rewards on your next visit!

Best regards,
{BusinessName}

{BusinessLogo}`
    },
    expiration: {
      enabled: true,
      subject: 'Your Rewards are About to Expire, {CustomerName}!',
      body: `Hello {CustomerName},

This is a friendly reminder that you have ${'{RewardsBalance}'} in rewards that will expire on {ExpirationDate}.

Don't miss out on your rewards! Visit us soon to use them before they expire.

Best regards,
{BusinessName}

{BusinessLogo}`
    }
  });

  const handleTemplateChange = (template: string, field: string, value: any) => {
    setTemplates(prev => ({
      ...prev,
      [template]: {
        ...prev[template as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSendTest = () => {
    toast.success('Test email will be implemented with email service integration');
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Email Marketing</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage automated email templates for member communications.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-12 gap-8">
          {/* Template List */}
          <div className="col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Email Templates</h2>
                <div className="space-y-3">
                  {Object.entries(templates).map(([key, template]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTemplate(key)}
                      className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                        selectedTemplate === key
                          ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <Mail className={`h-5 w-5 ${
                          selectedTemplate === key ? 'text-white' : 'text-gray-400'
                        }`} />
                        <span className={`ml-3 text-sm font-medium ${
                          selectedTemplate === key ? 'text-white' : 'text-gray-700'
                        }`}>
                          {key.charAt(0).toUpperCase() + key.slice(1)} Email
                        </span>
                      </div>
                      {template.enabled && (
                        <CheckCircle className={`h-5 w-5 ${
                          selectedTemplate === key ? 'text-white' : 'text-emerald-500'
                        }`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Template Editor */}
          <div className="col-span-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Edit Template
                  </h2>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIsPreviewOpen(true)}
                      className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </button>
                    <button
                      onClick={handleSendTest}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors duration-200"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Test
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <EmailTemplateEditor
                    template={templates[selectedTemplate as keyof typeof templates]}
                    onChange={(field, value) => handleTemplateChange(selectedTemplate, field, value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EmailPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        template={templates[selectedTemplate as keyof typeof templates]}
        businessName={settings?.branding?.businessName || 'Your Business'}
        logoUrl={settings?.branding?.logoUrl}
      />
    </div>
  );
}