export type GuardianRole =
  | 'GUARDIAN'
  | 'DAUGHTER'
  | 'SON'
  | 'GRANDDAUGHTER'
  | 'GRANDSON'
  | 'OTHER';

export interface CaregiverHomeElder {
  elderId: string;
  name: string;
  birthDate: string;
  role: GuardianRole;
  roleLabel: string;
}

export interface CaregiverHomeChallenge {
  greetingCompleted: boolean;
  memoryCompleted: boolean;
}

export interface CaregiverHomeResponse {
  elders: CaregiverHomeElder[];
  challenge: CaregiverHomeChallenge;
}

export interface CaregiverActivityItem {
  id: string;
  title: string;
  body: string;
}

export interface CaregiverActivitiesResponse {
  date: string;
  items: CaregiverActivityItem[];
}
