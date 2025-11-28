import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Animated, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFonts, GowunDodum_400Regular } from '@expo-google-fonts/gowun-dodum';
import { Ionicons } from '@expo/vector-icons';
import { WeddingTimeline } from './src/utils/WeddingTimeline';

import DateInputScreen from './src/screens/DateInputScreen';
import TimelineConfirmScreen from './src/screens/TimelineConfirmScreen';
import BackgroundImageScreen from './src/screens/BackgroundImageScreen';
import HomeScreen from './src/screens/HomeScreen';
import TimelineScreen from './src/screens/TimelineScreen';
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
  }, []);

  const initializeApp = async () => {
    try {
      // NotificationManager 초기화 (실패해도 앱은 계속 실행)
      try {
        await NotificationManager.initialize();
        console.log('NotificationManager initialized successfully');
      } catch (notifError) {
        console.log('NotificationManager initialization failed, but app will continue:', notifError);
      }
    } catch (error) {
      console.log('App initialization error:', error);
    }

    // 데이터 로드는 알림 실패와 무관하게 진행
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
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
            height: 100,
            paddingBottom: 20,
            paddingTop: 16,
          },
          tabBarActiveTintColor: COLORS.darkPink,
          tabBarInactiveTintColor: COLORS.textGray,
          tabBarLabelStyle: {
            fontSize: 14,
            fontFamily: 'GowunDodum_400Regular',
            fontWeight: '600',
            marginTop: 4,
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
                size={28}
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
                size={28}
                color={color}
              />
            ),
          }}
        >
          {(props) => <TimelineScreen {...props} timeline={timeline} />}
        </Tab.Screen>
        <Tab.Screen
          name="Notifications"
          options={{
            tabBarLabel: '알림',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'notifications' : 'notifications-outline'}
                size={28}
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
                size={28}
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
