import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { Alarm, Setting } from '@/shared/ui/Icon';
import { authService } from '@/shared/api';
import { useUserContext } from '@/shared/context/UserContext';

const logoSource = require('../../../assets/images/haemi-logo-small.png');
const ORANGE = '#fd6941';
const TEXT = '#3c3e3f';
const TEXT_ASSISTIVE = '#76787a';
const LINE_NORMAL = '#c1c2c3';
const FILL = '#f7f7f7';
const ERROR = '#ee2a2b';

interface HomeHeaderProps {
  onAlarmPress?: () => void;
  onSettingPress?: () => void;
  showSetting?: boolean;
  /** 페이지별 여백(마진 등)은 페이지가 제어한다 */
  style?: ViewStyle;
}

export const HomeHeader = ({
  onAlarmPress,
  onSettingPress,
  showSetting = true,
  style,
}: HomeHeaderProps) => {
  const router = useRouter();
  const { logout } = useUserContext();
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const toggleSettingsMenu = () => {
    setIsSettingsMenuOpen((current) => !current);
    onSettingPress?.();
  };

  const openMemberEdit = () => {
    setIsSettingsMenuOpen(false);
    router.push('/member-edit' as Href);
  };

  const openLogoutDialog = () => {
    setIsSettingsMenuOpen(false);
    setIsLogoutDialogOpen(true);
  };

  const closeLogoutDialog = () => {
    setIsLogoutDialogOpen(false);
  };

  const confirmLogout = async () => {
    setIsLogoutDialogOpen(false);
    await authService.logout().catch(() => undefined);
    logout();
    router.replace('/');
  };

  return (
    <View style={[styles.header, style]}>
      <Image source={logoSource} style={styles.logo} resizeMode="contain" />
      <View style={styles.headerIcons}>
        <Pressable onPress={onAlarmPress} hitSlop={8}>
          <Alarm size={22} color="#dadbdc" />
        </Pressable>
        {showSetting && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="설정 메뉴"
            onPress={toggleSettingsMenu}
            hitSlop={8}
          >
            <Setting size={24} color="#dadbdc" />
          </Pressable>
        )}
      </View>
      {showSetting && isSettingsMenuOpen && (
        <View style={styles.settingsDropdown}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="회원 정보 수정"
            style={({ hovered, pressed }) => [
              styles.settingsDropdownItem,
              styles.settingsDropdownTopItem,
              hovered && styles.settingsDropdownHoveredItem,
              pressed && styles.pressed,
            ]}
            onPress={openMemberEdit}
          >
            <Text style={styles.settingsDropdownText}>정보 수정</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="로그아웃"
            style={({ hovered, pressed }) => [
              styles.settingsDropdownItem,
              hovered && styles.settingsDropdownHoveredItem,
              pressed && styles.pressed,
            ]}
            onPress={openLogoutDialog}
          >
            <Text style={styles.settingsDropdownText}>로그아웃</Text>
          </Pressable>
        </View>
      )}
      {showSetting && isSettingsMenuOpen && (
        <Modal transparent animationType="none" visible onRequestClose={() => setIsSettingsMenuOpen(false)}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsSettingsMenuOpen(false)} />
        </Modal>
      )}
      <Modal
        animationType="fade"
        transparent
        visible={isLogoutDialogOpen}
        onRequestClose={closeLogoutDialog}
      >
        <View style={styles.logoutModalScrim}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="로그아웃 모달 닫기"
            style={StyleSheet.absoluteFill}
            onPress={closeLogoutDialog}
          />
          <View style={styles.logoutDialog}>
            <View style={styles.logoutDialogCopy}>
              <Text style={styles.logoutDialogTitle}>로그아웃</Text>
              <Text style={styles.logoutDialogText}>정말 로그아웃하시겠습니까?</Text>
            </View>
            <View style={styles.logoutDialogActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="로그아웃 취소"
                style={({ pressed }) => [styles.logoutCancelButton, pressed && styles.pressed]}
                onPress={closeLogoutDialog}
              >
                <Text style={styles.logoutCancelText}>취소</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="로그아웃 확인"
                style={({ pressed }) => [styles.logoutConfirmButton, pressed && styles.pressed]}
                onPress={confirmLogout}
              >
                <Text style={styles.logoutConfirmText}>로그아웃</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 30,
  },
  logo: {
    width: 62,
    height: 24,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  settingsDropdown: {
    position: 'absolute',
    top: 34,
    right: 0,
    width: 123,
    height: 72,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
    zIndex: 40,
  },
  settingsDropdownItem: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  settingsDropdownTopItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  settingsDropdownHoveredItem: {
    backgroundColor: '#fff3f0',
  },
  settingsDropdownText: {
    color: ORANGE,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '500',
    letterSpacing: -0.36,
  },
  logoutModalScrim: {
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
  logoutDialogCopy: {
    gap: 12,
  },
  logoutDialogTitle: {
    color: TEXT,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  logoutDialogText: {
    color: TEXT_ASSISTIVE,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: -0.28,
  },
  logoutDialogActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  logoutCancelButton: {
    minHeight: 26,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FILL,
  },
  logoutConfirmButton: {
    minHeight: 26,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ERROR,
  },
  logoutCancelText: {
    color: LINE_NORMAL,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: -0.28,
  },
  logoutConfirmText: {
    color: FILL,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: -0.28,
  },
  pressed: {
    opacity: 0.72,
  },
});
