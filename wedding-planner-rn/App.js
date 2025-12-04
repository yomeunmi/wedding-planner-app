import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Animated, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFonts, GowunDodum_400Regular } from '@expo-google-fonts/gowun-dodum';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeddingTimeline } from './src/utils/WeddingTimeline';

import DateInputScreen from './src/screens/DateInputScreen';
import TimelineConfirmScreen from './src/screens/TimelineConfirmScreen';
import BackgroundImageScreen from './src/screens/BackgroundImageScreen';
import HomeScreen from './src/screens/HomeScreen';
import TimelineScreen from './src/screens/TimelineScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import BudgetSetupScreen from './src/screens/BudgetSetupScreen';
import BudgetPriorityScreen from './src/screens/BudgetPriorityScreen';
import BudgetCategoryDetailScreen from './src/screens/BudgetCategoryDetailScreen';
import BudgetWizardScreen from './src/screens/BudgetWizardScreen';
import NotificationScreen from './src/screens/NotificationScreen';
import DetailScreen from './src/screens/DetailScreen';
import MyPageScreen from './src/screens/MyPageScreen';
import { COLORS } from './src/constants/colors';
import NotificationManager from './src/utils/NotificationManager';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [timeline] = useState(new WeddingTimeline());
  const [initialRoute, setInitialRoute] = useState(null);
  const [showApp, setShowApp] = useState(false);
  const [error, setError] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Gowun Dodum 폰트 로드
  const [fontsLoaded, fontError] = useFonts({
    GowunDodum_400Regular,
  });

  useEffect(() => {
    initializeApp();

    // 알림 수신 리스너 설정 - 알림이 도착하면 히스토리에 저장
    const notificationReceivedSubscription = Notifications.addNotificationReceivedListener(async (notification) => {
      try {
        const { title, body, data } = notification.request.content;

        // 테스트 알림은 저장하지 않음
        if (data?.test) return;

        const newNotification = {
          id: notification.request.identifier,
          title,
          body,
          date: new Date().toISOString(),
          itemId: data?.itemId || null,
          type: data?.type || 'unknown',
        };

        // 기존 히스토리 로드
        const existing = await AsyncStorage.getItem('notification-history');
        let history = existing ? JSON.parse(existing) : [];

        // 중복 체크 (같은 ID의 알림이 이미 있는지)
        const isDuplicate = history.some(n => n.id === newNotification.id);
        if (!isDuplicate) {
          history.unshift(newNotification);
          // 최대 50개까지만 저장
          if (history.length > 50) {
            history = history.slice(0, 50);
          }
          await AsyncStorage.setItem('notification-history', JSON.stringify(history));
          console.log('알림 히스토리에 저장됨:', newNotification.title);
        }
      } catch (error) {
        console.error('알림 히스토리 저장 오류:', error);
      }
    });

    // 알림 응답 리스너 (알림을 탭했을 때) - 히스토리에도 저장
    const notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
      try {
        const { title, body, data } = response.notification.request.content;

        // 테스트 알림은 저장하지 않음
        if (data?.test) return;

        const newNotification = {
          id: response.notification.request.identifier,
          title,
          body,
          date: new Date().toISOString(),
          itemId: data?.itemId || null,
          type: data?.type || 'unknown',
        };

        // 기존 히스토리 로드
        const existing = await AsyncStorage.getItem('notification-history');
        let history = existing ? JSON.parse(existing) : [];

        // 중복 체크
        const isDuplicate = history.some(n => n.id === newNotification.id);
        if (!isDuplicate) {
          history.unshift(newNotification);
          if (history.length > 50) {
            history = history.slice(0, 50);
          }
          await AsyncStorage.setItem('notification-history', JSON.stringify(history));
        }
      } catch (error) {
        console.error('알림 응답 저장 오류:', error);
      }
    });

    return () => {
      notificationReceivedSubscription.remove();
      notificationResponseSubscription.remove();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // NotificationManager 초기화
      await NotificationManager.initialize();
    } catch (error) {
      console.log('NotificationManager initialization failed:', error);
    }
    await checkSavedData();
  };

  const checkSavedData = async () => {
    try {
      const hasSaved = await timeline.hasSavedData();
      if (hasSaved) {
        await timeline.load();
        setInitialRoute('MainTabs');
      } else {
        setInitialRoute('DateInput');
      }
    } catch (err) {
      console.error('Error checking saved data:', err);
      setError(err.message);
      // 에러가 발생해도 DateInput으로 시작
      setInitialRoute('DateInput');
    }
  };

  useEffect(() => {
    if ((fontsLoaded || fontError) && initialRoute) {
      // 최소 1초 로딩화면 표시 후 페이드인
      setTimeout(() => {
        setShowApp(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 1000);
    }
  }, [fontsLoaded, fontError, initialRoute]);

  // 에러 화면
  if (error && !fontError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>앱 로드 중 오류가 발생했습니다</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setInitialRoute(null);
            setShowApp(false);
            checkSavedData();
          }}
        >
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 폰트 로딩 중이거나 초기 라우트가 설정되지 않았거나 앱을 아직 표시하지 않을 때 로딩 표시
  if ((!fontsLoaded && !fontError) || !initialRoute || !showApp) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.heartIcon}>♥</Text>
        <ActivityIndicator size="large" color="#f0768b" style={styles.loadingIndicator} />
        <Text style={styles.loadingText}>웨딩플래너를 불러오는 중...</Text>
      </View>
    );
  }

  // 탭 네비게이터 컴포넌트
  function MainTabs() {
    return (
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopWidth: 0,
            height: 110,
            paddingBottom: 30,
            paddingTop: 12,
          },
          tabBarActiveTintColor: COLORS.darkPink,
          tabBarInactiveTintColor: COLORS.textGray,
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'GowunDodum_400Regular',
            fontWeight: '600',
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginBottom: 0,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          options={{
            tabBarLabel: '홈',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        >
          {(props) => <HomeScreen {...props} timeline={timeline} />}
        </Tab.Screen>
        <Tab.Screen
          name="Timeline"
          options={{
            tabBarLabel: '타임라인',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'list' : 'list-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        >
          {(props) => <TimelineScreen {...props} timeline={timeline} />}
        </Tab.Screen>
        <Tab.Screen
          name="Budget"
          options={{
            tabBarLabel: '예산',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'wallet' : 'wallet-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        >
          {(props) => <BudgetScreen {...props} />}
        </Tab.Screen>
        <Tab.Screen
          name="Notifications"
          options={{
            tabBarLabel: '알림',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'notifications' : 'notifications-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        >
          {(props) => <NotificationScreen {...props} timeline={timeline} />}
        </Tab.Screen>
        <Tab.Screen
          name="MyPage"
          options={{
            tabBarLabel: 'My',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        >
          {(props) => <MyPageScreen {...props} timeline={timeline} />}
        </Tab.Screen>
      </Tab.Navigator>
    );
  }

  return (
    <Animated.View style={[styles.appContainer, { opacity: fadeAnim }]}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="DateInput">
            {(props) => <DateInputScreen {...props} timeline={timeline} />}
          </Stack.Screen>
          <Stack.Screen name="TimelineConfirm">
            {(props) => <TimelineConfirmScreen {...props} timeline={timeline} />}
          </Stack.Screen>
          <Stack.Screen name="BackgroundImage">
            {(props) => <BackgroundImageScreen {...props} />}
          </Stack.Screen>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Detail">
            {(props) => <DetailScreen {...props} timeline={timeline} />}
          </Stack.Screen>
          <Stack.Screen name="BudgetSetup" component={BudgetSetupScreen} />
          <Stack.Screen name="BudgetPriority" component={BudgetPriorityScreen} />
          <Stack.Screen name="BudgetCategoryDetail" component={BudgetCategoryDetailScreen} />
          <Stack.Screen name="BudgetWizard" component={BudgetWizardScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  heartIcon: {
    fontSize: 80,
    color: '#f0768b',
    marginBottom: 20,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#f0768b',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
