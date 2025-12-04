import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

// 예식 타입별 기본 비율
const WEDDING_TYPE_RATIOS = {
  hotel: { venue: 0.55, sdm: 0.15, photo: 0.12, flower: 0.06, ceremony: 0.03, etc: 0.04, reserve: 0.05 },
  hall: { venue: 0.50, sdm: 0.18, photo: 0.12, flower: 0.07, ceremony: 0.03, etc: 0.05, reserve: 0.05 },
  house: { venue: 0.45, sdm: 0.18, photo: 0.15, flower: 0.10, ceremony: 0.03, etc: 0.04, reserve: 0.05 },
  small: { venue: 0.40, sdm: 0.20, photo: 0.18, flower: 0.08, ceremony: 0.04, etc: 0.05, reserve: 0.05 },
};

const WEDDING_TYPES = [
  { id: 'hotel', name: '호텔 웨딩', icon: '🏨', desc: '격식있는 럭셔리' },
  { id: 'hall', name: '웨딩홀', icon: '🏛️', desc: '합리적인 선택' },
  { id: 'house', name: '하우스 웨딩', icon: '🏡', desc: '감성적인 분위기' },
  { id: 'small', name: '스몰 웨딩', icon: '💒', desc: '소규모·프라이빗' },
];

const CATEGORIES = [
  { id: 'venue', name: '예식장·식대', icon: '🏛️', color: '#FF6B6B' },
  { id: 'sdm', name: '스드메', icon: '👗', color: '#4ECDC4' },
  { id: 'photo', name: '사진·영상', icon: '📸', color: '#45B7D1' },
  { id: 'flower', name: '플라워·데코', icon: '🌸', color: '#96CEB4' },
  { id: 'ceremony', name: '사회·축가', icon: '🎤', color: '#FFEAA7' },
  { id: 'etc', name: '기타', icon: '🎁', color: '#DDA0DD' },
  { id: 'reserve', name: '예비비', icon: '💰', color: '#B8B8B8' },
];

export default function BudgetSetupScreen({ navigation }) {
  const [totalBudget, setTotalBudget] = useState('');
  const [parentSupport, setParentSupport] = useState('');
  const [ownSavings, setOwnSavings] = useState('');
  const [includeHoneymoon, setIncludeHoneymoon] = useState(false);
  const [expectedGuests, setExpectedGuests] = useState('');
  const [weddingType, setWeddingType] = useState('hall');
  const [categoryRatios, setCategoryRatios] = useState(WEDDING_TYPE_RATIOS.hall);

  useEffect(() => {
    loadExistingData();
  }, []);

  useEffect(() => {
    // 예식 타입이 변경되면 비율 업데이트
    setCategoryRatios(WEDDING_TYPE_RATIOS[weddingType]);
  }, [weddingType]);

  const loadExistingData = async () => {
    try {
      const saved = await AsyncStorage.getItem('wedding-budget-data');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.totalBudget) setTotalBudget(String(data.totalBudget));
        if (data.parentSupport) setParentSupport(String(data.parentSupport));
        if (data.ownSavings) setOwnSavings(String(data.ownSavings));
        if (data.includeHoneymoon !== undefined) setIncludeHoneymoon(data.includeHoneymoon);
        if (data.expectedGuests) setExpectedGuests(String(data.expectedGuests));
        if (data.weddingType) setWeddingType(data.weddingType);
        if (data.categoryRatios) setCategoryRatios(data.categoryRatios);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };

  const formatInputMoney = (value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    return numericValue;
  };

  const displayMoney = (value) => {
    if (!value) return '';
    const num = parseInt(value);
    return num.toLocaleString();
  };

  const formatBudgetPreview = (amount) => {
    if (!amount) return '0';
    const num = parseInt(amount);
    if (num >= 100000000) {
      return `${(num / 100000000).toFixed(1)}억`;
    }
    if (num >= 10000) {
      return `${Math.round(num / 10000).toLocaleString()}만`;
    }
    return num.toLocaleString();
  };

  const handleSave = async () => {
    if (!totalBudget) {
      alert('총 예산을 입력해주세요.');
      return;
    }

    const budget = parseInt(totalBudget);

    // 카테고리별 예산 계산
    const categories = {};
    CATEGORIES.forEach(cat => {
      categories[cat.id] = {
        budgetAmount: Math.round(budget * categoryRatios[cat.id]),
        confirmedAmount: 0,
        items: [],
      };
    });

    const budgetData = {
      totalBudget: budget,
      parentSupport: parentSupport ? parseInt(parentSupport) : 0,
      ownSavings: ownSavings ? parseInt(ownSavings) : 0,
      includeHoneymoon,
      expectedGuests: expectedGuests ? parseInt(expectedGuests) : 0,
      weddingType,
      categoryRatios,
      categories,
      isSetupComplete: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await AsyncStorage.setItem('wedding-budget-data', JSON.stringify(budgetData));
      navigation.navigate('BudgetPriority');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const budget = totalBudget ? parseInt(totalBudget) : 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>예산 설정</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.content}>
          {/* 총 예산 입력 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💰 예식 당일 예산</Text>
            <Text style={styles.sectionDesc}>
              예식 당일에 필요한 전체 예산을 입력해주세요
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.moneyInput}
                placeholder="예: 30000000"
                placeholderTextColor={COLORS.textLight}
                value={displayMoney(totalBudget)}
                onChangeText={(text) => setTotalBudget(formatInputMoney(text))}
                keyboardType="numeric"
              />
              <Text style={styles.inputSuffix}>원</Text>
            </View>

            {budget > 0 && (
              <Text style={styles.budgetPreview}>
                = {formatBudgetPreview(totalBudget)}원
              </Text>
            )}

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>신혼여행/혼수도 이 예산에 포함</Text>
              <Switch
                value={includeHoneymoon}
                onValueChange={setIncludeHoneymoon}
                trackColor={{ false: COLORS.border, true: COLORS.lightPink }}
                thumbColor={includeHoneymoon ? COLORS.darkPink : '#f4f3f4'}
              />
            </View>
          </View>

          {/* 양가 지원 & 자기 돈 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💝 자금 구성 (선택)</Text>

            <View style={styles.halfInputRow}>
              <View style={styles.halfInputContainer}>
                <Text style={styles.inputLabel}>양가 지원금</Text>
                <View style={styles.smallInputWrapper}>
                  <TextInput
                    style={styles.smallMoneyInput}
                    placeholder="0"
                    placeholderTextColor={COLORS.textLight}
                    value={displayMoney(parentSupport)}
                    onChangeText={(text) => setParentSupport(formatInputMoney(text))}
                    keyboardType="numeric"
                  />
                  <Text style={styles.smallInputSuffix}>원</Text>
                </View>
              </View>

              <View style={styles.halfInputContainer}>
                <Text style={styles.inputLabel}>예비부부 자금</Text>
                <View style={styles.smallInputWrapper}>
                  <TextInput
                    style={styles.smallMoneyInput}
                    placeholder="0"
                    placeholderTextColor={COLORS.textLight}
                    value={displayMoney(ownSavings)}
                    onChangeText={(text) => setOwnSavings(formatInputMoney(text))}
                    keyboardType="numeric"
                  />
                  <Text style={styles.smallInputSuffix}>원</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 예상 하객 수 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👥 예상 하객 수</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.guestInput}
                placeholder="예: 200"
                placeholderTextColor={COLORS.textLight}
                value={expectedGuests}
                onChangeText={(text) => setExpectedGuests(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
              />
              <Text style={styles.inputSuffix}>명</Text>
            </View>
          </View>

          {/* 예식 타입 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💒 예식 타입</Text>
            <Text style={styles.sectionDesc}>
              예식 타입에 따라 추천 예산 비율이 달라져요
            </Text>

            <View style={styles.typeGrid}>
              {WEDDING_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeCard,
                    weddingType === type.id && styles.typeCardSelected
                  ]}
                  onPress={() => setWeddingType(type.id)}
                >
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text style={[
                    styles.typeName,
                    weddingType === type.id && styles.typeNameSelected
                  ]}>
                    {type.name}
                  </Text>
                  <Text style={styles.typeDesc}>{type.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 예산 비율 미리보기 */}
          {budget > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 예산 배분 미리보기</Text>
              <Text style={styles.sectionDesc}>
                예식 타입을 기준으로 추천된 비율이에요
              </Text>

              {/* 간단한 막대 그래프 */}
              <View style={styles.chartContainer}>
                {CATEGORIES.map((cat, index) => {
                  const ratio = categoryRatios[cat.id];
                  const amount = Math.round(budget * ratio);
                  return (
                    <View key={cat.id} style={styles.chartRow}>
                      <View style={styles.chartLabelContainer}>
                        <Text style={styles.chartIcon}>{cat.icon}</Text>
                        <Text style={styles.chartLabel}>{cat.name}</Text>
                      </View>
                      <View style={styles.chartBarContainer}>
                        <View
                          style={[
                            styles.chartBar,
                            { width: `${ratio * 100}%`, backgroundColor: cat.color }
                          ]}
                        />
                      </View>
                      <Text style={styles.chartValue}>
                        {formatBudgetPreview(String(amount))}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <Text style={styles.chartNote}>
                * 다음 단계에서 우선순위에 따라 세부 조정 가능해요
              </Text>
            </View>
          )}

          {/* 다음 버튼 */}
          <TouchableOpacity
            style={[styles.nextButton, !totalBudget && styles.nextButtonDisabled]}
            onPress={handleSave}
            disabled={!totalBudget}
          >
            <Text style={styles.nextButtonText}>다음 (우선순위 정하기)</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  headerRight: {
    width: 40,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 13,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  moneyInput: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    paddingVertical: 12,
  },
  guestInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    paddingVertical: 12,
  },
  inputSuffix: {
    fontSize: 16,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
    marginLeft: 8,
  },
  budgetPreview: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    marginTop: 8,
    textAlign: 'right',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
  },
  halfInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
    marginBottom: 8,
  },
  smallInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  smallMoneyInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    paddingVertical: 10,
  },
  smallInputSuffix: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeCard: {
    width: (width - 70) / 2,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeCardSelected: {
    borderColor: COLORS.darkPink,
    backgroundColor: COLORS.lightPink,
  },
  typeIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  typeName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  typeNameSelected: {
    color: COLORS.darkPink,
  },
  typeDesc: {
    fontSize: 11,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
  },
  chartContainer: {
    gap: 10,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartLabelContainer: {
    width: 90,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  chartLabel: {
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
  },
  chartBarContainer: {
    flex: 1,
    height: 16,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  chartBar: {
    height: '100%',
    borderRadius: 8,
  },
  chartValue: {
    width: 55,
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
    textAlign: 'right',
  },
  chartNote: {
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textLight,
    marginTop: 12,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: COLORS.darkPink,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.white,
  },
  bottomSpacing: {
    height: 40,
  },
});
