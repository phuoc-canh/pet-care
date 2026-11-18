import { memo } from 'react';

import { QuickActionCard } from '@/components/pet/QuickActionCard';
import { strings } from '@/constants/strings';

interface UpcomingSummaryProps {
  petId: string;
  onPress: () => void;
}

/** Card "Lịch hẹn sắp tới" trên Home. Dữ liệu lịch hẹn được nối ở giai đoạn 4. */
function UpcomingSummaryBase({ onPress }: UpcomingSummaryProps) {
  return (
    <QuickActionCard
      tag={strings.petHome.upcomingTag}
      title={strings.petHome.upcomingTitle}
      description={strings.petHome.upcomingEmpty}
      icon="calendar"
      onPress={onPress}
    />
  );
}

export const UpcomingSummary = memo(UpcomingSummaryBase);
