/**
 * 吾栖出行 App · Expo 骨架 v1.0.0
 * 改名历史：2026-11-17 由「出行行程提醒」(trip-reminder / com.trip.reminder) 更名为「吾栖出行」(wuqi-travel / com.wuqi.travel)。
 * 导航选型：React Navigation（@react-navigation/native + bottom-tabs
 * + native-stack）。选它而不是 Expo Router，因为 Tab + Stack 的
 * 结构更直观、类型错误更少，且与 H5 原型“底部五 Tab + 我的页
 * 跳子页”的结构一一对应。
 */
import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StoreProvider, useStore } from './src/store';
import { THEMES } from './src/theme';
import HomeScreen from './src/screens/HomeScreen';
import TripScreen from './src/screens/TripScreen';
import AddScreen from './src/screens/AddScreen';
import PackScreen from './src/screens/PackScreen';
import MyScreen from './src/screens/MyScreen';
import ExpensesScreen from './src/screens/ExpensesScreen';
import ShareScreen from './src/screens/ShareScreen';
import RemindersScreen from './src/screens/RemindersScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 底部 Tab 图标：零依赖的 emoji 方案（2026-11-17 真机截图里 5 个 Tab 都是 ▼ 占位符）。
// 未装 @expo/vector-icons（本机后台装包被 egress 拦住）；想换成 Ionicons 时跑
// npx expo install @expo/vector-icons，再把这里改成 Ionicons 的 home/airplane/add-circle/list/person。
const TAB_ICONS: Record<string, string> = {
  '首页': '🏠',
  '行程': '✈️',
  '添加': '➕',
  '清单': '🧳',
  '我的': '👤',
};

function Tabs() {
  const store = useStore();
  const theme = THEMES[store.theme];
  return (
    <Tab.Navigator
      id="Tabs"
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.text,
        tabBarStyle: { backgroundColor: theme.card },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.muted,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.55 }}>
            {TAB_ICONS[route.name] ?? '•'}
          </Text>
        ),
      })}>
      <Tab.Screen name="首页" component={HomeScreen} options={{ tabBarLabel: '首页' }} />
      <Tab.Screen name="行程" component={TripScreen} options={{ tabBarLabel: '行程' }} />
      <Tab.Screen name="添加" component={AddScreen} options={{ tabBarLabel: '添加' }} />
      <Tab.Screen name="清单" component={PackScreen} options={{ tabBarLabel: '清单' }} />
      <Tab.Screen name="我的" component={MyScreen} options={{ tabBarLabel: '我的' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator id="RootStack">
          <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="费用" component={ExpensesScreen} />
          <Stack.Screen name="共享" component={ShareScreen} />
          <Stack.Screen name="提醒设置" component={RemindersScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </StoreProvider>
  );
}
