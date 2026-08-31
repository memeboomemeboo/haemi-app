import { useLocalSearchParams } from 'expo-router';
import AlbumDetailScreen from '@/pages/AlbumDetail';
import ElderAlbumDetailScreen from '@/pages/ElderAlbumDetail';
import { useUserContext } from '@/shared/context/UserContext';

export default function AlbumDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { role } = useUserContext();
  return role === 'ELDER' ? <ElderAlbumDetailScreen id={id} /> : <AlbumDetailScreen id={id} />;
}
