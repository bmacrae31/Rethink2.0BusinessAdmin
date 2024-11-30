import { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useMemberStore } from '../../store/memberStore';
import { useTransactionStore } from '../../store/transactionStore';
import { useMembershipStore } from '../../store/membershipStore';

export default function Overview() {
  const members = useMemberStore((state) => Object.values(state.members));
  const activities = useMemberStore((state) => Object.values(state.activities));
  const transactions = useTransactionStore((state) => state.getTransactions());
  const memberships = useMembershipStore((state) => state.memberships);

  // Calculate stats
  const activeSubscriptions = members.filter(m => m.status === 'active').length;
  const monthlyRevenue = members.reduce((sum, member) => {
    const membership = memberships[member.membershipTier];
    if (member.status === 'active' && membership?.monthlyPrice) {
      return sum + membership.monthlyPrice;
    }
    return sum;
  }, 0);

  const stats = [
    { 
      name: 'Active Subscriptions', 
      stat: activeSubscriptions.toString(), 
      icon: Users, 
      change: '+2.15%', 
      changeType: 'increase' 
    },
    { 
      name: 'Monthly Recurring Revenue', 
      stat: `$${monthlyRevenue.toFixed(2)}`, 
      icon: DollarSign, 
      change: '+12.5%', 
      changeType: 'increase' 
    },
    { 
      name: 'Annual Recurring Revenue', 
      stat: `$${(monthlyRevenue * 12).toFixed(2)}`, 
      icon: TrendingUp, 
      change: '+15.2%', 
      changeType: 'increase' 
    },
    { 
      name: 'Total Recurring Revenue', 
      stat: `$${(monthlyRevenue * 13).toFixed(2)}`, 
      icon: DollarSign, 
      change: '+14.8%', 
      changeType: 'increase' 
    }
  ];

  // Combine and sort all recent activity
  const recentActivity = [...activities]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)
    .map(activity => {
      const member = members.find(m => m.id === activity.memberId);
      const membership = member ? memberships[member.membershipTier] : null;

      return {
        id: activity.id,
        type: activity.type,
        description: activity.description,
        timestamp: activity.timestamp,
        memberName: member?.name || 'Unknown Member',
        amount: activity.metadata?.amount,
        membershipName: membership?.name
      };
    });

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className="absolute bg-gray-900 rounded-md p-3">
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">{item.name}</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {recentActivity.map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== recentActivity.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center ring-8 ring-white">
                          <Clock className="h-5 w-5 text-white" />
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium text-gray-900">{activity.memberName}</span>
                            {' '}{activity.description}
                            {activity.amount && (
                              <span className="font-medium text-gray-900">
                                {' '}(${activity.amount.toFixed(2)})
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={activity.timestamp}>
                            {format(new Date(activity.timestamp), 'h:mm a')}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}