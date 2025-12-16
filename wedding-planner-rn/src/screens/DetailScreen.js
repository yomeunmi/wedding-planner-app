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
  // item.date가 문자열일 수 있으므로 Date 객체로 변환
  const initialItem = {
    ...item,
    date: item.date instanceof Date ? item.date : new Date(item.date),
  };
  const [currentItem, setCurrentItem] = useState(initialItem);
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
  const [isEditingWeddingDate, setIsEditingWeddingDate] = useState(false);
  const [showHallDatePicker, setShowHallDatePicker] = useState(null); // 웨딩홀 날짜 선택기 (hall.id 저장)
  const [showShopDatePicker, setShowShopDatePicker] = useState(null); // 드레스샵 날짜 선택기 (shop.id 저장)
  const [studioInfo, setStudioInfo] = useState({
    name: '',           // 업체명
    contact: '',        // 연락처
    location: '',       // 위치
    package: '',        // 패키지 구성
    price: '',          // 가격
    shootingDate: '',   // 촬영일
    albumDate: '',      // 앨범 수령 예정일
    snapPhotographer: '', // 본식 스냅 작가
    memo: ''            // 기타 메모
  });
  const [isEditingStudio, setIsEditingStudio] = useState(false);
  // 혼주 한복 - 한복집 업체 정보
  const [hanbokShopInfo, setHanbokShopInfo] = useState({
    name: '',           // 업체명
    contact: '',        // 전화번호
    location: '',       // 위치
  });
  const [isEditingHanbokShop, setIsEditingHanbokShop] = useState(false);
  // 드레스샵 투어 - 간소화된 정보 (샵별 사진, 느낌, Pick 드레스)
  const [tourDressShops, setTourDressShops] = useState([
    { id: 1, name: '', feeling: '', photos: [], pickDresses: [], isEditing: true },
  ]);
  const [tempTourDressShops, setTempTourDressShops] = useState({});

  // 데이터 불러오기
  useEffect(() => {
    loadData();
  }, []);

  // 데이터 저장
  useEffect(() => {
    saveData();
  }, [memo, weddingHalls, dressShops, dressImages, studioImages, makeupImages, studioInfo, hanbokShopInfo, tourDressShops]);

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

      // 웨딩촬영날 페이지에서 촬영업체 정보 로드
      if (currentItem.id === 'wedding-photo-day') {
        const savedStudioInfo = await AsyncStorage.getItem('wedding-studio-info');
        if (savedStudioInfo) setStudioInfo(JSON.parse(savedStudioInfo));
      }

      // 혼주 한복 페이지에서 한복집 정보 로드
      if (currentItem.id === 'parents-hanbok') {
        const savedHanbokShopInfo = await AsyncStorage.getItem('hanbok-shop-info');
        if (savedHanbokShopInfo) setHanbokShopInfo(JSON.parse(savedHanbokShopInfo));
      }

      // 드레스샵 투어 페이지에서 투어 드레스샵 정보 로드
      if (currentItem.id === 'dress-tour') {
        const savedTourDressShops = await AsyncStorage.getItem('tour-dress-shops');
        if (savedTourDressShops) setTourDressShops(JSON.parse(savedTourDressShops));
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

      // 웨딩촬영날 페이지에서 촬영업체 정보 저장
      if (currentItem.id === 'wedding-photo-day') {
        await AsyncStorage.setItem('wedding-studio-info', JSON.stringify(studioInfo));
      }

      // 혼주 한복 페이지에서 한복집 정보 저장
      if (currentItem.id === 'parents-hanbok') {
        await AsyncStorage.setItem('hanbok-shop-info', JSON.stringify(hanbokShopInfo));
      }

      // 드레스샵 투어 페이지에서 투어 드레스샵 정보 저장
      if (currentItem.id === 'dress-tour') {
        await AsyncStorage.setItem('tour-dress-shops', JSON.stringify(tourDressShops));
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
      Alert.alert('알림', '날짜가 변경되었습니다.\n타임라인 순서가 자동으로 조정됩니다.');
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

  // 웨딩홀 날짜 선택 핸들러
  const handleHallDateChange = (id, event, selectedDate) => {
    setShowHallDatePicker(null);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0].replace(/-/g, '.');
      updateWeddingHall(id, 'date', formattedDate);
    }
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

      // 편집 모드 종료
      setIsEditingWeddingDate(false);
      setShowWeddingDatePicker(false);

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
    setIsEditingWeddingDate(false);
    setShowWeddingDatePicker(false);
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

  // 드레스샵 날짜 선택 핸들러
  const handleShopDateChange = (id, event, selectedDate) => {
    setShowShopDatePicker(null);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0].replace(/-/g, '.');
      updateDressShop(id, 'date', formattedDate);
    }
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

  // ============ 드레스샵 투어 (간소화 버전) 관련 함수 ============
  // 투어 드레스샵 추가
  const addTourDressShop = () => {
    const newId = tourDressShops.length > 0 ? Math.max(...tourDressShops.map(s => s.id)) + 1 : 1;
    setTourDressShops([...tourDressShops, { id: newId, name: '', feeling: '', photos: [], pickDresses: [], isEditing: true }]);
  };

  // 투어 드레스샵 삭제
  const removeTourDressShop = (id) => {
    if (tourDressShops.length <= 1) {
      Alert.alert('알림', '최소 1개의 드레스샵은 있어야 합니다.');
      return;
    }
    setTourDressShops(tourDressShops.filter(shop => shop.id !== id));
  };

  // 투어 드레스샵 정보 업데이트
  const updateTourDressShop = (id, field, value) => {
    setTourDressShops(tourDressShops.map(shop =>
      shop.id === id ? { ...shop, [field]: value } : shop
    ));
  };

  // 투어 드레스샵 편집 시작
  const startEditTourDressShop = (id) => {
    const shop = tourDressShops.find(s => s.id === id);
    setTempTourDressShops({
      ...tempTourDressShops,
      [id]: { ...shop }
    });
    setTourDressShops(tourDressShops.map(s =>
      s.id === id ? { ...s, isEditing: true } : s
    ));
  };

  // 투어 드레스샵 편집 저장
  const saveTourDressShop = (id) => {
    const shop = tourDressShops.find(s => s.id === id);
    if (!shop.name) {
      Alert.alert('알림', '드레스샵 이름은 필수 항목입니다.');
      return;
    }
    setTourDressShops(tourDressShops.map(s =>
      s.id === id ? { ...s, isEditing: false } : s
    ));
    const newTemp = { ...tempTourDressShops };
    delete newTemp[id];
    setTempTourDressShops(newTemp);
  };

  // 투어 드레스샵 편집 취소
  const cancelEditTourDressShop = (id) => {
    const tempShop = tempTourDressShops[id];
    if (tempShop) {
      setTourDressShops(tourDressShops.map(s =>
        s.id === id ? { ...tempShop, isEditing: false } : s
      ));
      const newTemp = { ...tempTourDressShops };
      delete newTemp[id];
      setTempTourDressShops(newTemp);
    }
  };

  // 드레스샵 사진 추가
  const pickTourShopPhoto = async (shopId) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map((asset, index) => ({
        id: Date.now() + index,
        uri: asset.uri,
      }));
      setTourDressShops(tourDressShops.map(shop =>
        shop.id === shopId ? { ...shop, photos: [...shop.photos, ...newPhotos] } : shop
      ));
    }
  };

  // 드레스샵 사진 삭제
  const removeTourShopPhoto = (shopId, photoId) => {
    setTourDressShops(tourDressShops.map(shop =>
      shop.id === shopId ? { ...shop, photos: shop.photos.filter(p => p.id !== photoId) } : shop
    ));
  };

  // Pick 드레스 추가
  const addPickDress = async (shopId) => {
    const shop = tourDressShops.find(s => s.id === shopId);
    if (shop.pickDresses.length >= 2) {
      Alert.alert('알림', 'Pick 드레스는 최대 2벌까지 선택 가능합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newDress = {
        id: Date.now(),
        uri: result.assets[0].uri,
        name: '',
      };
      setTourDressShops(tourDressShops.map(shop =>
        shop.id === shopId ? { ...shop, pickDresses: [...shop.pickDresses, newDress] } : shop
      ));
    }
  };

  // Pick 드레스 삭제
  const removePickDress = (shopId, dressId) => {
    setTourDressShops(tourDressShops.map(shop =>
      shop.id === shopId ? { ...shop, pickDresses: shop.pickDresses.filter(d => d.id !== dressId) } : shop
    ));
  };

  // Pick 드레스 이름 업데이트
  const updatePickDressName = (shopId, dressId, name) => {
    setTourDressShops(tourDressShops.map(shop =>
      shop.id === shopId ? {
        ...shop,
        pickDresses: shop.pickDresses.map(d =>
          d.id === dressId ? { ...d, name } : d
        )
      } : shop
    ));
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
            {/* 결혼식 날짜 변경 섹션 - 상단에 위치 */}
            <View style={styles.weddingDateChangeSection}>
              <Text style={styles.weddingDateChangeLabel}>💒 결혼식 날짜</Text>
              {!isEditingWeddingDate ? (
                <View style={styles.weddingDateRow}>
                  <Text style={styles.currentWeddingDate}>
                    {timeline.formatDate(timeline.weddingDate)}
                  </Text>
                  <TouchableOpacity
                    style={styles.editWeddingDateButton}
                    onPress={() => {
                      setTempWeddingDate(timeline.weddingDate);
                      setIsEditingWeddingDate(true);
                    }}
                  >
                    <Text style={styles.editWeddingDateButtonText}>✎ 수정</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.weddingDateEditContainer}>
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
                </View>
              )}
            </View>

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
                {/* 투어 날짜 */}
                <View style={styles.dateInputContainer}>
                  <View style={styles.dateDisplayRow}>
                    <Text style={styles.dateInputLabel}>투어 날짜 *</Text>
                    <Text style={[styles.dateInputValue, !hall.date && styles.dateInputPlaceholder]}>
                      {hall.date || '날짜를 선택하세요'}
                    </Text>
                  </View>
                  {hall.isEditing && (
                    <TouchableOpacity
                      style={styles.selectDateButton}
                      onPress={() => setShowHallDatePicker(hall.id)}
                    >
                      <Text style={styles.selectDateButtonText}>날짜 선택</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {showHallDatePicker === hall.id && (
                  <DateTimePicker
                    value={hall.date ? new Date(hall.date.replace(/\./g, '-')) : new Date()}
                    mode="date"
                    onChange={(event, selectedDate) => handleHallDateChange(hall.id, event, selectedDate)}
                  />
                )}
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
          </View>
        )}

        {/* 드레스샵 투어 정보 입력 (간소화 버전) - dress-tour일 때만 표시 */}
        {currentItem.id === 'dress-tour' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👗 투어 드레스샵</Text>
            <Text style={styles.sectionSubtitle}>샵별로 사진과 느낌을 기록하고, Pick 드레스를 선택하세요</Text>
            {tourDressShops.map((shop, index) => (
              <View key={shop.id} style={styles.tourShopCard}>
                {/* 샵 헤더 */}
                <View style={styles.tourShopHeader}>
                  <View style={styles.tourShopTitleRow}>
                    <Text style={styles.tourShopNumber}>#{index + 1}</Text>
                    {shop.isEditing ? (
                      <TextInput
                        style={styles.tourShopNameInput}
                        placeholder="드레스샵 이름 *"
                        value={shop.name}
                        onChangeText={(text) => updateTourDressShop(shop.id, 'name', text)}
                      />
                    ) : (
                      <Text style={styles.tourShopName}>{shop.name || '이름 없음'}</Text>
                    )}
                  </View>
                  <View style={styles.editActionButtons}>
                    {shop.isEditing ? (
                      <>
                        <TouchableOpacity
                          style={styles.saveEditButton}
                          onPress={() => saveTourDressShop(shop.id)}
                        >
                          <Text style={styles.editButtonText}>저장</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.cancelEditButton}
                          onPress={() => cancelEditTourDressShop(shop.id)}
                        >
                          <Text style={styles.editButtonText}>취소</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity
                        style={styles.startEditButton}
                        onPress={() => startEditTourDressShop(shop.id)}
                      >
                        <Text style={styles.editIconText}>✎</Text>
                      </TouchableOpacity>
                    )}
                    {tourDressShops.length > 1 && (
                      <TouchableOpacity
                        style={styles.deleteItemButton}
                        onPress={() => removeTourDressShop(shop.id)}
                      >
                        <Text style={styles.deleteItemText}>×</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* 느낌 메모 */}
                <View style={styles.feelingSection}>
                  <Text style={styles.feelingLabel}>💭 느낌 메모</Text>
                  <TextInput
                    style={[styles.feelingInput, !shop.isEditing && styles.inputDisabled]}
                    placeholder="이 드레스샵의 분위기, 서비스, 드레스 스타일 등..."
                    value={shop.feeling}
                    onChangeText={(text) => updateTourDressShop(shop.id, 'feeling', text)}
                    multiline
                    editable={shop.isEditing}
                  />
                </View>

                {/* 샵 사진 */}
                <View style={styles.tourPhotoSection}>
                  <View style={styles.tourPhotoHeader}>
                    <Text style={styles.tourPhotoLabel}>사진</Text>
                    {shop.isEditing && (
                      <TouchableOpacity
                        style={styles.addTourPhotoButton}
                        onPress={() => pickTourShopPhoto(shop.id)}
                      >
                        <Text style={styles.addTourPhotoButtonText}>+ 추가</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {shop.photos.length > 0 ? (
                    <View style={styles.tourPhotoGrid}>
                      {shop.photos.map((photo) => (
                        <View key={photo.id} style={styles.tourPhotoContainer}>
                          <Image source={{ uri: photo.uri }} style={styles.tourPhoto} />
                          {shop.isEditing && (
                            <TouchableOpacity
                              style={styles.deleteTourPhotoButton}
                              onPress={() => removeTourShopPhoto(shop.id, photo.id)}
                            >
                              <Text style={styles.deleteTourPhotoText}>×</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noPhotoText}>아직 사진이 없습니다</Text>
                  )}
                </View>

                {/* Pick 드레스 섹션 */}
                <View style={styles.pickDressSection}>
                  <View style={styles.pickDressHeader}>
                    <Text style={styles.pickDressLabel}>✨ Pick! 드레스</Text>
                    <Text style={styles.pickDressCount}>{shop.pickDresses.length}/2</Text>
                  </View>
                  <Text style={styles.pickDressSubtext}>마음에 드는 드레스 최대 2벌 선점</Text>

                  <View style={styles.pickDressGrid}>
                    {shop.pickDresses.map((dress) => (
                      <View key={dress.id} style={styles.pickDressCard}>
                        <Image source={{ uri: dress.uri }} style={styles.pickDressImage} />
                        <View style={styles.pickDressBadge}>
                          <Text style={styles.pickDressBadgeText}>PICK!</Text>
                        </View>
                        {shop.isEditing && (
                          <TouchableOpacity
                            style={styles.deletePickDressButton}
                            onPress={() => removePickDress(shop.id, dress.id)}
                          >
                            <Text style={styles.deletePickDressText}>×</Text>
                          </TouchableOpacity>
                        )}
                        <TextInput
                          style={styles.pickDressNameInput}
                          placeholder="드레스 이름"
                          value={dress.name}
                          onChangeText={(text) => updatePickDressName(shop.id, dress.id, text)}
                          editable={shop.isEditing}
                        />
                      </View>
                    ))}

                    {shop.pickDresses.length < 2 && shop.isEditing && (
                      <TouchableOpacity
                        style={styles.addPickDressButton}
                        onPress={() => addPickDress(shop.id)}
                      >
                        <Text style={styles.addPickDressIcon}>+</Text>
                        <Text style={styles.addPickDressText}>Pick 드레스 추가</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))}

            {/* 드레스샵 추가 버튼 */}
            <TouchableOpacity style={styles.addItemButton} onPress={addTourDressShop}>
              <Text style={styles.addItemButtonText}>+ 드레스샵 추가하기</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 드레스샵 선택 - 투어 드레스샵 정보 입력 */}
        {currentItem.id === 'dress-shop-selection' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👗 드레스샵 정보</Text>
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
                {/* 투어 날짜 */}
                <View style={styles.dateInputContainer}>
                  <View style={styles.dateDisplayRow}>
                    <Text style={styles.dateInputLabel}>투어 날짜 *</Text>
                    <Text style={[styles.dateInputValue, !shop.date && styles.dateInputPlaceholder]}>
                      {shop.date || '날짜를 선택하세요'}
                    </Text>
                  </View>
                  {shop.isEditing && (
                    <TouchableOpacity
                      style={styles.selectDateButton}
                      onPress={() => setShowShopDatePicker(shop.id)}
                    >
                      <Text style={styles.selectDateButtonText}>날짜 선택</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {showShopDatePicker === shop.id && (
                  <DateTimePicker
                    value={shop.date ? new Date(shop.date.replace(/\./g, '-')) : new Date()}
                    mode="date"
                    onChange={(event, selectedDate) => handleShopDateChange(shop.id, event, selectedDate)}
                  />
                )}
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

        {/* 촬영업체 정보 - wedding-photo-day일 때 표시 */}
        {currentItem.id === 'wedding-photo-day' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>촬영업체 정보</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditingStudio(!isEditingStudio)}
              >
                <Text style={styles.editButtonText}>{isEditingStudio ? '완료' : '✎ 수정'}</Text>
              </TouchableOpacity>
            </View>

            {isEditingStudio ? (
              <View style={styles.studioEditContainer}>
                {/* 기본 정보 */}
                <View style={styles.studioEditSection}>
                  <Text style={styles.studioEditSectionTitle}>기본 정보</Text>
                  <TextInput
                    style={styles.studioInput}
                    placeholder="스튜디오/업체명"
                    placeholderTextColor={COLORS.textLight}
                    value={studioInfo.name}
                    onChangeText={(text) => setStudioInfo({ ...studioInfo, name: text })}
                  />
                  <TextInput
                    style={styles.studioInput}
                    placeholder="연락처 (예: 02-1234-5678)"
                    placeholderTextColor={COLORS.textLight}
                    value={studioInfo.contact}
                    onChangeText={(text) => setStudioInfo({ ...studioInfo, contact: text })}
                    keyboardType="phone-pad"
                  />
                  <TextInput
                    style={styles.studioInput}
                    placeholder="위치/주소"
                    placeholderTextColor={COLORS.textLight}
                    value={studioInfo.location}
                    onChangeText={(text) => setStudioInfo({ ...studioInfo, location: text })}
                  />
                </View>

                {/* 패키지 정보 */}
                <View style={styles.studioEditSection}>
                  <Text style={styles.studioEditSectionTitle}>패키지 정보</Text>
                  <TextInput
                    style={styles.studioInput}
                    placeholder="패키지 구성 (예: 원본 200장, 보정 50장, 앨범 1권)"
                    placeholderTextColor={COLORS.textLight}
                    value={studioInfo.package}
                    onChangeText={(text) => setStudioInfo({ ...studioInfo, package: text })}
                  />
                  <TextInput
                    style={styles.studioInput}
                    placeholder="가격 (예: 150만원)"
                    placeholderTextColor={COLORS.textLight}
                    value={studioInfo.price}
                    onChangeText={(text) => setStudioInfo({ ...studioInfo, price: text })}
                  />
                </View>

                {/* 일정 정보 */}
                <View style={styles.studioEditSection}>
                  <Text style={styles.studioEditSectionTitle}>일정</Text>
                  <TextInput
                    style={styles.studioInput}
                    placeholder="촬영일 (예: 2025년 3월 15일)"
                    placeholderTextColor={COLORS.textLight}
                    value={studioInfo.shootingDate}
                    onChangeText={(text) => setStudioInfo({ ...studioInfo, shootingDate: text })}
                  />
                  <TextInput
                    style={styles.studioInput}
                    placeholder="앨범 수령 예정일"
                    placeholderTextColor={COLORS.textLight}
                    value={studioInfo.albumDate}
                    onChangeText={(text) => setStudioInfo({ ...studioInfo, albumDate: text })}
                  />
                </View>

                {/* 본식 스냅 */}
                <View style={styles.studioEditSection}>
                  <Text style={styles.studioEditSectionTitle}>본식 스냅</Text>
                  <TextInput
                    style={styles.studioInput}
                    placeholder="본식 스냅 작가/업체 (선택사항)"
                    placeholderTextColor={COLORS.textLight}
                    value={studioInfo.snapPhotographer}
                    onChangeText={(text) => setStudioInfo({ ...studioInfo, snapPhotographer: text })}
                  />
                </View>

                {/* 메모 */}
                <View style={styles.studioEditSection}>
                  <Text style={styles.studioEditSectionTitle}>기타 메모</Text>
                  <TextInput
                    style={[styles.studioInput, styles.studioMemoInput]}
                    placeholder="추가 메모 (야외 촬영 장소, 컨셉, 요청사항 등)"
                    placeholderTextColor={COLORS.textLight}
                    value={studioInfo.memo}
                    onChangeText={(text) => setStudioInfo({ ...studioInfo, memo: text })}
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.studioInfoCard}>
                {studioInfo.name ? (
                  <>
                    {/* 업체명 헤더 */}
                    <View style={styles.studioHeader}>
                      <Text style={styles.studioName}>{studioInfo.name}</Text>
                    </View>

                    {/* 연락처 & 위치 */}
                    {(studioInfo.contact || studioInfo.location) && (
                      <View style={styles.studioContactSection}>
                        {studioInfo.contact && (
                          <View style={styles.studioInfoItem}>
                            <Text style={styles.studioInfoIcon}>📞</Text>
                            <Text style={styles.studioInfoText}>{studioInfo.contact}</Text>
                          </View>
                        )}
                        {studioInfo.location && (
                          <View style={styles.studioInfoItem}>
                            <Text style={styles.studioInfoIcon}>📍</Text>
                            <Text style={styles.studioInfoText}>{studioInfo.location}</Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* 패키지 정보 */}
                    {(studioInfo.package || studioInfo.price) && (
                      <View style={styles.studioPackageSection}>
                        <Text style={styles.studioSectionLabel}>패키지 정보</Text>
                        {studioInfo.package && (
                          <Text style={styles.studioPackageText}>{studioInfo.package}</Text>
                        )}
                        {studioInfo.price && (
                          <Text style={styles.studioPriceText}>💰 {studioInfo.price}</Text>
                        )}
                      </View>
                    )}

                    {/* 일정 정보 */}
                    {(studioInfo.shootingDate || studioInfo.albumDate) && (
                      <View style={styles.studioScheduleSection}>
                        <Text style={styles.studioSectionLabel}>일정</Text>
                        {studioInfo.shootingDate && (
                          <View style={styles.studioInfoItem}>
                            <Text style={styles.studioInfoIcon}>📅</Text>
                            <Text style={styles.studioInfoText}>촬영일: {studioInfo.shootingDate}</Text>
                          </View>
                        )}
                        {studioInfo.albumDate && (
                          <View style={styles.studioInfoItem}>
                            <Text style={styles.studioInfoIcon}>📚</Text>
                            <Text style={styles.studioInfoText}>앨범 수령: {studioInfo.albumDate}</Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* 본식 스냅 */}
                    {studioInfo.snapPhotographer && (
                      <View style={styles.studioSnapSection}>
                        <Text style={styles.studioSectionLabel}>본식 스냅</Text>
                        <View style={styles.studioInfoItem}>
                          <Text style={styles.studioInfoIcon}>⦿</Text>
                          <Text style={styles.studioInfoText}>{studioInfo.snapPhotographer}</Text>
                        </View>
                      </View>
                    )}

                    {/* 메모 */}
                    {studioInfo.memo && (
                      <View style={styles.studioMemoSection}>
                        <Text style={styles.studioSectionLabel}>메모</Text>
                        <Text style={styles.studioMemoText}>{studioInfo.memo}</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.emptyStudioContainer}
                    onPress={() => setIsEditingStudio(true)}
                  >
                    <Text style={styles.emptyStudioIcon}>⦿</Text>
                    <Text style={styles.emptyStudioTitle}>촬영업체 정보 등록</Text>
                    <Text style={styles.emptyStudioSubtitle}>탭하여 스튜디오 정보를 입력하세요</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {/* 혼주 한복 - 한복집 업체 정보 */}
        {currentItem.id === 'parents-hanbok' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>✾ 한복집 정보</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditingHanbokShop(!isEditingHanbokShop)}
              >
                <Text style={styles.editButtonText}>{isEditingHanbokShop ? '완료' : '✎ 수정'}</Text>
              </TouchableOpacity>
            </View>

            {isEditingHanbokShop ? (
              <View style={styles.hanbokShopEditContainer}>
                <TextInput
                  style={styles.hanbokShopInput}
                  placeholder="한복집 이름"
                  placeholderTextColor={COLORS.textLight}
                  value={hanbokShopInfo.name}
                  onChangeText={(text) => setHanbokShopInfo({ ...hanbokShopInfo, name: text })}
                />
                <TextInput
                  style={styles.hanbokShopInput}
                  placeholder="전화번호 (예: 02-1234-5678)"
                  placeholderTextColor={COLORS.textLight}
                  value={hanbokShopInfo.contact}
                  onChangeText={(text) => setHanbokShopInfo({ ...hanbokShopInfo, contact: text })}
                  keyboardType="phone-pad"
                />
                <TextInput
                  style={styles.hanbokShopInput}
                  placeholder="위치/주소"
                  placeholderTextColor={COLORS.textLight}
                  value={hanbokShopInfo.location}
                  onChangeText={(text) => setHanbokShopInfo({ ...hanbokShopInfo, location: text })}
                />
              </View>
            ) : (
              <View style={styles.hanbokShopInfoCard}>
                {hanbokShopInfo.name ? (
                  <>
                    <View style={styles.hanbokShopHeader}>
                      <Text style={styles.hanbokShopName}>{hanbokShopInfo.name}</Text>
                    </View>
                    <View style={styles.hanbokShopDetails}>
                      {hanbokShopInfo.contact && (
                        <View style={styles.hanbokShopInfoItem}>
                          <Text style={styles.hanbokShopInfoIcon}>📞</Text>
                          <Text style={styles.hanbokShopInfoText}>{hanbokShopInfo.contact}</Text>
                        </View>
                      )}
                      {hanbokShopInfo.location && (
                        <View style={styles.hanbokShopInfoItem}>
                          <Text style={styles.hanbokShopInfoIcon}>📍</Text>
                          <Text style={styles.hanbokShopInfoText}>{hanbokShopInfo.location}</Text>
                        </View>
                      )}
                    </View>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.emptyHanbokShopContainer}
                    onPress={() => setIsEditingHanbokShop(true)}
                  >
                    <Text style={styles.emptyHanbokShopIcon}>✾</Text>
                    <Text style={styles.emptyHanbokShopTitle}>한복집 정보 등록</Text>
                    <Text style={styles.emptyHanbokShopSubtitle}>탭하여 한복집 정보를 입력하세요</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
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
  dateInputContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightPink,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateDisplayRow: {
    flex: 1,
  },
  dateInputLabel: {
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
    marginBottom: 4,
  },
  dateInputValue: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    fontWeight: '600',
  },
  dateInputPlaceholder: {
    color: COLORS.textLight,
    fontWeight: 'normal',
  },
  selectDateButton: {
    backgroundColor: COLORS.darkPink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  selectDateButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
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
  editWeddingDateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editWeddingDateButtonText: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    fontWeight: '600',
  },
  weddingDateEditContainer: {
    gap: 12,
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
  // 촬영업체 정보 - 편집 모드
  studioEditContainer: {
    gap: 16,
  },
  studioEditSection: {
    gap: 8,
  },
  studioEditSectionTitle: {
    fontSize: 13,
    fontFamily: 'GowunDodum_400Regular',
    fontWeight: 'bold',
    color: COLORS.darkPink,
    marginBottom: 4,
  },
  studioInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
  },
  studioMemoInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  // 촬영업체 정보 - 표시 모드
  studioInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  studioHeader: {
    backgroundColor: COLORS.darkPink,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  studioName: {
    fontSize: 18,
    fontFamily: 'GowunDodum_400Regular',
    fontWeight: 'bold',
    color: COLORS.white,
  },
  studioContactSection: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  studioInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  studioInfoIcon: {
    fontSize: 16,
  },
  studioInfoText: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    flex: 1,
  },
  studioPackageSection: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  studioSectionLabel: {
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    fontWeight: 'bold',
    color: COLORS.textGray,
    marginBottom: 8,
  },
  studioPackageText: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    lineHeight: 20,
  },
  studioPriceText: {
    fontSize: 15,
    fontFamily: 'GowunDodum_400Regular',
    fontWeight: 'bold',
    color: COLORS.darkPink,
    marginTop: 8,
  },
  studioScheduleSection: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  studioSnapSection: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  studioMemoSection: {
    padding: 14,
  },
  studioMemoText: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    lineHeight: 20,
  },
  // 빈 상태
  emptyStudioContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: COLORS.lightPink,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.darkPink,
    borderStyle: 'dashed',
  },
  emptyStudioIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyStudioTitle: {
    fontSize: 16,
    fontFamily: 'GowunDodum_400Regular',
    fontWeight: 'bold',
    color: COLORS.darkPink,
    marginBottom: 4,
  },
  emptyStudioSubtitle: {
    fontSize: 13,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
  },
  // 섹션 부제목
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
    marginBottom: 16,
    marginTop: -8,
  },
  // ============ 드레스샵 투어 (간소화) 스타일 ============
  tourShopCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.lightPink,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tourShopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tourShopTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  tourShopNumber: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    fontWeight: 'bold',
    color: COLORS.darkPink,
    backgroundColor: COLORS.lightPink,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tourShopNameInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkPink,
    paddingVertical: 4,
  },
  tourShopName: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'GowunDodum_400Regular',
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  feelingSection: {
    marginBottom: 16,
  },
  feelingLabel: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    fontWeight: 'bold',
    color: COLORS.darkPink,
    marginBottom: 8,
  },
  feelingInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  tourPhotoSection: {
    marginBottom: 16,
  },
  tourPhotoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tourPhotoLabel: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    fontWeight: 'bold',
    color: COLORS.darkPink,
  },
  addTourPhotoButton: {
    backgroundColor: COLORS.lightPink,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  addTourPhotoButtonText: {
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    fontWeight: 'bold',
  },
  tourPhotoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tourPhotoContainer: {
    width: 70,
    height: 70,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  tourPhoto: {
    width: '100%',
    height: '100%',
  },
  deleteTourPhotoButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteTourPhotoText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  noPhotoText: {
    fontSize: 13,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textLight,
    textAlign: 'center',
    paddingVertical: 20,
  },
  // Pick 드레스 섹션
  pickDressSection: {
    backgroundColor: COLORS.lightPink,
    borderRadius: 12,
    padding: 14,
  },
  pickDressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickDressLabel: {
    fontSize: 15,
    fontFamily: 'GowunDodum_400Regular',
    fontWeight: 'bold',
    color: COLORS.darkPink,
  },
  pickDressCount: {
    fontSize: 13,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    fontWeight: 'bold',
  },
  pickDressSubtext: {
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
    marginTop: 4,
    marginBottom: 12,
  },
  pickDressGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  pickDressCard: {
    width: 120,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.darkPink,
    position: 'relative',
  },
  pickDressImage: {
    width: '100%',
    height: 150,
  },
  pickDressBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.darkPink,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pickDressBadgeText: {
    fontSize: 10,
    fontFamily: 'GowunDodum_400Regular',
    fontWeight: 'bold',
    color: COLORS.white,
  },
  deletePickDressButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deletePickDressText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickDressNameInput: {
    padding: 8,
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  addPickDressButton: {
    width: 120,
    height: 180,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.darkPink,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPickDressIcon: {
    fontSize: 32,
    color: COLORS.darkPink,
    marginBottom: 4,
  },
  addPickDressText: {
    fontSize: 11,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // ============ 혼주 한복 스타일 ============
  hanbokShopEditContainer: {
    gap: 12,
  },
  hanbokShopInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
  },
  hanbokShopInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  hanbokShopHeader: {
    backgroundColor: COLORS.darkPink,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  hanbokShopName: {
    fontSize: 17,
    fontFamily: 'GowunDodum_400Regular',
    fontWeight: 'bold',
    color: COLORS.white,
  },
  hanbokShopDetails: {
    padding: 14,
    gap: 10,
  },
  hanbokShopInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hanbokShopInfoIcon: {
    fontSize: 16,
  },
  hanbokShopInfoText: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    flex: 1,
  },
  emptyHanbokShopContainer: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: COLORS.lightPink,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.darkPink,
    borderStyle: 'dashed',
  },
  emptyHanbokShopIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyHanbokShopTitle: {
    fontSize: 15,
    fontFamily: 'GowunDodum_400Regular',
    fontWeight: 'bold',
    color: COLORS.darkPink,
    marginBottom: 4,
  },
  emptyHanbokShopSubtitle: {
    fontSize: 13,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
  },
});
