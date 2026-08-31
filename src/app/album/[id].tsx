import { useLocalSearchParams } from 'expo-router';
import AlbumDetailScreen from '@/pages/AlbumDetail';

export default function AlbumDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AlbumDetailScreen id={id} />;
}
