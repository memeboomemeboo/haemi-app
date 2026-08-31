import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';

import {
  CAREGIVER_HOME_MAX_WIDTH,
  CAREGIVER_TASKS,
  type CaregiverTask,
} from '@/pages/CaregiverHome/constants';
import {
  conditionCopy,
  elderDisplayName,
  lastLoginMeta,
  toCaregiverRecords,
  toWeeklyActivityDays,
} from '@/pages/CaregiverHome/lib';
import { getElderActivities, getGuardianHome } from '@/shared/api/guardian-home';
import { myPageService } from '@/shared/api/my-page';
import { useAsyncData } from '@/shared/hooks';
import type { Href } from 'expo-router';
import type { TodayActivities } from '@/shared/types/guardian-home';

const EMPTY_ACTIVITIES: TodayActivities = { date: '', items: [] };

const fetchGuardianName = () => myPageService.getProfile();

export function useCaregiverHome() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  // 사용자가 명시적으로 고른 어르신. null이면 목록의 첫 어르신을 기본으로 쓴다.
  const [pickedElderId, setPickedElderId] = useState<string | null>(null);

  const screenWidth = useMemo(() => Math.min(width, CAREGIVER_HOME_MAX_WIDTH), [width]);

  const profileState = useAsyncData(fetchGuardianName);
  const homeState = useAsyncData(getGuardianHome);
  const refetchProfile = profileState.refetch;
  const refetchHome = homeState.refetch;

  const elders = useMemo(() => homeState.data?.elders ?? [], [homeState.data]);

  // 선택값을 effect 없이 파생한다: 고른 어르신이 목록에 있으면 그것을, 없으면 첫 어르신.
  const selectedElderId = useMemo(() => {
    if (pickedElderId && elders.some((e) => e.elderId === pickedElderId)) {
      return pickedElderId;
    }
    return elders[0]?.elderId ?? null;
  }, [elders, pickedElderId]);

  // 어르신 변경 시 fetcher 참조가 바뀌어 오늘 기록을 재조회한다.
  const fetchActivities = useCallback(() => {
    if (!selectedElderId) return Promise.resolve(EMPTY_ACTIVITIES);
    return getElderActivities(selectedElderId);
  }, [selectedElderId]);

  const activitiesState = useAsyncData(fetchActivities);
  const refetchActivities = activitiesState.refetch;

  const refetchAll = useCallback(async (): Promise<void> => {
    await Promise.all([refetchProfile(), refetchHome(), refetchActivities()]);
  }, [refetchActivities, refetchHome, refetchProfile]);

  // 최초 진입은 useAsyncData가 조회한다. 다른 화면에서 돌아온 경우에만
  // 완료 상태와 오늘 기록을 함께 갱신한다.
  const hasFocusedRef = useRef(false);
  const refetchAllRef = useRef(refetchAll);
  useEffect(() => {
    refetchAllRef.current = refetchAll;
  }, [refetchAll]);

  useFocusEffect(
    useCallback(() => {
      if (!hasFocusedRef.current) {
        hasFocusedRef.current = true;
        return;
      }
      void refetchAllRef.current();
    }, []),
  );

  const selectedElder = useMemo(
    () => elders.find((e) => e.elderId === selectedElderId) ?? null,
    [elders, selectedElderId],
  );

  const condition = useMemo(
    () => conditionCopy(selectedElder?.condition ?? null),
    [selectedElder],
  );

  const conditionMeta = useMemo(
    () => lastLoginMeta(selectedElder?.lastLoginAt ?? null),
    [selectedElder],
  );

  const weeklyDays = useMemo(() => {
    const weekly = selectedElder?.weeklyActivities ?? [];
    const todayIso = weekly.length > 0 ? weekly[weekly.length - 1].date : '';
    return toWeeklyActivityDays(weekly, todayIso);
  }, [selectedElder]);

  const records = useMemo(
    () => toCaregiverRecords(activitiesState.data?.items ?? []),
    [activitiesState.data],
  );

  const tasks = useMemo(() => {
    const challenge = homeState.data?.challenge ?? {
      greetingCompleted: false,
      memoryCompleted: false,
    };
    return CAREGIVER_TASKS.map((task) => ({
      ...task,
      completed: challenge[task.completionKey],
    }));
  }, [homeState.data]);

  const elderOptions = useMemo(
    () => elders.map((e) => ({ elderId: e.elderId, label: elderDisplayName(e) })),
    [elders],
  );

  const greetingTitle = profileState.data?.name
    ? `${profileState.data.name}님, 안녕하세요`
    : '안녕하세요';

  const togglePatientDropdown = useCallback(() => {
    setIsPatientDropdownOpen((current) => !current);
  }, []);

  const selectElder = useCallback((elderId: string) => {
    setPickedElderId(elderId);
    setIsPatientDropdownOpen(false);
  }, []);

  const openTask = useCallback(
    (href: Href) => {
      router.push(href);
    },
    [router],
  );

  return {
    // 상태
    isLoading: homeState.isLoading,
    isError: homeState.isError,
    refetch: refetchAll,
    recordsLoading: activitiesState.isLoading,
    recordsError: activitiesState.isError,
    hasElders: elders.length > 0,
    // 파생 데이터
    greetingTitle,
    condition,
    conditionMeta,
    weeklyDays,
    records,
    tasks,
    elderOptions,
    selectedElderLabel: selectedElder ? elderDisplayName(selectedElder) : '',
    // 인터랙션
    screenWidth,
    isPatientDropdownOpen,
    togglePatientDropdown,
    selectElder,
    openTask,
  };
}

export type CaregiverTaskWithStatus = CaregiverTask & { completed: boolean };
