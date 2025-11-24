import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';

export default function HomeScreen({ timeline }) {
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [dDay, setDDay] = useState(0);
  const [nickname, setNickname] = useState('');
  const [weddingDate, setWeddingDate] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // 포커스될 때마다 데이터 새로고침
    const interval = setInterval(() => {
      if (timeline.weddingDate) {
        setDDay(timeline.getDDay());
      }
    }, 1000 * 60); // 1분마다 업데이트

    return () => clearInterval(interval);
  }, [timeline]);

  const loadData = async () => {
    // 배경사진 로드
    const savedImage = await AsyncStorage.getItem('wedding-background-image');
    if (savedImage) {
      setBackgroundImage(savedImage);
    }

    // 닉네임 로드
    const savedNickname = await AsyncStorage.getItem('wedding-nickname');
    setNickname(savedNickname || '');

    // 타임라인 데이터 로드
    if (timeline.weddingDate) {
      setWeddingDate(timeline.weddingDate);
      setDDay(timeline.getDDay());
    }
  };

  const changeBackgroundImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImage = result.assets[0].uri;
      setBackgroundImage(newImage);
      await AsyncStorage.setItem('wedding-background-image', newImage);
    }
  };

  const renderDDay = () => {
    if (dDay > 0) {
      return `D-${dDay}`;
    } else if (dDay === 0) {
      return 'D-Day!';
    } else {
      return `D+${Math.abs(dDay)}`;
    }
  };

  const formatWeddingDate = () => {
    if (!weddingDate) return '';
    const date = new Date(weddingDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    return `${year}.${month}.${day} (${weekday})`;
  };

  return (
    <View style={styles.container}>
      {backgroundImage ? (
        <ImageBackground
          source={{ uri: backgroundImage }}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            {renderContent()}
          </View>
        </ImageBackground>
      ) : (
        <View style={[styles.backgroundImage, styles.defaultBackground]}>
          {renderContent()}
        </View>
      )}
    </View>
  );

  function renderContent() {
    return (
      <>
        {/* 상단 D-Day 배너 */}
        <View style={styles.dDayContainer}>
          <View style={styles.dDayBanner}>
            <Text style={styles.dDayLabel}>우리의 결혼식</Text>
            <View style={styles.dDayContent}>
              <Text style={styles.dDayValue}>{renderDDay()}</Text>
              <Text style={styles.dDaySeparator}>|</Text>
              <Text style={styles.weddingDate}>{formatWeddingDate()}</Text>
            </View>
          </View>
        </View>

        {/* 중앙 컨텐츠 */}
        <View style={styles.centerContent}>
          {nickname && (
            <Text style={styles.welcomeText}>{nickname}의 웨딩플래너</Text>
          )}
        </View>

        {/* 하단 배경사진 변경 버튼 */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.changeImageButton}
            onPress={changeBackgroundImage}
          >
            <Text style={styles.changeImageButtonText}>
              {backgroundImage ? '배경사진 변경' : '배경사진 설정'}
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundImage: {
    flex: 1,
  },
  defaultBackground: {
    backgroundColor: COLORS.lightPink,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  dDayContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  dDayBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    width: '100%',
    maxWidth: 400,
  },
  dDayLabel: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
    fontWeight: '600',
  },
  dDayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dDayValue: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
  },
  dDaySeparator: {
    fontSize: 20,
    color: COLORS.textLight,
  },
  weddingDate: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingBottom: 140, // 탭바 공간 확보 + 추가 여백
  },
  changeImageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  changeImageButtonText: {
    color: COLORS.darkPink,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'GowunDodum_400Regular',
  },
});
