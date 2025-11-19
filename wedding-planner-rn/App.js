import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, Animated } from 'react-native';
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
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Gowun Dodum 폰트 로드
  const [fontsLoaded] = useFonts({
    GowunDodum_400Regular,
  });

  useEffect(() => {
    checkSavedData();
  }, []);

  const checkSavedData = async () => {
    const hasSaved = await timeline.hasSavedData();
    if (hasSaved) {
      await timeline.load();
      setInitialRoute('Timeline');
    } else {
      setInitialRoute('DateInput');
    }
  };

  useEffect(() => {
    if (fontsLoaded && initialRoute) {
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
  }, [fontsLoaded, initialRoute]);

  // 폰트 로딩 중이거나 초기 라우트가 설정되지 않았거나 앱을 아직 표시하지 않을 때 로딩 표시
  if (!fontsLoaded || !initialRoute || !showApp) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.heartIcon}>♥</Text>
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
  },
});
