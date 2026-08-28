import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';

import {
  type CaregiverPatient,
  type CaregiverTask,
  CAREGIVER_HOME_MAX_WIDTH,
  CAREGIVER_PATIENTS,
} from '@/pages/CaregiverHome/constants';

export function useCaregiverHome() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<CaregiverPatient>(CAREGIVER_PATIENTS[0]);

  const screenWidth = useMemo(() => Math.min(width, CAREGIVER_HOME_MAX_WIDTH), [width]);

  const togglePatientDropdown = useCallback(() => {
    setIsPatientDropdownOpen((current) => !current);
  }, []);

  const selectPatient = useCallback((patient: CaregiverPatient) => {
    setSelectedPatient(patient);
    setIsPatientDropdownOpen(false);
  }, []);

  const openTask = useCallback((href: CaregiverTask['href']) => {
    router.push(href);
  }, [router]);

  return {
    isPatientDropdownOpen,
    openTask,
    screenWidth,
    selectPatient,
    selectedPatient,
    togglePatientDropdown,
  };
}
