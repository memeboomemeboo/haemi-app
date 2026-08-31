import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/hooks';
import { DailyMessageHeader } from './DailyMessageHeader';
import { MethodSelectStep, type DailyMessageMethod } from './steps/MethodSelectStep';
import { VoiceRecordStep } from './steps/VoiceRecordStep';
import { EmotionSelectStep } from './steps/EmotionSelectStep';
import { PhotoSelectStep } from './steps/PhotoSelectStep';
import { DoneStep } from './steps/DoneStep';

type Step = 'method' | 'voice' | 'emotion' | 'photo' | 'done';

const STEP_TITLE: Record<Exclude<Step, 'done'>, string> = {
  method: '이야기 전하기',
  voice: '이야기 말하기',
  emotion: '마음 전하기',
  photo: '사진 고르기',
};

const METHOD_STEP: Record<DailyMessageMethod, Step> = {
  voice: 'voice',
  emotion: 'emotion',
  photo: 'photo',
};

/**
 * 어르신이 오늘의 이야기를 가족에게 전하는 "하루 한마디" 플로우.
 * Figma node 1408:5896 / 1408:5931 / 1466:3023 / 1408:6014
 */
export default function DailyMessageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [step, setStep] = useState<Step>('method');

  const handleBack = useCallback(() => {
    if (step === 'method') {
      router.back();
      return;
    }
    setStep('method');
  }, [router, step]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background.normal }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 24) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {step !== 'done' && <DailyMessageHeader title={STEP_TITLE[step]} onBack={handleBack} />}
        {step === 'method' && (
          <MethodSelectStep onNext={(method) => setStep(METHOD_STEP[method])} />
        )}
        {step === 'voice' && <VoiceRecordStep onSent={() => setStep('done')} />}
        {step === 'emotion' && <EmotionSelectStep onSent={() => setStep('done')} />}
        {step === 'photo' && (
          <PhotoSelectStep
            onPicked={() => setStep('done')}
            onCancelled={() => setStep('method')}
          />
        )}
        {step === 'done' && <DoneStep onRestart={() => router.replace('/')} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
});
