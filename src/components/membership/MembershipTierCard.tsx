import { useState } from 'react';
import { Users, DollarSign, Gift, Clock, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { MembershipTier } from '../../store/membershipStore';
import EditMembershipModal from './EditMembershipModal';

interface MembershipTierCardProps {
  membership: MembershipTier;
  onUpdate: (id: string, updates: Partial<MembershipTier>) => void;
  onDelete: (id: string) => void;
}

export default function MembershipTierCard({ membership, onUpdate, onDelete }: MembershipTierCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Calculate MRR and ARR
  const calculateRevenue = () => {
    const memberCount = membership.memberCount || 0;
    let mrr = 0;
    let arr = 0;

    if (membership.monthlyPrice) {
      mrr = membership.monthlyPrice * memberCount;
      arr = mrr * 12;
    }

    if (membership.yearlyPrice) {
      const yearlyMembers = Math.floor(memberCount * 0.6); // Assuming 60% yearly subscribers
      const monthlyMembers = memberCount - yearlyMembers;
      
      const yearlyMRR = membership.yearlyPrice.secondYear * yearlyMembers / 12;
      const monthlyMRR = (membership.monthlyPrice || 0) * monthlyMembers;
      
      mrr = yearlyMRR + monthlyMRR;
      arr = yearlyMRR * 12 + monthlyMRR * 12;
    }

    return { mrr, arr };
  };

  const { mrr, arr } = calculateRevenue();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">{membership.name}</h3>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-gray-500"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setIsEditModalOpen(true);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(membership.id);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-gray-50 w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-4">
          {membership.monthlyPrice && (
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">${membership.monthlyPrice}</span>
              <span className="ml-1 text-sm text-gray-600">/month</span>
            </div>
          )}
          {membership.yearlyPrice && (
            <div className="mt-1 text-sm text-emerald-600">
              ${membership.yearlyPrice.firstYear}/first year • ${membership.yearlyPrice.secondYear}/second year
            </div>
          )}
        </div>

        {/* Revenue Metrics */}
        <div className="mt-4 bg-gray-50 rounded-md p-3 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</span>
            <span className="text-sm font-semibold text-indigo-600">${mrr.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Annual Recurring Revenue</span>
            <span className="text-sm font-semibold text-emerald-600">${arr.toLocaleString()}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-indigo-400" />
            <span className="ml-2 text-sm font-medium text-indigo-900">{membership.memberCount} members</span>
          </div>
          <div className="flex items-center">
            <Gift className="h-5 w-5 text-emerald-400" />
            <span className="ml-2 text-sm font-medium text-emerald-900">
              ${membership.rewardValue} rewards/{membership.rewardFrequency.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Benefits */}
        {membership.benefits.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900">Benefits</h4>
            <ul className="mt-2 space-y-2">
              {membership.benefits.map((benefit) => (
                <li key={benefit.id} className="text-sm text-gray-600 flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mr-2"></span>
                  <span className="text-indigo-900">
                    {benefit.name} ({benefit.frequency}, expires in {benefit.expiresInMonths} months)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cashback Section */}
        {membership.cashback?.enabled && (
          <div className="mt-4 bg-green-50 rounded-md p-3 border border-green-100">
            <h4 className="text-sm font-medium text-green-900">Cashback Rewards</h4>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between">
                <span className="text-sm text-green-700">Rate</span>
                <span className="text-sm font-medium text-green-900">{membership.cashback.rate}%</span>
              </div>
              {membership.cashback.limits?.perTransaction && (
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Max per Transaction</span>
                  <span className="text-sm font-medium text-green-900">
                    ${membership.cashback.limits.perTransaction}
                  </span>
                </div>
              )}
              {membership.cashback.limits?.monthly && (
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Monthly Limit</span>
                  <span className="text-sm font-medium text-green-900">
                    ${membership.cashback.limits.monthly}
                  </span>
                </div>
              )}
              {membership.cashback.limits?.annual && (
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Annual Limit</span>
                  <span className="text-sm font-medium text-green-900">
                    ${membership.cashback.limits.annual}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="mt-6">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              membership.status === 'active'
                ? 'bg-emerald-100 text-emerald-800'
                : membership.status === 'draft'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {membership.status.charAt(0).toUpperCase() + membership.status.slice(1)}
          </span>
        </div>
      </div>

      <EditMembershipModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        membership={membership}
        onUpdate={(updates) => onUpdate(membership.id, updates)}
      />
    </div>
  );
}