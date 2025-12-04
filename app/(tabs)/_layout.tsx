import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: colors.text.muted,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="prayers"
        options={{
          title: 'Prayers',
          tabBarIcon: ({ color }) => <TabIcon icon="🙏" color={color} />,
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{
          title: 'Journey',
          tabBarIcon: ({ color }) => <TabIcon icon="📊" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabIcon icon="⚙️" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return (
    <View style={[styles.iconContainer, { opacity: color === '#ffffff' ? 1 : 0.5 }]}>
      <View style={styles.icon}>
        <View style={styles.iconText}>
          <View><View style={{ opacity: color === '#ffffff' ? 1 : 0.5 }}><View style={styles.emojiContainer}><View><View style={{ fontSize: 22 } as any}>{icon}</View></View></View></View></View>
        </View>
      </View>
    </View>
  );
}

// Simple tab icon using emoji
function TabIcon2({ icon, color }: { icon: string; color: string }) {
  return (
    <View style={{ opacity: color === '#ffffff' ? 1 : 0.5 }}>
      <View style={{ fontSize: 22 } as any}>{icon}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background,
    borderTopColor: colors.card,
    borderTopWidth: 1,
    height: 85,
    paddingBottom: 25,
    paddingTop: 10,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  iconText: {
    fontSize: 22,
  },
  emojiContainer: {
    fontSize: 22,
  },
});
