import { useRouter } from 'expo-router';
import ElderPinScreen from '@/pages/ElderPin';

export default function ElderPinRoute() {
  const router = useRouter();

  const handleComplete = (pin: string) => {
    // PIN 검증 후 홈으로 이동
    console.log('PIN entered:', pin);
    router.replace('/elder-home');
  };

  return <ElderPinScreen onComplete={handleComplete} />;
}
