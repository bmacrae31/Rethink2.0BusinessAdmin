import { useState } from 'react';
import { Plus, Search, Mail } from 'lucide-react';
import { useMembershipStore } from '../../store/membershipStore';
import CreateMembershipModal from './CreateMembershipModal';
import MembershipTierCard from './MembershipTierCard';
import ErrorBoundary from '../common/ErrorBoundary';
import toast from 'react-hot-toast';

export default function MembershipList() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const memberships = useMembershipStore((state) => Object.values(state.memberships));
  const createMembership = useMembershipStore((state) => state.createMembership);
  const updateMembership = useMembershipStore((state) => state.updateMembership);
  const deleteMembership = useMembershipStore((state) => state.deleteMembership);

  const handleCreateMembership = (data: any) => {
    createMembership({
      name: data.tierName,
      description: data.description,
      monthlyPrice: data.monthlyPrice,
      yearlyPrice: data.yearlyPrice,
      benefitIds: [],
      rewardRules: [{
        type: 'signup',
        amount: data.rewardValue,
        frequency: data.rewardFrequency.toLowerCase()
      }],
      status: data.status.toLowerCase()
    });
    setIsCreateModalOpen(false);
  };

  const handleEmailMembers = () => {
    // This is a placeholder - integrate with your email system
    toast.success('Email feature coming soon!');
  };

  const filteredMemberships = memberships.filter(membership =>
    membership?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false
  );

  return (
    <ErrorBoundary>
      <div>
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Membership Tiers</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your membership tiers and rewards programs.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-4">
            <button
              onClick={handleEmailMembers}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Members
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Membership
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search memberships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
            />
          </div>
        </div>

        {/* Membership Tiers Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMemberships.map((membership) => (
            <MembershipTierCard
              key={membership.id}
              membership={membership}
              onUpdate={updateMembership}
              onDelete={deleteMembership}
            />
          ))}
        </div>

        {filteredMemberships.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No membership tiers found.</p>
          </div>
        )}

        <CreateMembershipModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateMembership}
        />
      </div>
    </ErrorBoundary>
  );
}