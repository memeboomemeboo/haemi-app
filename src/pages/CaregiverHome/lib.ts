import {
  CONDITION_COPY,
  CONDITION_COPY_EMPTY,
  DAY_OF_WEEK_LABEL,
  SEGMENT_SPEC,
  type CaregiverRecord,
  type WeeklyActivityDay,
} from '@/pages/CaregiverHome/constants';
import { colors } from '@/shared/constants';
import type {
  ActivityItem,
  DayActivity,
  GuardianCondition,
  GuardianHomeElderCard,
} from '@/shared/types/guardian-home';

/** 컨디션 enum → 카드 제목·라벨. 판정 데이터가 없으면(null) 빈 상태 문구. */
export function conditionCopy(condition: GuardianCondition | null): { title: string; label: string } {
  return condition ? CONDITION_COPY[condition] : CONDITION_COPY_EMPTY;
}

/**
 * 마지막 접속 시각 → "마지막 접속 N분/시간/일 전".
 * 접속 기록이 없으면(null) 임의 시각을 지어내지 않고 안내 문구를 준다.
 */
export function lastLoginMeta(lastLoginAt: string | null, now: number = Date.now()): string {
  if (!lastLoginAt) return '접속 기록이 없어요';
  const then = new Date(lastLoginAt).getTime();
  if (Number.isNaN(then)) return '접속 기록이 없어요';

  const diffMin = Math.max(0, Math.floor((now - then) / 60000));
  if (diffMin < 1) return '마지막 접속 방금 전';
  if (diffMin < 60) return `마지막 접속 ${diffMin}분 전`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `마지막 접속 ${diffHour}시간 전`;

  const diffDay = Math.floor(diffHour / 24);
  return `마지막 접속 ${diffDay}일 전`;
}

/** 요일 라벨 색: 오늘=주황, 일요일=빨강, 토요일=파랑, 그 외=회색. */
function dayLabelColor(day: DayActivity, todayIso: string): string {
  if (day.date === todayIso) return colors.light.primary;
  if (day.dayOfWeek === 'SUNDAY') return colors.status.error;
  if (day.dayOfWeek === 'SATURDAY') return colors.palette.blue[60];
  return colors.light.line.normal;
}

/** 7일 활동 → 스택 막대 세그먼트. 완료한 활동 종류만 아래에서 위로 쌓는다. */
export function toWeeklyActivityDays(
  weekly: DayActivity[],
  todayIso: string,
): WeeklyActivityDay[] {
  return weekly.map((day) => ({
    label: DAY_OF_WEEK_LABEL[day.dayOfWeek] ?? '',
    color: dayLabelColor(day, todayIso),
    segments: SEGMENT_SPEC.filter((spec) => day[spec.key]).map((spec) => ({
      color: spec.color,
      height: spec.height,
    })),
  }));
}

/** ISO 시각 → "오전 9:20" 형식. */
export function formatRecordTime(occurredAt: string): string {
  const date = new Date(occurredAt);
  if (Number.isNaN(date.getTime())) return '';
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours < 12 ? '오전' : '오후';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${period} ${hour12}:${String(minutes).padStart(2, '0')}`;
}

function str(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function num(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/** 활동 종류·상세 → 기록 카드 보조 문구. 없는 값은 표시하지 않는다. */
function recordDetail(item: ActivityItem): string {
  const d = item.detail ?? {};
  switch (item.type) {
    case 'TRAINING_COMPLETED': {
      const name = str(d.activityName) ?? '인지 훈련';
      const duration = num(d.durationMinutes);
      const accuracy = num(d.accuracy);
      const parts = [name + (duration != null ? ` ${duration}분` : '')];
      if (accuracy != null) parts.push(`정답률 ${accuracy}%`);
      return parts.join(' · ');
    }
    case 'RESPONSE_SENT': {
      const type = str(d.responseType);
      if (type === 'VOICE') return '음성으로 답하셨어요';
      if (type === 'TEXT') return '답변을 남기셨어요';
      return '추억에 답하셨어요';
    }
    case 'GREETING_ARRIVED': {
      const preview = str(d.preview);
      if (preview) return `“${preview}”`;
      const medium = str(d.medium);
      return medium === 'VOICE' ? '음성 한마디가 도착했어요' : '한마디가 도착했어요';
    }
    case 'GREETING_READ':
      return '보내주신 한마디를 읽으셨어요';
    case 'MEMORY_VIEWED': {
      const title = str(d.memoryTitle);
      return title ? `“${title}”을 보셨어요` : '추억을 보셨어요';
    }
    default:
      return '';
  }
}

/** 타임라인 아이템 → 기록 카드 뷰모델. */
export function toCaregiverRecords(items: ActivityItem[]): CaregiverRecord[] {
  return items.map((item) => ({
    title: item.title,
    time: formatRecordTime(item.occurredAt),
    detail: recordDetail(item),
  }));
}

/** 어르신 카드 → 드롭다운 표시 라벨 (예: "박영호 님"). */
export function elderDisplayName(elder: GuardianHomeElderCard): string {
  return `${elder.name} 님`;
}
