import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';

// 카테고리별 기본 항목 & 옵션
const CATEGORY_ITEMS = {
  venue: {
    items: [
      { id: 'hall-rental', name: '홀 대관료', tag: 'required', desc: '예식장 대여 비용' },
      { id: 'meal', name: '식대 (1인)', tag: 'required', desc: '하객 식사 비용' },
      { id: 'meal-upgrade', name: '식사 업그레이드', tag: 'optional', desc: '프리미엄 메뉴로 변경', popularity: '40%' },
      { id: 'parking', name: '주차권', tag: 'optional', desc: '하객용 주차권 추가', popularity: '60%' },
    ],
    tips: '식대는 예상 하객 수 × 1인 단가로 계산하세요. 실제 참석률은 보통 70~80% 정도입니다.',
  },
  sdm: {
    items: [
      { id: 'studio', name: '스튜디오 촬영', tag: 'required', desc: '기본 스튜디오 패키지' },
      { id: 'dress', name: '드레스 대여', tag: 'required', desc: '웨딩드레스 대여' },
      { id: 'makeup', name: '메이크업', tag: 'required', desc: '신부 헤어/메이크업' },
      { id: 'outdoor', name: '야외 추가 촬영', tag: 'optional', desc: '야외 로케이션 촬영', popularity: '50%', notRecommended: true },
      { id: 'album-upgrade', name: '앨범 업그레이드', tag: 'optional', desc: '고급 앨범으로 변경', popularity: '35%', notRecommended: true },
      { id: 'raw-files', name: '원본 전체 제공', tag: 'optional', desc: '모든 원본 파일 제공', popularity: '70%' },
    ],
    tips: '야외 추가 촬영은 사진 수는 많아지지만, 예산이 타이트할 때 가장 먼저 줄이는 옵션이에요.',
  },
  photo: {
    items: [
      { id: 'snap', name: '본식 스냅', tag: 'required', desc: '예식 당일 사진 촬영' },
      { id: 'video', name: '본식 영상', tag: 'popular', desc: '예식 당일 영상 촬영', popularity: '80%' },
      { id: 'drone', name: '드론 촬영', tag: 'optional', desc: '항공 촬영 추가', popularity: '20%', notRecommended: true },
      { id: 'same-day', name: '당일 편집 영상', tag: 'optional', desc: '식전 상영용 영상', popularity: '45%' },
    ],
    tips: '본식 영상은 "찍어두길 잘했다"는 후기가 많아요. 예산이 된다면 추천!',
  },
  flower: {
    items: [
      { id: 'bouquet', name: '부케', tag: 'required', desc: '신부 부케' },
      { id: 'corsage', name: '코사지/부토니에', tag: 'required', desc: '양가 부모님 & 신랑용' },
      { id: 'table-deco', name: '테이블 장식', tag: 'optional', desc: '하객 테이블 꽃장식', popularity: '55%' },
      { id: 'photo-zone', name: '포토존 장식', tag: 'optional', desc: '포토존 플라워 데코', popularity: '60%' },
      { id: 'aisle', name: '버진로드 장식', tag: 'optional', desc: '입장로 꽃장식', popularity: '40%' },
    ],
    tips: '플라워는 예식장 기본 제공 범위를 먼저 확인하세요. 중복 비용을 줄일 수 있어요.',
  },
  ceremony: {
    items: [
      { id: 'mc', name: '사회자', tag: 'required', desc: '예식 진행 사회' },
      { id: 'singer', name: '축가', tag: 'popular', desc: '축가 섭외', popularity: '85%' },
      { id: 'officiant', name: '주례', tag: 'optional', desc: '주례 섭외 및 사례', popularity: '50%' },
      { id: 'live-band', name: '라이브 밴드', tag: 'luxury', desc: '라이브 음악 연주', popularity: '10%' },
    ],
    tips: '친구나 지인 중 노래 잘하는 분께 부탁하면 축가 비용을 절약할 수 있어요.',
  },
  etc: {
    items: [
      { id: 'gift', name: '답례품', tag: 'required', desc: '하객 답례품' },
      { id: 'invitation', name: '청첩장', tag: 'required', desc: '종이/모바일 청첩장' },
      { id: 'photo-booth', name: '포토부스', tag: 'optional', desc: '즉석 사진 촬영 부스', popularity: '35%' },
      { id: 'balloon', name: '풍선 장식', tag: 'optional', desc: '풍선 데코레이션', popularity: '25%', notRecommended: true },
    ],
    tips: '답례품은 1인 5,000~10,000원 사이가 적당해요. 실용적인 것이 좋아요.',
  },
  reserve: {
    items: [
      { id: 'reserve', name: '예비비', tag: 'required', desc: '예상치 못한 비용 대비' },
    ],
    tips: '예비비는 총 예산의 5~10%를 권장해요. 예상치 못한 추가 비용에 대비하세요.',
  },
};

const TAG_STYLES = {
  required: { label: '필수', color: '#4CAF50', bg: '#E8F5E9' },
  popular: { label: '인기', color: '#2196F3', bg: '#E3F2FD' },
  optional: { label: '선택', color: '#FF9800', bg: '#FFF3E0' },
  luxury: { label: '럭셔리', color: '#9C27B0', bg: '#F3E5F5' },
};

export default function BudgetCategoryDetailScreen({ route, navigation }) {
  const { categoryId, categoryName, categoryIcon } = route.params;
  const [budgetData, setBudgetData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [itemAmounts, setItemAmounts] = useState({});
  const [enabledItems, setEnabledItems] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('wedding-budget-data');
      if (saved) {
        const data = JSON.parse(saved);
        setBudgetData(data);
        const catData = data.categories?.[categoryId] || {};
        setCategoryData(catData);

        // 저장된 항목 금액 & 활성화 상태 로드
        const amounts = {};
        const enabled = {};
        (catData.items || []).forEach(item => {
          amounts[item.id] = item.amount || 0;
          enabled[item.id] = item.enabled !== false;
        });
        setItemAmounts(amounts);
        setEnabledItems(enabled);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };

  const formatMoney = (amount) => {
    if (!amount) return '0';
    const num = parseInt(amount);
    if (num >= 10000) {
      return `${Math.round(num / 10000).toLocaleString()}만`;
    }
    return num.toLocaleString();
  };

  const displayMoney = (value) => {
    if (!value) return '';
    const num = parseInt(value);
    return num.toLocaleString();
  };

  const handleAmountChange = (itemId, value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setItemAmounts({ ...itemAmounts, [itemId]: numericValue });
  };

  const toggleItem = (itemId) => {
    setEnabledItems({ ...enabledItems, [itemId]: !enabledItems[itemId] });
  };

  const getTotalConfirmed = () => {
    let total = 0;
    Object.entries(itemAmounts).forEach(([id, amount]) => {
      if (enabledItems[id] !== false && amount) {
        total += parseInt(amount) || 0;
      }
    });
    return total;
  };

  const getBudgetAmount = () => {
    return categoryData?.budgetAmount || 0;
  };

  const getDiff = () => {
    return getBudgetAmount() - getTotalConfirmed();
  };

  const handleSave = async () => {
    if (!budgetData) return;

    const items = CATEGORY_ITEMS[categoryId]?.items.map(item => ({
      id: item.id,
      name: item.name,
      amount: parseInt(itemAmounts[item.id]) || 0,
      enabled: enabledItems[item.id] !== false,
    })) || [];

    const updatedCategories = {
      ...budgetData.categories,
      [categoryId]: {
        ...budgetData.categories[categoryId],
        items,
        confirmedAmount: getTotalConfirmed(),
      },
    };

    const updatedData = {
      ...budgetData,
      categories: updatedCategories,
      updatedAt: new Date().toISOString(),
    };

    try {
      await AsyncStorage.setItem('wedding-budget-data', JSON.stringify(updatedData));
      Alert.alert('저장 완료', '예산이 저장되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('저장 실패:', error);
      Alert.alert('오류', '저장에 실패했습니다.');
    }
  };

  const categoryConfig = CATEGORY_ITEMS[categoryId] || { items: [], tips: '' };
  const diff = getDiff();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryIcon} {categoryName}</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>저장</Text>
        </TouchableOpacity>
      </View>

      {/* 요약 카드 */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>배정 예산</Text>
            <Text style={styles.summaryValue}>{formatMoney(getBudgetAmount())}원</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>예상 지출</Text>
            <Text style={styles.summaryValue}>{formatMoney(getTotalConfirmed())}원</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>차이</Text>
            <Text style={[
              styles.summaryValue,
              { color: diff >= 0 ? '#4CAF50' : '#F44336' }
            ]}>
              {diff >= 0 ? '-' : '+'}{formatMoney(Math.abs(diff))}원
            </Text>
          </View>
        </View>

        {diff < 0 && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              ⚠️ 예산을 {formatMoney(Math.abs(diff))}원 초과했어요
            </Text>
          </View>
        )}
      </View>

      {/* 항목 리스트 */}
      <View style={styles.itemsSection}>
        <Text style={styles.sectionTitle}>세부 항목</Text>

        {categoryConfig.items.map((item) => {
          const tagStyle = TAG_STYLES[item.tag] || TAG_STYLES.optional;
          const isEnabled = enabledItems[item.id] !== false;
          const isRequired = item.tag === 'required';

          return (
            <View
              key={item.id}
              style={[styles.itemCard, !isEnabled && styles.itemCardDisabled]}
            >
              <View style={styles.itemHeader}>
                <View style={styles.itemTitleRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={[styles.tagBadge, { backgroundColor: tagStyle.bg }]}>
                    <Text style={[styles.tagText, { color: tagStyle.color }]}>
                      {tagStyle.label}
                    </Text>
                  </View>
                  {item.notRecommended && (
                    <View style={styles.notRecommendedBadge}>
                      <Text style={styles.notRecommendedText}>비추천</Text>
                    </View>
                  )}
                </View>
                {!isRequired && (
                  <Switch
                    value={isEnabled}
                    onValueChange={() => toggleItem(item.id)}
                    trackColor={{ false: COLORS.border, true: COLORS.lightPink }}
                    thumbColor={isEnabled ? COLORS.darkPink : '#f4f3f4'}
                  />
                )}
              </View>

              <Text style={styles.itemDesc}>{item.desc}</Text>

              {item.popularity && (
                <Text style={styles.popularityText}>
                  {item.notRecommended ? '🔻' : '📊'} {item.popularity} 선택
                </Text>
              )}

              {isEnabled && (
                <View style={styles.amountInputContainer}>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="금액 입력"
                    placeholderTextColor={COLORS.textLight}
                    value={displayMoney(itemAmounts[item.id])}
                    onChangeText={(text) => handleAmountChange(item.id, text)}
                    keyboardType="numeric"
                  />
                  <Text style={styles.amountSuffix}>원</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* 플래너 팁 */}
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 플래너 TIP</Text>
        <Text style={styles.tipText}>{categoryConfig.tips}</Text>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: COLORS.lightPink,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: COLORS.darkPink,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
  },
  saveButton: {
    backgroundColor: COLORS.darkPink,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    margin: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
  },
  warningBanner: {
    backgroundColor: '#FFEBEE',
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
  },
  warningText: {
    fontSize: 13,
    fontFamily: 'GowunDodum_400Regular',
    color: '#F44336',
    textAlign: 'center',
  },
  itemsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  itemCardDisabled: {
    opacity: 0.5,
    backgroundColor: COLORS.background,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
  },
  notRecommendedBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  notRecommendedText: {
    fontSize: 10,
    color: '#F44336',
    fontFamily: 'GowunDodum_400Regular',
  },
  itemDesc: {
    fontSize: 13,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
    marginBottom: 6,
  },
  popularityText: {
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textLight,
    marginBottom: 10,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    paddingVertical: 10,
  },
  amountSuffix: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
  },
  tipCard: {
    backgroundColor: '#FFF9E6',
    margin: 20,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});
