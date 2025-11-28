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
import Svg, { Path } from 'react-native-svg';

// 스캘럽(물결) 테두리 컴포넌트
const ScallopBorder = ({ width, position }) => {
  const scallops = 12;
  const scallopWidth = width / scallops;
  const scallopHeight = 10;

  let pathD = '';

  if (position === 'top') {
    // 상단: 아래로 볼록한 물결
    pathD = `M 0 ${scallopHeight}`;
    for (let i = 0; i < scallops; i++) {
      const x1 = i * scallopWidth + scallopWidth / 2;
      const x2 = (i + 1) * scallopWidth;
      pathD += ` Q ${x1} 0, ${x2} ${scallopHeight}`;
    }
    pathD += ` L ${width} 0 L 0 0 Z`;
  } else {
    // 하단: 위로 볼록한 물결
    pathD = `M 0 0`;
    for (let i = 0; i < scallops; i++) {
      const x1 = i * scallopWidth + scallopWidth / 2;
      const x2 = (i + 1) * scallopWidth;
      pathD += ` Q ${x1} ${scallopHeight}, ${x2} 0`;
    }
    pathD += ` L ${width} ${scallopHeight} L 0 ${scallopHeight} Z`;
  }

  return (
    <Svg width={width} height={scallopHeight} style={position === 'top' ? styles.scallopTop : styles.scallopBottom}>
      <Path d={pathD} fill="#c9a86c" />
    </Svg>
  );
};

export default function HomeScreen({ timeline }) {
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [dDay, setDDay] = useState(0);
  const [weddingDate, setWeddingDate] = useState(null);
  const [containerWidth, setContainerWidth] = useState(300);

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

  const onFrameLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* 상단 D-Day 배너 - 레이스 테두리 */}
      <View style={styles.headerSection}>
        <View
          style={styles.laceFrameWrapper}
          onLayout={onFrameLayout}
        >
          {/* 상단 스캘럽 테두리 */}
          <ScallopBorder width={containerWidth} position="top" />

          <View style={styles.laceFrame}>
            <View style={styles.innerBorder}>
              <View style={styles.dDayBanner}>
                <Text style={styles.dDayLabel}>우리의 결혼식</Text>
                <View style={styles.dDayContent}>
                  <Text style={styles.dDayValue}>{renderDDay()}</Text>
                  <Text style={styles.dDaySeparator}>|</Text>
                  <Text style={styles.weddingDateText}>{formatWeddingDate()}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 하단 스캘럽 테두리 */}
          <ScallopBorder width={containerWidth} position="bottom" />
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
    paddingBottom: 16,
    alignItems: 'center',
    backgroundColor: COLORS.lightPink,
  },
  laceFrameWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  scallopTop: {
    marginBottom: -1,
  },
  scallopBottom: {
    marginTop: -1,
  },
  laceFrame: {
    backgroundColor: '#c9a86c',
    width: '100%',
    paddingVertical: 3,
    paddingHorizontal: 3,
  },
  innerBorder: {
    backgroundColor: '#ffffff',
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  dDayBanner: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#c9a86c',
    borderStyle: 'dashed',
  },
  dDayLabel: {
    fontSize: 16,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    fontWeight: '600',
  },
  dDayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dDayValue: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
  },
  dDaySeparator: {
    fontSize: 18,
    color: COLORS.textLight,
  },
  weddingDateText: {
    fontSize: 13,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    fontWeight: '600',
  },
  imageSection: {
    paddingHorizontal: 20,
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
