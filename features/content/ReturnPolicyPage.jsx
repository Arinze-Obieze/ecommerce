'use client';

import { ReturnPolicyLayout } from '@/features/content/return-policy/ReturnPolicySections';
import useReturnPolicyPage from '@/features/content/return-policy/useReturnPolicyPage';

export default function ReturnPolicyPage() {
  const policy = useReturnPolicyPage();

  return (
    <ReturnPolicyLayout
      expandedCard={policy.expandedCard}
      openFaq={policy.openFaq}
      onToggleCard={policy.toggleCard}
      onToggleFaq={policy.toggleFaq}
    />
  );
}
