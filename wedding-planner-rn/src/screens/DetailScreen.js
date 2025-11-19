import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';
import ZoomableImage from '../components/ZoomableImage';

export default function DetailScreen({ route, navigation, timeline }) {
  const { item } = route.params;
  const [currentItem, setCurrentItem] = useState(item);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date(item.date));
  const [memo, setMemo] = useState('');
  const [tempMemo, setTempMemo] = useState('');
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [weddingHalls, setWeddingHalls] = useState([
    { id: 1, name: '', location: '', date: '', memo: '', isEditing: true, isSelected: false },
    { id: 2, name: '', location: '', date: '', memo: '', isEditing: true, isSelected: false },
  ]);
  const [tempWeddingHalls, setTempWeddingHalls] = useState({});
  const [dressShops, setDressShops] = useState([
    { id: 1, name: '', location: '', date: '', memo: '', isEditing: true, isSelected: false },
    { id: 2, name: '', location: '', date: '', memo: '', isEditing: true, isSelected: false },
  ]);
  const [tempDressShops, setTempDressShops] = useState({});
  const [selectedDressShop, setSelectedDressShop] = useState(null);
  const [selectedWeddingHall, setSelectedWeddingHall] = useState(null);
  const [dressImages, setDressImages] = useState([]);
  const [studioImages, setStudioImages] = useState([]);
  const [makeupImages, setMakeupImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const flatListRef = useRef(null);
  const [showWeddingDatePicker, setShowWeddingDatePicker] = useState(false);
  const [tempWeddingDate, setTempWeddingDate] = useState(new Date());

  // 데이터 불러오기
  useEffect(() => {
    loadData();
  }, []);

  // 데이터 저장
  useEffect(() => {
    saveData();
  }, [memo, weddingHalls, dressShops, dressImages, studioImages, makeupImages]);

  const loadData = async () => {
    try {
      const savedMemo = await AsyncStorage.getItem(`memo-${currentItem.id}`);
      if (savedMemo) {
        setMemo(savedMemo);
        setTempMemo(savedMemo);
      }

      if (currentItem.id === 'wedding-hall-tour') {
        const savedHalls = await AsyncStorage.getItem(`wedding-halls-${currentItem.id}`);
        if (savedHalls) setWeddingHalls(JSON.parse(savedHalls));
      }

      if (currentItem.id === 'dress-tour') {
        const savedShops = await AsyncStorage.getItem(`dress-shops-${currentItem.id}`);
        if (savedShops) setDressShops(JSON.parse(savedShops));
      }

      if (currentItem.id === 'dress-shop-selection' || currentItem.id === 'dress-tour') {
        const savedImages = await AsyncStorage.getItem(`dress-images-${currentItem.id}`);
        if (savedImages) setDressImages(JSON.parse(savedImages));
      }

      if (currentItem.id === 'wedding-studio-booking') {
        const savedImages = await AsyncStorage.getItem(`studio-images-${currentItem.id}`);
        if (savedImages) setStudioImages(JSON.parse(savedImages));
      }

      if (currentItem.id === 'makeup') {
        const savedImages = await AsyncStorage.getItem(`makeup-images-${currentItem.id}`);
        if (savedImages) setMakeupImages(JSON.parse(savedImages));
      }

      // 본식 드레스 가봉 페이지에서 선택된 드레스샵 정보 로드
      if (currentItem.id === 'dress-fitting') {
        const savedDressShop = await AsyncStorage.getItem('selected-dress-shop');
        if (savedDressShop) setSelectedDressShop(JSON.parse(savedDressShop));
      }

      // 결혼식 당일 페이지에서 선택된 웨딩홀 정보 로드
      if (currentItem.id === 'wedding-day') {
        const savedWeddingHall = await AsyncStorage.getItem('selected-wedding-hall');
        if (savedWeddingHall) setSelectedWeddingHall(JSON.parse(savedWeddingHall));
      }
    } catch (error) {
      console.error('데이터 불러오기 실패:', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem(`memo-${currentItem.id}`, memo);

      if (currentItem.id === 'wedding-hall-tour') {
        await AsyncStorage.setItem(`wedding-halls-${currentItem.id}`, JSON.stringify(weddingHalls));
      }

      if (currentItem.id === 'dress-tour') {
        await AsyncStorage.setItem(`dress-shops-${currentItem.id}`, JSON.stringify(dressShops));
      }

      if (currentItem.id === 'dress-shop-selection' || currentItem.id === 'dress-tour') {
        await AsyncStorage.setItem(`dress-images-${currentItem.id}`, JSON.stringify(dressImages));
      }

      if (currentItem.id === 'wedding-studio-booking') {
        await AsyncStorage.setItem(`studio-images-${currentItem.id}`, JSON.stringify(studioImages));
      }

      if (currentItem.id === 'makeup') {
        await AsyncStorage.setItem(`makeup-images-${currentItem.id}`, JSON.stringify(makeupImages));
      }
    } catch (error) {
      console.error('데이터 저장 실패:', error);
    }
  };

  const handleToggleCompleted = async () => {
    const completed = await timeline.toggleCompleted(currentItem.id);
    setCurrentItem({ ...currentItem, completed });
    Alert.alert('알림', completed ? `${currentItem.title} 완료! 🎉` : `${currentItem.title} 완료 취소`);
  };

  const handleDateChange = async (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setTempDate(selectedDate);
      await timeline.updateItemDate(currentItem.id, selectedDate);
      setCurrentItem({ ...currentItem, date: selectedDate });
      Alert.alert('알림', '날짜가 변경되었습니다.');
    }
  };

  // 메모 저장
  const handleSaveMemo = async () => {
    setMemo(tempMemo);
    await AsyncStorage.setItem(`memo-${currentItem.id}`, tempMemo);
    setIsEditingMemo(false);
    Alert.alert('알림', '메모가 저장되었습니다.');
  };

  // 메모 수정 취소
  const handleCancelMemo = () => {
    setTempMemo(memo);
    setIsEditingMemo(false);
  };

  // 웨딩홀 추가
  const addWeddingHall = () => {
    const newId = weddingHalls.length > 0 ? Math.max(...weddingHalls.map(h => h.id)) + 1 : 1;
    setWeddingHalls([...weddingHalls, { id: newId, name: '', location: '', date: '', memo: '', isEditing: true, isSelected: false }]);
  };

  // 웨딩홀 삭제
  const removeWeddingHall = (id) => {
    if (weddingHalls.length <= 1) {
      Alert.alert('알림', '최소 1개의 웨딩홀은 있어야 합니다.');
      return;
    }
    setWeddingHalls(weddingHalls.filter(hall => hall.id !== id));
  };

  // 웨딩홀 정보 업데이트
  const updateWeddingHall = (id, field, value) => {
    setWeddingHalls(weddingHalls.map(hall =>
      hall.id === id ? { ...hall, [field]: value } : hall
    ));
  };

  // 웨딩홀 편집 시작
  const startEditWeddingHall = (id) => {
    const hall = weddingHalls.find(h => h.id === id);
    setTempWeddingHalls({
      ...tempWeddingHalls,
      [id]: { ...hall }
    });
    setWeddingHalls(weddingHalls.map(h =>
      h.id === id ? { ...h, isEditing: true } : h
    ));
  };

  // 웨딩홀 편집 저장
  const saveWeddingHall = (id) => {
    const hall = weddingHalls.find(h => h.id === id);
    if (!hall.name || !hall.date) {
      Alert.alert('알림', '웨딩홀 이름과 투어 날짜는 필수 항목입니다.');
      return;
    }
    setWeddingHalls(weddingHalls.map(h =>
      h.id === id ? { ...h, isEditing: false } : h
    ));
    // 임시 데이터 제거
    const newTemp = { ...tempWeddingHalls };
    delete newTemp[id];
    setTempWeddingHalls(newTemp);
  };

  // 웨딩홀 편집 취소
  const cancelEditWeddingHall = (id) => {
    const tempHall = tempWeddingHalls[id];
    if (tempHall) {
      // 임시 데이터로 복원
      setWeddingHalls(weddingHalls.map(h =>
        h.id === id ? { ...tempHall, isEditing: false } : h
      ));
      // 임시 데이터 제거
      const newTemp = { ...tempWeddingHalls };
      delete newTemp[id];
      setTempWeddingHalls(newTemp);
    }
  };

  // 웨딩홀 선택
  const selectWeddingHall = async (id) => {
    const selectedHall = weddingHalls.find(h => h.id === id);
    setWeddingHalls(weddingHalls.map(hall =>
      hall.id === id ? { ...hall, isSelected: true } : { ...hall, isSelected: false }
    ));
    // AsyncStorage에 선택된 웨딩홀 정보 저장
    await AsyncStorage.setItem('selected-wedding-hall', JSON.stringify(selectedHall));
    Alert.alert('알림', '웨딩홀이 선택되었습니다! 🎊\n결혼식 당일 페이지에서 확인하실 수 있습니다.');
  };

  // 결혼식 날짜 변경 (DateTimePicker에서 날짜 선택 시)
  const handleWeddingDateChange = (event, selectedDate) => {
    setShowWeddingDatePicker(false);
    if (selectedDate) {
      setTempWeddingDate(selectedDate);
    }
  };

  // 결혼식 날짜 저장
  const saveWeddingDate = async () => {
    try {
      // WeddingTimeline의 weddingDate 업데이트
      await AsyncStorage.setItem('wedding-date', tempWeddingDate.toISOString());
      timeline.weddingDate = tempWeddingDate;

      // 타임라인 재계산 (모든 날짜 업데이트 포함)
      timeline.calculateTimeline();

      // 완료 상태 복원
      await timeline.loadCompletionStatus();

      // 변경사항 저장
      await timeline.save();

      Alert.alert(
        '알림',
        `결혼식 날짜가 ${timeline.formatDate(tempWeddingDate)}로 변경되었습니다. 🎉\n모든 타임라인 날짜가 업데이트되었습니다.`,
        [
          {
            text: '확인',
            onPress: () => {
              // 타임라인 화면으로 이동하여 변경사항 반영
              navigation.navigate('Timeline');
            }
          }
        ]
      );
    } catch (error) {
      console.error('날짜 변경 실패:', error);
      Alert.alert('오류', '날짜 변경에 실패했습니다.');
    }
  };

  // 결혼식 날짜 변경 취소
  const cancelWeddingDateChange = () => {
    setTempWeddingDate(timeline.weddingDate);
  };

  // 드레스샵 추가
  const addDressShop = () => {
    const newId = dressShops.length > 0 ? Math.max(...dressShops.map(s => s.id)) + 1 : 1;
    setDressShops([...dressShops, { id: newId, name: '', location: '', date: '', memo: '', isEditing: true, isSelected: false }]);
  };

  // 드레스샵 삭제
  const removeDressShop = (id) => {
    if (dressShops.length <= 1) {
      Alert.alert('알림', '최소 1개의 드레스샵은 있어야 합니다.');
      return;
    }
    setDressShops(dressShops.filter(shop => shop.id !== id));
  };

  // 드레스샵 정보 업데이트
  const updateDressShop = (id, field, value) => {
    setDressShops(dressShops.map(shop =>
      shop.id === id ? { ...shop, [field]: value } : shop
    ));
  };

  // 드레스샵 편집 시작
  const startEditDressShop = (id) => {
    const shop = dressShops.find(s => s.id === id);
    setTempDressShops({
      ...tempDressShops,
      [id]: { ...shop }
    });
    setDressShops(dressShops.map(s =>
      s.id === id ? { ...s, isEditing: true } : s
    ));
  };

  // 드레스샵 편집 저장
  const saveDressShop = (id) => {
    const shop = dressShops.find(s => s.id === id);
    if (!shop.name || !shop.date) {
      Alert.alert('알림', '드레스샵 이름과 투어 날짜는 필수 항목입니다.');
      return;
    }
    setDressShops(dressShops.map(s =>
      s.id === id ? { ...s, isEditing: false } : s
    ));
    // 임시 데이터 제거
    const newTemp = { ...tempDressShops };
    delete newTemp[id];
    setTempDressShops(newTemp);
  };

  // 드레스샵 편집 취소
  const cancelEditDressShop = (id) => {
    const tempShop = tempDressShops[id];
    if (tempShop) {
      // 임시 데이터로 복원
      setDressShops(dressShops.map(s =>
        s.id === id ? { ...tempShop, isEditing: false } : s
      ));
      // 임시 데이터 제거
      const newTemp = { ...tempDressShops };
      delete newTemp[id];
      setTempDressShops(newTemp);
    }
  };

  // 드레스샵 선택
  const selectDressShop = async (id) => {
    const selectedShop = dressShops.find(s => s.id === id);
    setDressShops(dressShops.map(shop =>
      shop.id === id ? { ...shop, isSelected: true } : { ...shop, isSelected: false }
    ));
    // AsyncStorage에 선택된 드레스샵 정보 저장
    await AsyncStorage.setItem('selected-dress-shop', JSON.stringify(selectedShop));
    Alert.alert('알림', '드레스샵이 선택되었습니다! 👗\n본식 드레스 가봉 페이지에서 확인하실 수 있습니다.');
  };

  // 드레스 이미지 선택
  const pickDressImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset, index) => ({
        id: Date.now() + index,
        uri: asset.uri,
      }));
      setDressImages([...dressImages, ...newImages]);
    }
  };

  // 드레스 이미지 삭제
  const removeDressImage = (id) => {
    setDressImages(dressImages.filter(img => img.id !== id));
  };

  // 스튜디오 이미지 선택
  const pickStudioImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset, index) => ({
        id: Date.now() + index,
        uri: asset.uri,
      }));
      setStudioImages([...studioImages, ...newImages]);
    }
  };

  // 스튜디오 이미지 삭제
  const removeStudioImage = (id) => {
    setStudioImages(studioImages.filter(img => img.id !== id));
  };

  // 메이크업 이미지 선택
  const pickMakeupImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset, index) => ({
        id: Date.now() + index,
        uri: asset.uri,
      }));
      setMakeupImages([...makeupImages, ...newImages]);
    }
  };

  // 메이크업 이미지 삭제
  const removeMakeupImage = (id) => {
    setMakeupImages(makeupImages.filter(img => img.id !== id));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {/* 상단 뒤로가기 버튼 */}
        <TouchableOpacity style={styles.topBackButton} onPress={() => navigation.goBack()}>
          <Text style={styles.topBackArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          {/* 아이콘 */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{currentItem.icon}</Text>
          </View>

          {/* 제목 */}
          <Text style={styles.title}>{currentItem.title}</Text>

          {/* 설명 */}
          <Text style={styles.description}>{currentItem.description}</Text>

          {/* 날짜 - 완료 상태가 아닐 때만 수정 가능 */}
          {!currentItem.completed && (
            <View style={styles.dateSection}>
              <Text style={styles.dateLabel}>권장 일정</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>{timeline.formatDate(currentItem.date)}</Text>
                <Text style={styles.editIcon}>✎</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  onChange={handleDateChange}
                />
              )}
            </View>
          )}

          {/* 완료 상태일 때는 날짜만 표시 */}
          {currentItem.completed && (
            <View style={styles.dateSection}>
              <Text style={styles.dateLabel}>권장 일정</Text>
              <View style={styles.dateDisplayOnly}>
                <Text style={styles.dateText}>{timeline.formatDate(currentItem.date)}</Text>
              </View>
            </View>
          )}

        {/* 팁 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 준비 팁</Text>
          {currentItem.tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Text style={styles.tipNumber}>{index + 1}.</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* 선택된 드레스샵 정보 표시 - dress-fitting일 때 */}
        {currentItem.id === 'dress-fitting' && selectedDressShop && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👗 선택한 드레스샵</Text>
            <View style={styles.selectedShopInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>샵 이름:</Text>
                <Text style={styles.infoValue}>{selectedDressShop.name}</Text>
              </View>
              {selectedDressShop.location && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>위치:</Text>
                  <Text style={styles.infoValue}>{selectedDressShop.location}</Text>
                </View>
              )}
              {selectedDressShop.date && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>투어 날짜:</Text>
                  <Text style={styles.infoValue}>{selectedDressShop.date}</Text>
                </View>
              )}
              {selectedDressShop.memo && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>메모:</Text>
                  <Text style={styles.infoValue}>{selectedDressShop.memo}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* 선택된 웨딩홀 정보 표시 - wedding-day일 때 */}
        {currentItem.id === 'wedding-day' && selectedWeddingHall && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏛️ 선택한 웨딩홀</Text>
            <View style={styles.selectedShopInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>웨딩홀 이름:</Text>
                <Text style={styles.infoValue}>{selectedWeddingHall.name}</Text>
              </View>
              {selectedWeddingHall.location && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>위치:</Text>
                  <Text style={styles.infoValue}>{selectedWeddingHall.location}</Text>
                </View>
              )}
              {selectedWeddingHall.date && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>투어 날짜:</Text>
                  <Text style={styles.infoValue}>{selectedWeddingHall.date}</Text>
                </View>
              )}
              {selectedWeddingHall.memo && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>메모:</Text>
                  <Text style={styles.infoValue}>{selectedWeddingHall.memo}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* 웨딩홀 투어 정보 입력 - wedding-hall-tour일 때만 표시 */}
        {currentItem.id === 'wedding-hall-tour' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏛️ 투어 웨딩홀 정보</Text>
            {weddingHalls.map((hall, index) => (
              <View key={hall.id} style={[
                styles.hallCard,
                hall.isSelected && styles.hallCardSelected,
              ]}>
                <View style={styles.hallHeader}>
                  <View style={styles.hallTitleRow}>
                    <Text style={styles.hallNumber}>{index + 1}번째 웨딩홀</Text>
                    {hall.isSelected && (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>✓ 선택됨</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.editActionButtons}>
                    {hall.isEditing ? (
                      <>
                        <TouchableOpacity
                          style={styles.saveEditButton}
                          onPress={() => saveWeddingHall(hall.id)}
                        >
                          <Text style={styles.editButtonText}>저장</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.cancelEditButton}
                          onPress={() => cancelEditWeddingHall(hall.id)}
                        >
                          <Text style={styles.editButtonText}>취소</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity
                        style={styles.startEditButton}
                        onPress={() => startEditWeddingHall(hall.id)}
                      >
                        <Text style={styles.editIconText}>✎</Text>
                      </TouchableOpacity>
                    )}
                    {weddingHalls.length > 1 && (
                      <TouchableOpacity
                        style={styles.deleteItemButton}
                        onPress={() => removeWeddingHall(hall.id)}
                      >
                        <Text style={styles.deleteItemText}>×</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <TextInput
                  style={[styles.input, !hall.isEditing && styles.inputDisabled]}
                  placeholder="웨딩홀 이름 *"
                  value={hall.name}
                  onChangeText={(text) => updateWeddingHall(hall.id, 'name', text)}
                  editable={hall.isEditing}
                />
                <TextInput
                  style={[styles.input, !hall.isEditing && styles.inputDisabled]}
                  placeholder="위치"
                  value={hall.location}
                  onChangeText={(text) => updateWeddingHall(hall.id, 'location', text)}
                  editable={hall.isEditing}
                />
                <TextInput
                  style={[styles.input, !hall.isEditing && styles.inputDisabled]}
                  placeholder="투어 날짜 (예: 2025.01.15) *"
                  value={hall.date}
                  onChangeText={(text) => updateWeddingHall(hall.id, 'date', text)}
                  editable={hall.isEditing}
                />
                <TextInput
                  style={[styles.input, styles.memoInput, !hall.isEditing && styles.inputDisabled]}
                  placeholder="메모"
                  value={hall.memo}
                  onChangeText={(text) => updateWeddingHall(hall.id, 'memo', text)}
                  multiline
                  editable={hall.isEditing}
                />
                {!hall.isSelected && !hall.isEditing && (
                  <TouchableOpacity
                    style={styles.selectHallButton}
                    onPress={() => selectWeddingHall(hall.id)}
                  >
                    <Text style={styles.selectHallButtonText}>이 웨딩홀 선택하기</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* 웨딩홀 추가 버튼 */}
            <TouchableOpacity style={styles.addItemButton} onPress={addWeddingHall}>
              <Text style={styles.addItemButtonText}>+ 웨딩홀 추가하기</Text>
            </TouchableOpacity>

            {/* 결혼식 날짜 변경 버튼 */}
            <View style={styles.weddingDateChangeSection}>
              <Text style={styles.weddingDateChangeLabel}>💒 결혼식 날짜</Text>
              <View style={styles.weddingDateRow}>
                <Text style={styles.currentWeddingDate}>
                  {timeline.formatDate(tempWeddingDate)}
                </Text>
                <TouchableOpacity
                  style={styles.changeWeddingDateButton}
                  onPress={() => {
                    setShowWeddingDatePicker(true);
                  }}
                >
                  <Text style={styles.changeWeddingDateButtonText}>날짜 선택</Text>
                </TouchableOpacity>
              </View>
              {showWeddingDatePicker && (
                <DateTimePicker
                  value={tempWeddingDate}
                  mode="date"
                  onChange={handleWeddingDateChange}
                />
              )}
              {/* 저장/취소 버튼 */}
              {tempWeddingDate.getTime() !== timeline.weddingDate.getTime() && (
                <View style={styles.weddingDateActionButtons}>
                  <TouchableOpacity
                    style={styles.cancelWeddingDateButton}
                    onPress={cancelWeddingDateChange}
                  >
                    <Text style={styles.cancelWeddingDateButtonText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveWeddingDateButton}
                    onPress={saveWeddingDate}
                  >
                    <Text style={styles.saveWeddingDateButtonText}>저장</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {/* 드레스샵 투어 정보 입력 - dress-tour일 때만 표시 */}
        {currentItem.id === 'dress-tour' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👗 투어 드레스샵 정보</Text>
            {dressShops.map((shop, index) => (
              <View key={shop.id} style={[
                styles.hallCard,
                shop.isSelected && styles.hallCardSelected,
              ]}>
                <View style={styles.hallHeader}>
                  <View style={styles.hallTitleRow}>
                    <Text style={styles.hallNumber}>{index + 1}번째 드레스샵</Text>
                    {shop.isSelected && (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>✓ 선택됨</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.editActionButtons}>
                    {shop.isEditing ? (
                      <>
                        <TouchableOpacity
                          style={styles.saveEditButton}
                          onPress={() => saveDressShop(shop.id)}
                        >
                          <Text style={styles.editButtonText}>저장</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.cancelEditButton}
                          onPress={() => cancelEditDressShop(shop.id)}
                        >
                          <Text style={styles.editButtonText}>취소</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity
                        style={styles.startEditButton}
                        onPress={() => startEditDressShop(shop.id)}
                      >
                        <Text style={styles.editIconText}>✎</Text>
                      </TouchableOpacity>
                    )}
                    {dressShops.length > 1 && (
                      <TouchableOpacity
                        style={styles.deleteItemButton}
                        onPress={() => removeDressShop(shop.id)}
                      >
                        <Text style={styles.deleteItemText}>×</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <TextInput
                  style={[styles.input, !shop.isEditing && styles.inputDisabled]}
                  placeholder="드레스샵 이름 *"
                  value={shop.name}
                  onChangeText={(text) => updateDressShop(shop.id, 'name', text)}
                  editable={shop.isEditing}
                />
                <TextInput
                  style={[styles.input, !shop.isEditing && styles.inputDisabled]}
                  placeholder="위치"
                  value={shop.location}
                  onChangeText={(text) => updateDressShop(shop.id, 'location', text)}
                  editable={shop.isEditing}
                />
                <TextInput
                  style={[styles.input, !shop.isEditing && styles.inputDisabled]}
                  placeholder="투어 날짜 (예: 2025.01.15) *"
                  value={shop.date}
                  onChangeText={(text) => updateDressShop(shop.id, 'date', text)}
                  editable={shop.isEditing}
                />
                <TextInput
                  style={[styles.input, styles.memoInput, !shop.isEditing && styles.inputDisabled]}
                  placeholder="메모"
                  value={shop.memo}
                  onChangeText={(text) => updateDressShop(shop.id, 'memo', text)}
                  multiline
                  editable={shop.isEditing}
                />
                {!shop.isSelected && !shop.isEditing && (
                  <TouchableOpacity
                    style={styles.selectHallButton}
                    onPress={() => selectDressShop(shop.id)}
                  >
                    <Text style={styles.selectHallButtonText}>이 드레스샵 선택하기</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* 드레스샵 추가 버튼 */}
            <TouchableOpacity style={styles.addItemButton} onPress={addDressShop}>
              <Text style={styles.addItemButtonText}>+ 드레스샵 추가하기</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 드레스 스크랩 - dress-shop-selection 또는 dress-tour일 때 표시 */}
        {(currentItem.id === 'dress-shop-selection' || currentItem.id === 'dress-tour') && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>드레스 스크랩</Text>
              <TouchableOpacity style={styles.addImageButton} onPress={pickDressImage}>
                <Text style={styles.addImageButtonText}>+ 사진 추가</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.imageGrid}>
              {dressImages.map((image, index) => (
                <View key={image.id} style={styles.imageContainer}>
                  <TouchableOpacity onPress={() => setSelectedImageIndex(index)} activeOpacity={0.8}>
                    <Image source={{ uri: image.uri }} style={styles.image} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteImageButton}
                    onPress={() => removeDressImage(image.id)}
                  >
                    <Text style={styles.deleteImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 웨딩샵 스크랩 - wedding-studio-booking일 때 표시 */}
        {currentItem.id === 'wedding-studio-booking' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>웨딩샵 스크랩</Text>
              <TouchableOpacity style={styles.addImageButton} onPress={pickStudioImage}>
                <Text style={styles.addImageButtonText}>+ 사진 추가</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.imageGrid}>
              {studioImages.map((image, index) => (
                <View key={image.id} style={styles.imageContainer}>
                  <TouchableOpacity onPress={() => setSelectedImageIndex(index)} activeOpacity={0.8}>
                    <Image source={{ uri: image.uri }} style={styles.image} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteImageButton}
                    onPress={() => removeStudioImage(image.id)}
                  >
                    <Text style={styles.deleteImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 메이크업 스크랩 - makeup일 때 표시 */}
        {currentItem.id === 'makeup' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>메이크업 스크랩</Text>
              <TouchableOpacity style={styles.addImageButton} onPress={pickMakeupImage}>
                <Text style={styles.addImageButtonText}>+ 사진 추가</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.imageGrid}>
              {makeupImages.map((image, index) => (
                <View key={image.id} style={styles.imageContainer}>
                  <TouchableOpacity onPress={() => setSelectedImageIndex(index)} activeOpacity={0.8}>
                    <Image source={{ uri: image.uri }} style={styles.image} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteImageButton}
                    onPress={() => removeMakeupImage(image.id)}
                  >
                    <Text style={styles.deleteImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 메모 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>메모</Text>
          {!isEditingMemo ? (
            <View style={styles.memoDisplay}>
              <Text style={[styles.memoText, !memo && styles.memoPlaceholder]}>
                {memo || '메모를 입력하세요.'}
              </Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditingMemo(true)}
              >
                <Text style={styles.editButtonText}>✎ 수정</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.memoEdit}>
              <TextInput
                style={styles.memoEditInput}
                value={tempMemo}
                onChangeText={setTempMemo}
                placeholder="메모를 입력하세요."
                placeholderTextColor={COLORS.textLight}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                autoFocus
              />
              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveMemo}
                >
                  <Text style={styles.saveButtonText}>저장</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelMemo}
                >
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* 완료 버튼 */}
        <TouchableOpacity
          style={[
            styles.completedButton,
            currentItem.completed && styles.completedButtonActive,
          ]}
          onPress={handleToggleCompleted}
        >
          <Text style={styles.completedButtonText}>
            {currentItem.completed ? '✓ 완료 취소' : '완료 표시'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>

    {/* 이미지 크게 보기 Modal */}
    <Modal
      visible={selectedImageIndex !== null}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setSelectedImageIndex(null)}
    >
      <View style={styles.modalContainer}>
        <FlatList
          ref={flatListRef}
          data={
            currentItem.id === 'wedding-studio-booking'
              ? studioImages
              : currentItem.id === 'makeup'
                ? makeupImages
                : dressImages
          }
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={selectedImageIndex}
          getItemLayout={(data, index) => ({
            length: Dimensions.get('window').width,
            offset: Dimensions.get('window').width * index,
            index,
          })}
          renderItem={({ item }) => (
            <View style={styles.modalImageContainer}>
              <ZoomableImage uri={item.uri} />
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
        <TouchableOpacity
          style={styles.modalCloseButton}
          onPress={() => setSelectedImageIndex(null)}
        >
          <Text style={styles.modalCloseText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.imageCounter}>
          <Text style={styles.imageCounterText}>
            {selectedImageIndex !== null ? selectedImageIndex + 1 : 0} / {
              currentItem.id === 'wedding-studio-booking'
                ? studioImages.length
                : currentItem.id === 'makeup'
                  ? makeupImages.length
                  : dressImages.length
            }
          </Text>
        </View>
      </View>
    </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBackButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  topBackArrow: {
    color: COLORS.darkPink,
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 24,
    paddingTop: 80,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightPink,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    textAlign: 'center',
    marginBottom: 24,
  },
  dateSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateLabel: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.darkPink,
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
  },
  editIcon: {
    fontSize: 16,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    marginBottom: 16,
  },
  description: {
    fontSize: 13,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  tipNumber: {
    fontSize: 13,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    fontWeight: 'bold',
    marginRight: 8,
    minWidth: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    lineHeight: 18,
  },
  dateDisplayOnly: {
    borderWidth: 2,
    borderColor: COLORS.textGray,
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.background,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    backgroundColor: COLORS.darkPink,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: COLORS.textGray,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  addItemButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.darkPink,
    borderRadius: 8,
    borderStyle: 'dashed',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  addItemButtonText: {
    color: COLORS.darkPink,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
  },
  hallCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lightPink,
  },
  hallCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.darkPink,
    backgroundColor: '#FFF5F8',
  },
  hallCardLocked: {
    opacity: 0.7,
  },
  hallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hallTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hallNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
  },
  selectedBadge: {
    backgroundColor: COLORS.darkPink,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  selectedBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
  },
  hallActionButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  lockButton: {
    backgroundColor: COLORS.lightPink,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockButtonActive: {
    backgroundColor: COLORS.darkPink,
  },
  lockButtonText: {
    fontSize: 14,
  },
  editActionButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  saveEditButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  cancelEditButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  startEditButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    fontWeight: '600',
  },
  editIconText: {
    fontSize: 18,
    color: COLORS.darkPink,
  },
  deleteItemButton: {
    backgroundColor: '#FF6B6B',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  deleteItemText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightPink,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
  },
  inputDisabled: {
    backgroundColor: COLORS.background,
    opacity: 0.6,
  },
  memoInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  selectHallButton: {
    backgroundColor: COLORS.darkPink,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  selectHallButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    textAlign: 'center',
  },
  weddingDateChangeSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightPink,
  },
  weddingDateChangeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    marginBottom: 8,
  },
  weddingDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentWeddingDate: {
    fontSize: 16,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    fontWeight: '600',
  },
  changeWeddingDateButton: {
    backgroundColor: COLORS.darkPink,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeWeddingDateButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
  },
  weddingDateActionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  cancelWeddingDateButton: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelWeddingDateButtonText: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
  },
  saveWeddingDateButton: {
    backgroundColor: COLORS.darkPink,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveWeddingDateButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
  },
  selectedShopInfo: {
    paddingVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
    fontWeight: '600',
    width: 100,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
  },
  addImageButton: {
    backgroundColor: COLORS.darkPink,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addImageButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    fontWeight: 'bold',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageContainer: {
    width: '31%',
    aspectRatio: 1,
    position: 'relative',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  deleteImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteImageText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  completedButton: {
    backgroundColor: COLORS.darkPink,
    borderRadius: 12,
    padding: 18,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  completedButtonActive: {
    backgroundColor: COLORS.textGray,
  },
  completedButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    textAlign: 'center',
  },
  memoDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  memoText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
  },
  memoPlaceholder: {
    color: COLORS.textLight,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    fontWeight: '600',
  },
  memoEdit: {
    gap: 12,
  },
  memoEditInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'GowunDodum_400Regular',
    minHeight: 100,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.darkPink,
    borderRadius: 8,
    padding: 12,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'GowunDodum_400Regular',
    textAlign: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.darkPink,
    borderRadius: 8,
    padding: 12,
  },
  cancelButtonText: {
    color: COLORS.darkPink,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'GowunDodum_400Regular',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalImageContainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 24,
    color: COLORS.darkPink,
    fontWeight: 'bold',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  imageCounterText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
  },
});
