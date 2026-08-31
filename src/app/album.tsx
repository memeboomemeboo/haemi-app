import AlbumScreen from '@/pages/Album';
import ElderAlbumScreen from '@/pages/ElderAlbum';
import { useUserContext } from '@/shared/context/UserContext';

export default function AlbumRoute() {
  const { role } = useUserContext();
  return role === 'ELDER' ? <ElderAlbumScreen /> : <AlbumScreen />;
}
