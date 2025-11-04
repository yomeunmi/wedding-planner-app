import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { useFonts, Gugi_400Regular } from '@expo-google-fonts/gugi';
import { WeddingTimeline } from './src/utils/WeddingTimeline';

import DateInputScreen from './src/screens/DateInputScreen';
import TimelineScreen from './src/screens/TimelineScreen';
import DetailScreen from './src/screens/DetailScreen';
import MyPageScreen from './src/screens/MyPageScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [timeline] = useState(new WeddingTimeline());
  const [initialRoute, setInitialRoute] = useState(null);

  // Gugi 폰트 로드
  const [fontsLoaded] = useFonts({
    Gugi_400Regular,
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

  // 폰트 로딩 중이거나 초기 라우트가 설정되지 않았으면 로딩 표시
  if (!fontsLoaded || !initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f0768b" />
      </View>
    );
  }

  return (
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
  );
}
