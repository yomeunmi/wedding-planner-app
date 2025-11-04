import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WeddingTimeline } from './src/utils/WeddingTimeline';

import DateInputScreen from './src/screens/DateInputScreen';
import TimelineScreen from './src/screens/TimelineScreen';
import DetailScreen from './src/screens/DetailScreen';
import MyPageScreen from './src/screens/MyPageScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [timeline] = useState(new WeddingTimeline());
  const [initialRoute, setInitialRoute] = useState(null);

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

  if (!initialRoute) {
    return null; // 로딩 상태
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
