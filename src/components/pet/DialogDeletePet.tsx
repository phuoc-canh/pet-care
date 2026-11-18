import { memo } from 'react';

import { DialogConfirm } from '@/components/common/DialogConfirm';
import { strings } from '@/constants/strings';

export interface DialogDeletePetProps {
  visible: boolean;
  petName: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function DialogDeletePetBase({ visible, petName, loading, onConfirm, onCancel }: DialogDeletePetProps) {
  return (
    <DialogConfirm
      visible={visible}
      emoji="🗑️"
      title={strings.petDetail.deleteTitle(petName)}
      message={strings.petDetail.deleteBody}
      confirmLabel={strings.common.delete}
      destructive
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

export const DialogDeletePet = memo(DialogDeletePetBase);
