import React from 'react';
import { Switch } from '@headlessui/react';
import '@fontsource/inter';

interface EmailTemplateEditorProps {
  template: {
    enabled: boolean;
    subject: string;
    body: string;
  };
  onChange: (field: string, value: any) => void;
}

export default function EmailTemplateEditor({ template, onChange }: EmailTemplateEditorProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Switch
            checked={template.enabled}
            onChange={(checked) => onChange('enabled', checked)}
            className={`${
              template.enabled ? 'bg-emerald-500' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                template.enabled ? 'translate-x-5' : 'translate-x-0'
              } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
          </Switch>
          <span className="ml-3 text-sm font-medium text-gray-900">
            {template.enabled ? 'Template Enabled' : 'Template Disabled'}
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
          Subject Line
        </label>
        <input
          type="text"
          id="subject"
          value={template.subject}
          onChange={(e) => onChange('subject', e.target.value)}
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm bg-white"
          placeholder="Enter email subject..."
        />
        <p className="mt-2 text-xs text-gray-500">
          Available variables: {'{CustomerName}'}, {'{BusinessName}'}, {'{MembershipName}'},
          {'{RewardsBalance}'}, {'{ExpirationDate}'}, {'{BusinessLogo}'}
        </p>
      </div>

      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-700">
          Email Body
        </label>
        <div className="mt-1 rounded-lg border border-gray-300 shadow-sm overflow-hidden focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900">
          <textarea
            id="body"
            rows={12}
            value={template.body}
            onChange={(e) => onChange('body', e.target.value)}
            className="block w-full border-0 py-3 focus:ring-0 sm:text-sm font-['Inter'] bg-white resize-none"
            placeholder="Enter email content..."
          />
        </div>
      </div>
    </div>
  );
}