import React from 'react';
import { Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ComingSoonSection from '../ui/ComingSoonSection';

export default function KitTab() {
  const { t } = useTranslation('profile');

  return (
    <ComingSoonSection
      icon={Briefcase}
      title={t('editProfile.nav.applicationKit')}
      subtitle={t('editProfile.comingSoon.kitSub')}
    />
  );
}
