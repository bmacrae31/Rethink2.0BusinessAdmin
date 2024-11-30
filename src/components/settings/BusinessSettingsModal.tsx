import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition, Tab } from '@headlessui/react';
import { X } from 'lucide-react';
import BrandingSettings from './BrandingSettings';
import PaymentSettings from './PaymentSettings';
import { getBusinessSettings } from '../../api/settings';
import { BusinessSettings } from '../../types/settings';

interface BusinessSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BusinessSettingsModal({ isOpen, onClose }: BusinessSettingsModalProps) {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await getBusinessSettings();
      setSettings(data);
    };
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const tabs = [
    { name: 'Branding', component: BrandingSettings },
    { name: 'Payment', component: PaymentSettings },
  ];

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
              <Dialog.Panel className="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
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
                      Business Settings
                    </Dialog.Title>

                    {settings && (
                      <div className="mt-6">
                        <Tab.Group>
                          <Tab.List className="flex space-x-4 border-b border-gray-200">
                            {tabs.map((tab) => (
                              <Tab
                                key={tab.name}
                                className={({ selected }) =>
                                  `border-b-2 py-2 px-4 text-sm font-medium focus:outline-none ${
                                    selected
                                      ? 'border-blue-500 text-blue-600'
                                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                  }`
                                }
                              >
                                {tab.name}
                              </Tab>
                            ))}
                          </Tab.List>
                          <Tab.Panels className="mt-6">
                            <Tab.Panel>
                              <BrandingSettings
                                settings={settings.branding}
                                onSettingsUpdate={(branding) => setSettings({ ...settings, branding })}
                              />
                            </Tab.Panel>
                            <Tab.Panel>
                              <PaymentSettings
                                settings={settings.payment}
                                onSettingsUpdate={(payment) => setSettings({ ...settings, payment })}
                              />
                            </Tab.Panel>
                          </Tab.Panels>
                        </Tab.Group>
                      </div>
                    )}
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