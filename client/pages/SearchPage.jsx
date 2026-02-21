import AppLayout from '../components/AppLayout';
import UnifiedSearch from '../components/UnifiedSearch';

export default function SearchPage() {
  return (
    <AppLayout title="Search" subtitle="Unified audio-first search across all sources">
      <UnifiedSearch />
    </AppLayout>
  );
}
