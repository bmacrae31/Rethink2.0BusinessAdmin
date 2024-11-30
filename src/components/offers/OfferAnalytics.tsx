import { useMemo } from 'react';
import { useOfferStore } from '../../store/offerStore';
import { useTransactionStore } from '../../store/transactionStore';
import { BarChart, DollarSign, Users, Tag } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

export default function OfferAnalytics() {
  const offers = useOfferStore(state => Object.values(state.offers));
  const transactions = useTransactionStore(state => state.getTransactions());

  const stats = useMemo(() => {
    const now = new Date();
    const monthsToShow = 6;
    const monthRange = eachMonthOfInterval({
      start: subMonths(startOfMonth(now), monthsToShow - 1),
      end: endOfMonth(now)
    });

    const monthlyRevenue = monthRange.map(month => {
      const start = startOfMonth(month);
      const end = endOfMonth(month);
      
      return {
        month: format(month, 'MMM yyyy'),
        revenue: transactions
          .filter(tx => 
            tx.type === 'offer_purchase' &&
            new Date(tx.timestamp) >= start &&
            new Date(tx.timestamp) <= end
          )
          .reduce((sum, tx) => sum + tx.amount, 0)
      };
    });

    const activeOffers = offers.filter(o => o.status === 'active').length;
    const totalRevenue = transactions
      .filter(tx => tx.type === 'offer_purchase')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalRedemptions = offers.reduce((sum, o) => sum + o.redemptionCount, 0);

    return {
      activeOffers,
      totalRevenue,
      totalRedemptions,
      monthlyRevenue
    };
  }, [offers, transactions]);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Tag className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Offers</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats.activeOffers}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    ${stats.totalRevenue.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Redemptions</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats.totalRedemptions}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Monthly Revenue</h3>
          <BarChart className="h-5 w-5 text-gray-400" />
        </div>
        <div className="relative h-64">
          <div className="absolute inset-0 flex items-end justify-between">
            {stats.monthlyRevenue.map((data, i) => (
              <div
                key={data.month}
                className="w-1/6 mx-1"
              >
                <div
                  className="bg-blue-600 rounded-t"
                  style={{
                    height: `${(data.revenue / Math.max(...stats.monthlyRevenue.map(d => d.revenue))) * 100}%`,
                    minHeight: '1px'
                  }}
                />
                <div className="mt-2 text-xs text-gray-500 text-center">
                  {data.month}
                </div>
                <div className="text-xs font-medium text-gray-900 text-center">
                  ${data.revenue.toFixed(0)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Offer Performance Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Offer Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Offer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Redemptions
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {offers.map(offer => {
                const offerTransactions = transactions.filter(tx => 
                  tx.type === 'offer_purchase' && tx.metadata?.offerId === offer.id
                );
                const revenue = offerTransactions.reduce((sum, tx) => sum + tx.amount, 0);
                const conversionRate = offer.redemptionCount > 0
                  ? ((offer.redemptionCount / offerTransactions.length) * 100).toFixed(1)
                  : '0';

                return (
                  <tr key={offer.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {offer.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        offer.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : offer.status === 'draft'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${revenue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {offer.redemptionCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {conversionRate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}