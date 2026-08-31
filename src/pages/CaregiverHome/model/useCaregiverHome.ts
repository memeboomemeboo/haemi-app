import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';

import {
  type CaregiverTask,
  CAREGIVER_HOME_MAX_WIDTH,
} from '@/pages/CaregiverHome/constants';
import { getCaregiverActivities, getCaregiverHome } from '@/shared/api';
import { useAsyncData } from '@/shared/hooks';
import type { CaregiverActivitiesResponse, CaregiverHomeElder } from '@/shared/types';

export function useCaregiverHome() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const [selectedElderId, setSelectedElderId] = useState<string | null>(null);
  const [activities, setActivities] = useState<CaregiverActivitiesResponse | null>(null);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState<Error | null>(null);

  const homeState = useAsyncData(getCaregiverHome);
  const elders = useMemo(() => homeState.data?.home.elders ?? [], [homeState.data]);
  const effectiveElderId = selectedElderId ?? elders[0]?.elderId ?? null;

  const loadActivities = useCallback(async () => {
    if (!effectiveElderId) {
      setActivities(null);
      setIsActivitiesLoading(false);
      return;
    }

    setIsActivitiesLoading(true);
    setActivitiesError(null);
    try {
      setActivities(await getCaregiverActivities(effectiveElderId));
    } catch (error) {
      setActivitiesError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsActivitiesLoading(false);
    }
  }, [effectiveElderId]);

  useEffect(() => {
    void Promise.resolve().then(loadActivities);
  }, [loadActivities]);

  const selectedElder = useMemo(
    () => elders.find((elder) => elder.elderId === effectiveElderId) ?? null,
    [effectiveElderId, elders],
  );

  const screenWidth = useMemo(() => Math.min(width, CAREGIVER_HOME_MAX_WIDTH), [width]);

  const togglePatientDropdown = useCallback(() => {
    setIsPatientDropdownOpen((current) => !current);
  }, []);

  const selectPatient = useCallback((elder: CaregiverHomeElder) => {
    setSelectedElderId(elder.elderId);
    setIsPatientDropdownOpen(false);
  }, []);

  const openTask = useCallback((href: CaregiverTask['href']) => {
    router.push(href);
  }, [router]);

  return {
    activities,
    activitiesError,
    elders,
    homeState,
    isActivitiesLoading,
    isPatientDropdownOpen,
    loadActivities,
    openTask,
    screenWidth,
    selectPatient,
    selectedElder,
    togglePatientDropdown,
  };
}
