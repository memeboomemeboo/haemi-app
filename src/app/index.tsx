import { useRouter } from 'expo-router';
import ElderPinScreen from '@/pages/ElderPin';
import { View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import HomeScreen from '@/pages/Home';
import ElderHomeScreen from '@/pages/ElderHome';
import AuthStack from '@/pages/Auth/AuthStack';
import { useUserGroup } from '@/entities/user';
import { useUserContext } from '@/shared/context/UserContext';
import { colors } from '@/shared/constants';

export default function RootScreen() {
  const router = useRouter();

  const handlePinComplete = (pin: string) => {
    console.log('PIN entered:', pin);
    router.replace('/elder-home');
  };

  // 어르신 화면: PIN 입력 → 홈
  return <ElderPinScreen onComplete={handlePinComplete} />;
}
