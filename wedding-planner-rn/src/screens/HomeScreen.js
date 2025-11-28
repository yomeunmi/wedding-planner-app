import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';

export default function HomeScreen({ timeline }) {
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [dDay, setDDay] = useState(0);
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
      aspect: [1, 1],
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
      <View style={styles.backgroundContainer}>
        {backgroundImage ? (
          <>
            <Image
              source={{ uri: backgroundImage }}
              style={styles.squareImage}
              resizeMode="cover"
            />
            <View style={styles.gradientOverlay} />
          </>
        ) : (
          <View style={styles.defaultSquareBackground} />
        )}
      </View>
      {renderContent()}
    </View>
  );

  function renderContent() {
    return (
      <>
        {/* 상단 D-Day 배너 */}
        <View style={styles.dDayContainer}>
          <View style={styles.laceFrame}>
            {/* 상단 스캘럽 테두리 */}
            <View style={styles.scallop}>
              <Text style={styles.scallopText}>⌢ ⌢ ⌢ ⌢ ⌢ ⌢ ⌢ ⌢ ⌢ ⌢ ⌢ ⌢ ⌢</Text>
            </View>
            {/* 상단 장식 라인 */}
            <Text style={styles.lacePatternTop}>✿ · · · ✿ · · · ✿ · · · ✿ · · · ✿</Text>

            {/* 메인 콘텐츠 */}
            <View style={styles.dDayBanner}>
              <Text style={styles.dDayLabel}>우리의 결혼식</Text>
              <View style={styles.dDayContent}>
                <Text style={styles.dDayValue}>{renderDDay()}</Text>
                <Text style={styles.dDaySeparator}>|</Text>
                <Text style={styles.weddingDate}>{formatWeddingDate()}</Text>
              </View>
            </View>

            {/* 하단 장식 라인 */}
            <Text style={styles.lacePatternBottom}>✿ · · · ✿ · · · ✿ · · · ✿ · · · ✿</Text>
            {/* 하단 스캘럽 테두리 */}
            <View style={styles.scallopBottom}>
              <Text style={styles.scallopText}>⌣ ⌣ ⌣ ⌣ ⌣ ⌣ ⌣ ⌣ ⌣ ⌣ ⌣ ⌣ ⌣</Text>
            </View>
          </View>
        </View>

        {/* 중앙 컨텐츠 */}
        <View style={styles.centerContent}>
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
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lightPink,
  },
  squareImage: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 600,
  },
  defaultSquareBackground: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 600,
    backgroundColor: COLORS.lightPink,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dDayContainer: {
    paddingTop: 100,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  laceFrame: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    shadowColor: '#d4a574',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8d4c4',
  },
  scallop: {
    marginTop: -2,
    overflow: 'hidden',
  },
  scallopBottom: {
    marginBottom: -2,
    overflow: 'hidden',
  },
  scallopText: {
    fontSize: 14,
    color: '#d4a574',
    letterSpacing: -2,
  },
  lacePatternTop: {
    fontSize: 10,
    color: '#c9a07a',
    letterSpacing: 1,
    marginTop: 2,
    marginBottom: 6,
  },
  lacePatternBottom: {
    fontSize: 10,
    color: '#c9a07a',
    letterSpacing: 1,
    marginTop: 6,
    marginBottom: 2,
  },
  dDayBanner: {
    backgroundColor: '#ffffff',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderWidth: 1,
    borderColor: '#e8d4c4',
    borderStyle: 'dotted',
  },
  dDayLabel: {
    fontSize: 18,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
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
  bottomActions: {
    paddingHorizontal: 20,
    paddingBottom: 120, // 탭바 공간 확보
    marginTop: -40, // 사진과 버튼 간격 좁히기
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
