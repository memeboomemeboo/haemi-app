import { Image } from 'expo-image';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { HaemiIcon } from '@/components/haemi-icons';

const LOGO_URL = 'https://www.figma.com/api/mcp/asset/5300de0b-0352-4b87-afed-9e109f965b6e';

const ORANGE = '#fd6941';
const ORANGE_SOFT = '#fed7cd';
const TEXT = '#3c3e3f';
const TEXT_MUTED = '#5a5c5d';
const TEXT_ASSISTIVE = '#76787a';
const LINE = '#dadbdc';
const FILL = '#f7f7f7';
const ERROR = '#ee2a2b';

type HaemiHeaderProps = {
  settingsOpen: boolean;
  logoutConfirmOpen: boolean;
  userLabel?: string;
  onToggleSettings: () => void;
  onCloseSettings: () => void;
  onOpenLogoutConfirm: () => void;
  onCloseLogoutConfirm: () => void;
  onConfirmLogout: () => void;
  onEditProfile?: () => void;
};

export function HaemiHeader({
  settingsOpen,
  logoutConfirmOpen,
  userLabel = '가족',
  onToggleSettings,
  onCloseSettings,
  onOpenLogoutConfirm,
  onCloseLogoutConfirm,
  onConfirmLogout,
  onEditProfile,
}: HaemiHeaderProps) {
  const handleEditProfile = () => {
    onCloseSettings();

    if (onEditProfile) {
      onEditProfile();
      return;
    }

    Alert.alert('회원 정보 수정', '회원 정보 수정 화면은 아직 연결되지 않았어요.');
  };

  const handleOpenLogoutConfirm = () => {
    onCloseSettings();
    onOpenLogoutConfirm();
  };

  return (
    <View style={styles.header}>
      <Image source={LOGO_URL} style={styles.logo} contentFit="contain" />
      <View style={styles.headerActions}>
        <HaemiIcon name="alarm" color={LINE} size={30} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="설정"
          hitSlop={10}
          style={({ pressed }) => pressed && styles.pressed}
          onPress={onToggleSettings}>
          <HaemiIcon name="gear" color={LINE} size={28} />
        </Pressable>
      </View>

      {settingsOpen && (
        <View style={styles.settingsMenu}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="회원 정보 수정"
            style={({ pressed }) => [styles.menuItem, styles.menuItemActive, pressed && styles.pressed]}
            onPress={handleEditProfile}>
            <Text style={styles.checkText}>✓</Text>
            <Text style={styles.menuText}>정보 수정</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="로그아웃"
            style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
            onPress={handleOpenLogoutConfirm}>
            <Text style={styles.menuText}>로그아웃</Text>
          </Pressable>
        </View>
      )}

      <Modal transparent visible={logoutConfirmOpen} animationType="fade" onRequestClose={onCloseLogoutConfirm}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onCloseLogoutConfirm} />
          <View style={styles.logoutDialog}>
            <View style={styles.dialogCopy}>
              <Text style={styles.dialogTitle}>로그아웃</Text>
              <Text style={styles.dialogBody}>
                정말 <Text style={styles.dialogUser}>{userLabel}</Text> 의 계정에서{'\n'}로그아웃하시겠습니까?
              </Text>
            </View>
            <View style={styles.dialogActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="로그아웃 취소"
                style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
                onPress={onCloseLogoutConfirm}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="로그아웃 확인"
                style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
                onPress={onConfirmLogout}>
                <Text style={styles.logoutButtonText}>로그아웃</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 50,
    paddingHorizontal: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  logo: {
    width: 62,
    height: 24,
  },
  headerActions: {
    width: 65,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsMenu: {
    position: 'absolute',
    right: 10,
    top: 49,
    width: 123,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
    zIndex: 30,
  },
  menuItem: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    backgroundColor: '#ffffff',
  },
  menuItemActive: {
    borderTopWidth: 1,
    borderColor: ORANGE_SOFT,
    backgroundColor: '#fff3f0',
  },
  checkText: {
    color: ORANGE,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '500',
    includeFontPadding: false,
  },
  menuText: {
    color: ORANGE,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '500',
    includeFontPadding: false,
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  logoutDialog: {
    width: 290,
    minHeight: 152,
    borderRadius: 10,
    paddingTop: 17,
    paddingRight: 26,
    paddingBottom: 16,
    paddingLeft: 23,
    backgroundColor: '#ffffff',
    gap: 26,
  },
  dialogCopy: {
    gap: 12,
  },
  dialogTitle: {
    color: TEXT,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    includeFontPadding: false,
  },
  dialogBody: {
    color: TEXT_ASSISTIVE,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  dialogUser: {
    color: TEXT_MUTED,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
  },
  dialogActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  cancelButton: {
    minHeight: 26,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FILL,
  },
  logoutButton: {
    minHeight: 26,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ERROR,
  },
  cancelButtonText: {
    color: '#c1c2c3',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    includeFontPadding: false,
  },
  logoutButtonText: {
    color: FILL,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.72,
  },
});
