import { useState } from 'react';
import { Settings } from 'lucide-react';
import BusinessSettingsModal from './BusinessSettingsModal';

export default function BusinessSettingsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="ml-4 rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <span className="sr-only">Open business settings</span>
        <Settings className="h-6 w-6" />
      </button>

      <BusinessSettingsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}