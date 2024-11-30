import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Gift, AlertCircle } from 'lucide-react';
import { Member } from '../../types/member';
import { useMemberStore } from '../../store/memberStore';
import { useTransactionStore } from '../../store/transactionStore';
import toast from 'react-hot-toast';

interface RedeemBenefitModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  onRedeem: (benefitId: string) => void;
}

export default function RedeemBenefitModal({
  isOpen,
  onClose,
  member,
  onRedeem
}: RedeemBenefitModalProps) {
  const [selectedBenefitId, setSelectedBenefitId] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const addActivity = useMemberStore(state => state.addActivity);
  const updateMember = useMemberStore(state => state.updateMember);
  const recordBenefitRedemption = useTransactionStore(state => state.recordBenefitRedemption);

  const canRedeemBenefits = member.status === 'active';
  const availableBenefits = member.benefits?.filter(benefit => !benefit.used) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canRedeemBenefits) {
      toast.error('Cannot redeem benefits while membership is stopped');
      return;
    }

    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    try {
      const benefit = member.benefits.find(b => b.id === selectedBenefitId);
      if (!benefit) {
        throw new Error('Benefit not found');
      }

      const updatedBenefits = member.benefits.map(b =>
        b.id === selectedBenefitId ? { ...b, used: true } : b
      );

      // Update member benefits
      const updatedMember = await updateMember(member.id, {
        benefits: updatedBenefits,
        lastActivity: new Date().toISOString()
      });

      if (updatedMember) {
        // Record the transaction
        await recordBenefitRedemption(member.id, benefit.id, benefit.name);

        // Add activity log
        addActivity({
          memberId: member.id,
          type: 'benefit_usage',
          description: `Redeemed benefit: ${benefit.name}`,
          timestamp: new Date().toISOString(),
          metadata: {
            benefitId: benefit.id,
            benefitName: benefit.name,
            expiryDate: benefit.expiryDate
          }
        });

        toast.success(`Successfully redeemed "${benefit.name}"`);
        onClose();
      }
    } catch (error) {
      console.error('Failed to redeem benefit:', error);
      toast.error('Failed to redeem benefit');
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* ... rest of the modal UI code remains the same ... */}
      </Dialog>
    </Transition.Root>
  );
}