import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors, Shadow, Spacing, Radius } from '../utils/constants';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

const TAB_ICONS: Record<string, [string, string]> = {
  History: ['time-outline', 'time'],
  Account: ['person-outline', 'person'],
};
const TAB_LABELS: Record<string, string> = {
  History: 'History',
  Account: 'Account',
};

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const rootNav = useNavigation<RootNav>();

  const handleCameraPress = () => {
    rootNav.navigate('Camera');
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}>
      {/* History tab */}
      <TabButton
        icon={TAB_ICONS[state.routes[0].name]}
        label={TAB_LABELS[state.routes[0].name]}
        isFocused={state.index === 0}
        onPress={() => navigation.navigate(state.routes[0].name)}
      />

      {/* ── Camera FAB (centre) ── */}
      <View style={styles.fabWrapper}>
        <TouchableOpacity style={styles.fab} onPress={handleCameraPress} activeOpacity={0.85}>
          <Ionicons name="camera" size={26} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.fabLabel}>Scan</Text>
      </View>

      {/* Account tab */}
      <TabButton
        icon={TAB_ICONS[state.routes[1].name]}
        label={TAB_LABELS[state.routes[1].name]}
        isFocused={state.index === 1}
        onPress={() => navigation.navigate(state.routes[1].name)}
      />
    </View>
  );
}

function TabButton({
  icon,
  label,
  isFocused,
  onPress,
}: {
  icon: [string, string];
  label: string;
  isFocused: boolean;
  onPress: () => void;
}) {
  const iconName = (isFocused ? icon[1] : icon[0]) as React.ComponentProps<
    typeof Ionicons
  >['name'];

  return (
    <TouchableOpacity style={styles.tabBtn} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={iconName} size={22} color={isFocused ? Colors.primary : Colors.textTertiary} />
      <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const FAB_SIZE = 60;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
    paddingTop: Spacing.sm,
    ...Shadow.card,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    gap: 3,
  },
  tabLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },

  // ── Camera FAB ──
  fabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: Spacing.xs,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
    ...Shadow.strong,
    // Lift above tab bar
    transform: [{ translateY: -14 }],
  },
  fabLabel: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: -10,
  },
});
