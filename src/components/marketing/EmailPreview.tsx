import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import '@fontsource/inter';

interface EmailPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  template: {
    subject: string;
    body: string;
  };
  businessName: string;
  logoUrl?: string;
}

export default function EmailPreview({
  isOpen,
  onClose,
  template,
  businessName,
  logoUrl
}: EmailPreviewProps) {
  const sampleData = {
    CustomerName: 'John Smith',
    BusinessName: businessName,
    MembershipName: 'Gold Membership',
    RewardsBalance: '250.00',
    ExpirationDate: '12/31/2024',
    BusinessLogo: logoUrl ? `<img src="${logoUrl}" alt="${businessName}" style="height: 50px; width: auto;" />` : ''
  };

  const replaceVariables = (text: string) => {
    return text.replace(
      /{(\w+)}/g,
      (match, key) => sampleData[key as keyof typeof sampleData] || match
    );
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

                <div>
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Email Preview
                    </Dialog.Title>

                    <div className="mt-4 bg-gray-50 rounded-lg p-6">
                      {/* Email Content */}
                      <div className="bg-white rounded-lg shadow-sm p-8 font-['Inter']">
                        {/* Logo Header */}
                        {logoUrl && (
                          <div className="mb-6 flex justify-center">
                            <img 
                              src={logoUrl} 
                              alt={businessName} 
                              className="h-12 w-auto object-contain"
                            />
                          </div>
                        )}

                        {/* Subject Line */}
                        <div className="mb-6 p-3 bg-gray-50 rounded border border-gray-200">
                          <span className="text-sm font-medium text-gray-500">Subject: </span>
                          <span className="text-sm text-gray-900">{replaceVariables(template.subject)}</span>
                        </div>

                        {/* Email Body */}
                        <div className="space-y-4">
                          <div 
                            className="whitespace-pre-wrap text-base text-gray-900 leading-relaxed font-['Inter']"
                            dangerouslySetInnerHTML={{ __html: replaceVariables(template.body) }}
                          />
                        </div>
                      </div>
                    </div>
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