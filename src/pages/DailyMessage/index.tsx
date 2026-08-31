import { useCallback, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/hooks';
import { BackHeader } from '@/shared/ui';
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
  const { memoryId } = useLocalSearchParams<{ memoryId?: string }>();
  const [step, setStep] = useState<Step>('method');
  const handleSent = useCallback(() => setStep('done'), []);
  const handlePhotoCancelled = useCallback(() => setStep('method'), []);

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
        {step !== 'done' && (
          <BackHeader title={STEP_TITLE[step]} onBack={handleBack} style={styles.header} />
        )}
        {!memoryId ? (
          <Text style={styles.errorText}>어떤 추억에 대한 이야기인지 알 수 없어요.</Text>
        ) : (
          <>
            {step === 'method' && (
              <MethodSelectStep onNext={(method) => setStep(METHOD_STEP[method])} />
            )}
            {step === 'voice' && (
              <VoiceRecordStep memoryId={memoryId} onSent={handleSent} />
            )}
            {step === 'emotion' && (
              <EmotionSelectStep memoryId={memoryId} onSent={handleSent} />
            )}
            {step === 'photo' && (
              <PhotoSelectStep
                memoryId={memoryId}
                onPicked={handleSent}
                onCancelled={handlePhotoCancelled}
              />
            )}
            {step === 'done' && <DoneStep onRestart={() => router.replace('/')} />}
          </>
        )}
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
  header: {
    marginTop: 24,
    marginBottom: 44,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#76787a',
    textAlign: 'center',
    marginTop: 40,
  },
});
