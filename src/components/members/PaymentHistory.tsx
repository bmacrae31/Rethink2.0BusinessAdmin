import { format } from 'date-fns';
import { usePaymentStore } from '../../store/paymentStore';
import { Member } from '../../types/member';

interface PaymentHistoryProps {
  member: Member;
}

export default function PaymentHistory({ member }: PaymentHistoryProps) {
  const getPaymentHistory = usePaymentStore((state) => state.getPaymentHistory);
  const payments = getPaymentHistory(member.id);

  if (payments.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-500">No payment history available.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              Date
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Description
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Amount
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Cashback
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                {format(new Date(payment.timestamp), 'MMM d, yyyy h:mm a')}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {payment.description}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                ${payment.amount.toFixed(2)}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm">
                {payment.cashbackEarned > 0 ? (
                  <span className="text-green-600">+${payment.cashbackEarned.toFixed(2)}</span>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm">
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    payment.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : payment.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}