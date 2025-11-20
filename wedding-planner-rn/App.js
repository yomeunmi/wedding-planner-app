import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, Animated, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFonts, GowunDodum_400Regular } from '@expo-google-fonts/gowun-dodum';
import { WeddingTimeline } from './src/utils/WeddingTimeline';

import DateInputScreen from './src/screens/DateInputScreen';
import TimelineScreen from './src/screens/TimelineScreen';
import DetailScreen from './src/screens/DetailScreen';
import MyPageScreen from './src/screens/MyPageScreen';

const Stack = createNativeStackNavigator();

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
    checkSavedData();
  }, []);

  const checkSavedData = async () => {
    try {
      const hasSaved = await timeline.hasSavedData();
      if (hasSaved) {
        await timeline.load();
        setInitialRoute('Timeline');
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
            <Stack.Screen name="Timeline">
              {(props) => <TimelineScreen {...props} timeline={timeline} />}
            </Stack.Screen>
            <Stack.Screen name="Detail">
              {(props) => <DetailScreen {...props} timeline={timeline} />}
            </Stack.Screen>
            <Stack.Screen name="MyPage">
              {(props) => <MyPageScreen {...props} timeline={timeline} />}
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
    fontFamily: 'GowunDodum_400Regular',
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
