'use client';

import { useState } from 'react';

export default function useReturnPolicyPage() {
  const [expandedCard, setExpandedCard] = useState('seller');
  const [openFaq, setOpenFaq] = useState(null);

  return {
    expandedCard,
    openFaq,
    toggleCard: (cardId) => setExpandedCard((current) => (current === cardId ? null : cardId)),
    toggleFaq: (index) => setOpenFaq((current) => (current === index ? null : index)),
  };
}
