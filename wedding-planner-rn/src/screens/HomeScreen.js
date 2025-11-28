import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
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
    const interval = setInterval(() => {
      if (timeline.weddingDate) {
        setDDay(timeline.getDDay());
      }
    }, 1000 * 60);

    return () => clearInterval(interval);
  }, [timeline]);

  const loadData = async () => {
    const savedImage = await AsyncStorage.getItem('wedding-background-image');
    if (savedImage) {
      setBackgroundImage(savedImage);
    }

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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* 상단 D-Day 배너 - 한줄 심플 디자인 */}
      <View style={styles.headerSection}>
        <View style={styles.banner}>
          <Text style={styles.dDayLabel}>우리의 결혼식</Text>
          <Text style={styles.dDayValue}>{renderDDay()}</Text>
          <Text style={styles.weddingDateText}>{formatWeddingDate()}</Text>
        </View>
      </View>

      {/* 메인 사진 영역 */}
      <View style={styles.imageSection}>
        {backgroundImage ? (
          <Image
            source={{ uri: backgroundImage }}
            style={styles.squareImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.defaultSquareBackground}>
            <Text style={styles.placeholderText}>사진을 추가해주세요</Text>
          </View>
        )}
      </View>

      {/* 배경사진 변경 버튼 */}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightPink,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  headerSection: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 0,
    backgroundColor: COLORS.lightPink,
  },
  banner: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  dDayLabel: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
  },
  dDayValue: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
  },
  weddingDateText: {
    fontSize: 13,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
  },
  imageSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: 'center',
  },
  squareImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  defaultSquareBackground: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f5e6e8',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.textGray,
    fontFamily: 'GowunDodum_400Regular',
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  changeImageButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  changeImageButtonText: {
    color: COLORS.darkPink,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'GowunDodum_400Regular',
  },
});
