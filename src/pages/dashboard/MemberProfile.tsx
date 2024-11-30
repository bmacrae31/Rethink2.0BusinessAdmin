import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CreditCard, Receipt, DollarSign } from 'lucide-react';
import { useMemberStore } from '../../store/memberStore';
import { useMembershipStore } from '../../store/membershipStore';
import UpdatePaymentModal from '../../components/members/UpdatePaymentModal';
import PaymentHistoryModal from '../../components/members/PaymentHistoryModal';
import PayBillModal from '../../components/members/PayBillModal';
import toast from 'react-hot-toast';

export default function MemberProfile() {
  const { memberId } = useParams();
  const member = useMemberStore(state => state.getMember(memberId || ''));
  const activities = useMemberStore(state => memberId ? state.getMemberActivities(memberId) : []);
  const updateMember = useMemberStore(state => state.updateMember);
  const addActivity = useMemberStore(state => state.addActivity);
  const getMembershipName = useMembershipStore(state => state.getMembershipDisplayName);

  const [isUpdatePaymentModalOpen, setIsUpdatePaymentModalOpen] = useState(false);
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);
  const [isPayBillModalOpen, setIsPayBillModalOpen] = useState(false);
  const [rewardAmount, setRewardAmount] = useState('');

  if (!member) {
    return <div>Member not found</div>;
  }

  const membershipName = getMembershipName(member.membershipTier);
  const canRedeemValue = member.status === 'active';

  const handleRewardRedeem = async () => {
    if (!canRedeemValue) {
      toast.error('Cannot redeem rewards while membership is not active');
      return;
    }

    try {
      const amount = parseFloat(rewardAmount);
      if (amount > member.rewardsBalance) {
        toast.error('Redemption amount cannot exceed available balance');
        return;
      }

      const updatedMember = await updateMember(member.id, {
        rewardsBalance: member.rewardsBalance - amount,
        lastActivity: new Date().toISOString(),
      });

      if (updatedMember) {
        addActivity({
          memberId: member.id,
          type: 'reward_redemption',
          description: `Redeemed $${amount.toFixed(2)} in rewards`,
          timestamp: new Date().toISOString(),
          metadata: {
            amount
          }
        });

        toast.success(`Successfully redeemed $${amount.toFixed(2)} in rewards`);
        setRewardAmount('');
      }
    } catch (error) {
      console.error('Failed to redeem rewards:', error);
      toast.error('Failed to redeem rewards');
    }
  };

  return (
    <div className="space-y-6">
      {/* Member Header */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{member.name}</h1>
            <p className="text-sm text-gray-500">{member.email}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsUpdatePaymentModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 min-w-[140px]"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Update Payment
            </button>
            <button
              onClick={() => setIsPaymentHistoryModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 min-w-[140px]"
            >
              <Receipt className="h-4 w-4 mr-2" />
              Payment History
            </button>
          </div>
        </div>

        {/* Member Details */}
        <div className="mt-6 grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Membership Tier</h3>
            <p className="mt-1 text-sm text-gray-900">{membershipName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Join Date</h3>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(member.joinDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="mt-1">
              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                member.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
              </span>
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Next Renewal</h3>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(member.nextRenewalDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Rewards & Benefits Section */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900">Rewards & Benefits</h2>
        
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Rewards */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-900">Available Rewards</h3>
            <div className="mt-2">
              <div className="text-3xl font-semibold text-blue-600">
                ${member.rewardsBalance.toFixed(2)}
              </div>
              <div className="mt-4 space-y-4">
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={rewardAmount}
                      onChange={(e) => setRewardAmount(e.target.value)}
                      min="0"
                      max={member.rewardsBalance}
                      step="0.01"
                      placeholder="Enter amount to redeem"
                      className="block w-full h-12 px-4 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
                    />
                  </div>
                  <button
                    onClick={() => setRewardAmount(member.rewardsBalance.toString())}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Use Max
                  </button>
                </div>
                <button
                  onClick={handleRewardRedeem}
                  disabled={!rewardAmount || parseFloat(rewardAmount) <= 0}
                  className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    rewardAmount && parseFloat(rewardAmount) > 0
                      ? 'bg-black hover:bg-gray-800'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  Redeem Rewards
                </button>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-900">Available Benefits</h3>
            <div className="mt-2 space-y-4">
              {member.benefits.filter(b => !b.used).map((benefit) => (
                <div key={benefit.id} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{benefit.name}</p>
                    <p className="text-xs text-gray-500">
                      Expires: {new Date(benefit.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const updatedBenefits = member.benefits.map(b =>
                        b.id === benefit.id ? { ...b, used: true } : b
                      );
                      updateMember(member.id, { benefits: updatedBenefits });
                      toast.success(`Benefit "${benefit.name}" redeemed successfully`);
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-black hover:bg-gray-800"
                  >
                    Redeem
                  </button>
                </div>
              ))}
              {member.benefits.filter(b => !b.used).length === 0 && (
                <p className="text-sm text-gray-500">No available benefits</p>
              )}
            </div>
          </div>
        </div>

        {/* Pay Bill Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            onClick={() => setIsPayBillModalOpen(true)}
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Pay Bill
          </button>
          <button
            onClick={() => setIsPayBillModalOpen(true)}
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Pay Bill Cash
          </button>
        </div>
      </div>

      {/* Activity History */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Activity History</h2>
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                  Date
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Activity
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {activities.map((activity) => (
                <tr key={activity.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {activity.type.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {activity.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <UpdatePaymentModal
        isOpen={isUpdatePaymentModalOpen}
        onClose={() => setIsUpdatePaymentModalOpen(false)}
        member={member}
      />

      <PaymentHistoryModal
        isOpen={isPaymentHistoryModalOpen}
        onClose={() => setIsPaymentHistoryModalOpen(false)}
        member={member}
      />

      <PayBillModal
        isOpen={isPayBillModalOpen}
        onClose={() => setIsPayBillModalOpen(false)}
        member={member}
        onPaymentComplete={() => {
          updateMember(member.id, {});
        }}
      />
    </div>
  );
}