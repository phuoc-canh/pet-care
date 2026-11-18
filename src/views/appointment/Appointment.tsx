import { EmptyState, Screen } from '@/components/ui';
import { strings } from '@/constants/strings';

export default function Appointment() {
  return (
    <Screen>
      <EmptyState emoji="📅" title={strings.comingSoon.title} description={strings.comingSoon.body} />
    </Screen>
  );
}
