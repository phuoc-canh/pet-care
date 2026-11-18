import { memo } from 'react';

import { DialogConfirm } from '@/components/common/DialogConfirm';
import { useTranslation } from 'react-i18next';

export interface DialogDeletePetProps {
  visible: boolean;
  petName: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function DialogDeletePetBase({ visible, petName, loading, onConfirm, onCancel }: DialogDeletePetProps) {
  const { t } = useTranslation();
  return (
    <DialogConfirm
      visible={visible}
      emoji="🗑️"
      title={t('pet.detail.deleteTitle', { name: petName })}
      message={t('pet.detail.deleteBody')}
      confirmLabel={t('common.delete')}
      destructive
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

export const DialogDeletePet = memo(DialogDeletePetBase);
