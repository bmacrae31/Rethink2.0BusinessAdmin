import { Fragment, useState, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Upload, AlertCircle, FileText, Check } from 'lucide-react';
import Papa from 'papaparse';
import { useMemberStore } from '../../store/memberStore';
import { useMembershipStore } from '../../store/membershipStore';
import { format, parse } from 'date-fns';
import toast from 'react-hot-toast';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ImportedMember {
  'Member Name': string;
  'Email Address': string;
  'Phone Number': string;
  'Membership': string;
  'Expiration Date': string;
  'Rewards Balance': string;
  'Total Payment': string;
  'Last Visit Date': string;
}

export default function BulkImportModal({ isOpen, onClose }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ImportedMember[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const createMember = useMemberStore(state => state.createMember);
  const memberships = useMembershipStore(state => Object.values(state.memberships));

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setPreviewData(results.data as ImportedMember[]);
          setTotalCount(results.data.length);
        },
        error: (error) => {
          toast.error(`Error parsing CSV: ${error.message}`);
        }
      });
    }
  }, []);

  const cleanAmount = (amount: string) => {
    return parseFloat(amount.replace(/[$,]/g, '')) || 0;
  };

  const findMatchingMembership = (importedMembershipName: string) => {
    return memberships.find(m => 
      m.name.toLowerCase() === importedMembershipName.toLowerCase().trim()
    );
  };

  const handleImport = async () => {
    setIsProcessing(true);
    setProcessedCount(0);
    setErrors([]);

    const newErrors: string[] = [];
    let processed = 0;

    for (const row of previewData) {
      try {
        const matchingMembership = findMatchingMembership(row.Membership);
        if (!matchingMembership) {
          throw new Error(`No matching membership found for "${row.Membership}"`);
        }

        const expirationDate = parse(row['Expiration Date'], 'M/d/yyyy h:mm:ss a', new Date());
        const lastVisitDate = row['Last Visit Date'] ? 
          parse(row['Last Visit Date'], 'M/d/yyyy h:mm:ss a', new Date()) : 
          new Date();

        await createMember({
          name: row['Member Name'],
          email: row['Email Address'],
          phone: row['Phone Number'],
          membershipTier: matchingMembership.id,
          status: 'active',
          joinDate: format(lastVisitDate, 'yyyy-MM-dd'),
          rewardsBalance: cleanAmount(row['Rewards Balance']),
          autoRenew: false,
          nextRenewalDate: format(expirationDate, 'yyyy-MM-dd'),
          benefits: matchingMembership.benefits,
          paymentMethods: [],
          totalSpent: cleanAmount(row['Total Payment']),
          lastActivity: format(lastVisitDate, 'yyyy-MM-dd\'T\'HH:mm:ss')
        });

        processed++;
        setProcessedCount(processed);
      } catch (error) {
        newErrors.push(`Error importing ${row['Member Name']}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    setErrors(newErrors);
    setIsProcessing(false);

    if (newErrors.length === 0) {
      toast.success('All members imported successfully!');
      onClose();
    } else {
      toast.error(`Imported ${processed} members with ${newErrors.length} errors`);
    }
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
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform rounded-lg bg-white shadow-xl transition-all w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Upload className="h-5 w-5 text-blue-600" />
                    </div>
                    <Dialog.Title className="text-lg font-semibold text-gray-900">
                      Bulk Import Members
                    </Dialog.Title>
                  </div>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {!file && (
                    <div className="flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                      <div className="text-center">
                        <FileText className="mx-auto h-12 w-12 text-gray-300" />
                        <div className="mt-4 flex text-sm leading-6 text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                          >
                            <span>Upload a CSV file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              accept=".csv"
                              className="sr-only"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-600">CSV files only</p>
                      </div>
                    </div>
                  )}

                  {file && previewData.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {file.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {previewData.length} members found
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFile(null);
                            setPreviewData([]);
                          }}
                          className="text-sm text-red-600 hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Membership
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Expiration
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Rewards
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {previewData.map((row, index) => (
                                <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {row['Member Name']}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {row['Email Address']}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {row['Membership']}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {row['Expiration Date']}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {row['Rewards Balance']}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {errors.length > 0 && (
                        <div className="rounded-md bg-red-50 p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <AlertCircle className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-red-800">
                                Import Errors ({errors.length})
                              </h3>
                              <div className="mt-2 text-sm text-red-700">
                                <ul className="list-disc pl-5 space-y-1">
                                  {errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {isProcessing && (
                        <div className="rounded-md bg-blue-50 p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <Check className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-blue-800">
                                Importing Members...
                              </h3>
                              <div className="mt-2 text-sm text-blue-700">
                                Processed {processedCount} of {totalCount} members
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isProcessing}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={!file || isProcessing}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Importing...' : 'Import Members'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}