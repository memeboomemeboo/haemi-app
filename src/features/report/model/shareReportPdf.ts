import * as FileSystem from 'expo-file-system/legacy';
import { Share } from 'react-native';

import { getReportPdfUrl } from '@/shared/api/report';
import { getAccessToken } from '@/shared/api/session';

export async function shareReportPdf(reportId: string) {
  const accessToken = await getAccessToken();
  const directory = FileSystem.cacheDirectory;
  if (!directory) throw new Error('PDF를 저장할 공간을 찾을 수 없습니다.');

  const result = await FileSystem.downloadAsync(
    getReportPdfUrl(reportId),
    `${directory}haemi-report-${reportId}.pdf`,
    { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined },
  );

  if (result.status !== 200) throw new Error(`PDF 다운로드에 실패했습니다. (${result.status})`);
  try {
    // 기존 개발 빌드에 네이티브 모듈이 없을 수 있어 사용할 때만 로드합니다.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sharing = require('expo-sharing') as typeof import('expo-sharing');
    if (await sharing.isAvailableAsync()) {
      await sharing.shareAsync(result.uri, {
        mimeType: 'application/pdf',
        dialogTitle: '회상 리포트 내보내기',
        UTI: 'com.adobe.pdf',
      });
      return;
    }
  } catch {
    // ExpoSharing이 포함되지 않은 빌드에서는 React Native 기본 공유를 사용합니다.
  }

  await Share.share({
    title: '회상 리포트 내보내기',
    message: '회상 리포트 PDF',
    url: result.uri,
  });
}
