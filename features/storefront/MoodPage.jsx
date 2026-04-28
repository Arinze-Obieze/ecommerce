'use client';

import { MoodPageError, MoodPageLayout, MoodPageLoading } from '@/features/storefront/mood/MoodSections';
import useMoodPage from '@/features/storefront/mood/useMoodPage';

export default function MoodPage({ slug }) {
  const moodPage = useMoodPage(slug);

  if (moodPage.loading) {
    return <MoodPageLoading />;
  }

  if (moodPage.error || !moodPage.mood) {
    return <MoodPageError error={moodPage.error} />;
  }

  return <MoodPageLayout moodPage={moodPage} />;
}
