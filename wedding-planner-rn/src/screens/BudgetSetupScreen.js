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
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';
import StepIndicator from '../components/StepIndicator';

const { width } = Dimensions.get('window');

const ONBOARDING_STEPS = ['날짜 설정', '타임라인', '예산 설정', '배경 선택'];
const TOTAL_STEPS = 4;

// 예식 타입별 기본 비율
const WEDDING_TYPE_RATIOS = {
  hotel: { venue: 0.48, sdm: 0.14, photo: 0.12, honeymoon: 0.16, dowry: 0.10 },
  hall: { venue: 0.46, sdm: 0.16, photo: 0.12, honeymoon: 0.16, dowry: 0.10 },
  house: { venue: 0.43, sdm: 0.16, photo: 0.15, honeymoon: 0.14, dowry: 0.12 },
  small: { venue: 0.40, sdm: 0.18, photo: 0.16, honeymoon: 0.16, dowry: 0.10 },
  religious: { venue: 0.38, sdm: 0.17, photo: 0.15, honeymoon: 0.18, dowry: 0.12 },
};

const WEDDING_TYPES = [
  { id: 'hotel', name: '호텔 웨딩', desc: '격식있는 럭셔리' },
  { id: 'hall', name: '웨딩홀', desc: '합리적인 선택' },
  { id: 'house', name: '하우스 웨딩', desc: '감성적인 분위기' },
  { id: 'small', name: '스몰 웨딩', desc: '소규모·프라이빗' },
  { id: 'religious', name: '종교기관', desc: '교회·성당·사찰' },
];

// 카테고리
const CATEGORIES = [
  { id: 'venue', name: '예식장·식대', color: '#FF6B6B' },
  { id: 'sdm', name: '스드메', color: '#4ECDC4' },
  { id: 'photo', name: '사진·영상', color: '#45B7D1' },
  { id: 'honeymoon', name: '신혼여행', color: '#87CEEB' },
  { id: 'dowry', name: '혼수', color: '#DEB887' },
];

// 빠른 금액 입력 버튼 값
const QUICK_AMOUNTS = [
  { label: '+10만', value: 100000 },
  { label: '+100만', value: 1000000 },
  { label: '+1000만', value: 10000000 },
];

export default function BudgetSetupScreen({ navigation, route }) {
  const [parentSupport, setParentSupport] = useState('');
  const [ownSavings, setOwnSavings] = useState('');
  const [includeHoneymoon, setIncludeHoneymoon] = useState(true);
  const [expectedGuests, setExpectedGuests] = useState('');
  const [foodCostPerPerson, setFoodCostPerPerson] = useState('70000');
  const [weddingType, setWeddingType] = useState('hall');
  const [categoryRatios, setCategoryRatios] = useState(WEDDING_TYPE_RATIOS.hall);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  useEffect(() => {
    loadExistingData();
    checkIfOnboarding();
  }, []);

  const checkIfOnboarding = async () => {
    try {
      const budgetData = await AsyncStorage.getItem('wedding-budget-data');
      const onboardingProgress = await AsyncStorage.getItem('onboarding-progress');

      if (!budgetData || (onboardingProgress && JSON.parse(onboardingProgress).step === 3)) {
        setIsOnboarding(true);
      }
    } catch (error) {
      console.error('온보딩 상태 확인 실패:', error);
    }
  };

  useEffect(() => {
    setCategoryRatios(WEDDING_TYPE_RATIOS[weddingType]);
  }, [weddingType]);

  const loadExistingData = async () => {
    try {
      const saved = await AsyncStorage.getItem('wedding-budget-data');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.parentSupport) setParentSupport(String(data.parentSupport));
        if (data.ownSavings) setOwnSavings(String(data.ownSavings));
        if (data.includeHoneymoon !== undefined) setIncludeHoneymoon(data.includeHoneymoon);
        if (data.expectedGuests) setExpectedGuests(String(data.expectedGuests));
        if (data.foodCostPerPerson) setFoodCostPerPerson(String(data.foodCostPerPerson));
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

  // 빠른 금액 추가 함수
  const addQuickAmount = (setter, currentValue, amount) => {
    const current = currentValue ? parseInt(currentValue) : 0;
    setter(String(current + amount));
  };

  // 총 가용 예산 계산 (양가 지원금 + 예비부부 자금)
  const getTotalAvailable = () => {
    const parent = parentSupport ? parseInt(parentSupport) : 0;
    const own = ownSavings ? parseInt(ownSavings) : 0;
    return parent + own;
  };

  // 예식장 식대 계산 (하객수 × 1인당 식대)
  const calculateVenueFoodCost = () => {
    const guests = expectedGuests ? parseInt(expectedGuests) : 0;
    const costPerPerson = foodCostPerPerson ? parseInt(foodCostPerPerson) : 70000;
    return guests * costPerPerson;
  };

  const handleSave = async () => {
    const totalBudget = getTotalAvailable();

    if (totalBudget <= 0) {
      alert('양가 지원금 또는 예비부부 자금을 입력해주세요.');
      return;
    }

    const venueFoodCost = calculateVenueFoodCost();

    // 카테고리별 예산 계산 (만원 단위로 절사)
    const categories = {};
    CATEGORIES.forEach(cat => {
      let budgetAmount = Math.floor((totalBudget * categoryRatios[cat.id]) / 10000) * 10000;

      // 예식장·식대의 경우 최소한 식대 비용 반영 (만원 단위)
      if (cat.id === 'venue' && venueFoodCost > 0) {
        const roundedVenueCost = Math.floor(venueFoodCost / 10000) * 10000;
        budgetAmount = Math.max(budgetAmount, roundedVenueCost);
      }

      categories[cat.id] = {
        budgetAmount,
        confirmedAmount: 0,
        items: [],
      };
    });

    const budgetData = {
      totalBudget,
      parentSupport: parentSupport ? parseInt(parentSupport) : 0,
      ownSavings: ownSavings ? parseInt(ownSavings) : 0,
      includeHoneymoon,
      expectedGuests: expectedGuests ? parseInt(expectedGuests) : 0,
      foodCostPerPerson: foodCostPerPerson ? parseInt(foodCostPerPerson) : 70000,
      weddingType,
      categoryRatios,
      categories,
      isSetupComplete: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await AsyncStorage.setItem('wedding-budget-data', JSON.stringify(budgetData));
      await AsyncStorage.setItem('onboarding-progress', JSON.stringify({ step: 4 }));
      navigation.navigate('BackgroundImage');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const totalBudget = getTotalAvailable();
  const selectedType = WEDDING_TYPES.find(t => t.id === weddingType);
  const canProceed = totalBudget > 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          {!isOnboarding && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          )}
          <Text style={[styles.headerTitle, isOnboarding && { flex: 1, textAlign: 'center' }]}>예산 설정</Text>
          {!isOnboarding && <View style={styles.headerRight} />}
        </View>

        {/* 온보딩 중일 때 스텝 인디케이터 표시 */}
        {isOnboarding && (
          <View style={styles.stepIndicatorContainer}>
            <StepIndicator
              currentStep={3}
              totalSteps={TOTAL_STEPS}
              stepLabels={ONBOARDING_STEPS}
            />
          </View>
        )}

        <View style={styles.content}>
          {/* 양가 지원금 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>양가 지원금</Text>
            <Text style={styles.sectionDesc}>양가에서 지원받는 금액을 입력해주세요</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.moneyInput}
                placeholder="예: 30000000"
                placeholderTextColor={COLORS.textLight}
                value={displayMoney(parentSupport)}
                onChangeText={(text) => setParentSupport(formatInputMoney(text))}
                keyboardType="numeric"
              />
              <Text style={styles.inputSuffix}>원</Text>
            </View>
            {/* 빠른 금액 입력 버튼 */}
            <View style={styles.quickAmountContainer}>
              {QUICK_AMOUNTS.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.quickAmountButton}
                  onPress={() => addQuickAmount(setParentSupport, parentSupport, item.value)}
                >
                  <Text style={styles.quickAmountText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.quickAmountButton, styles.quickAmountReset]}
                onPress={() => setParentSupport('')}
              >
                <Text style={styles.quickAmountResetText}>초기화</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 예비부부 자금 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>예비부부 자금</Text>
            <Text style={styles.sectionDesc}>직접 준비한 결혼 자금을 입력해주세요</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.moneyInput}
                placeholder="예: 20000000"
                placeholderTextColor={COLORS.textLight}
                value={displayMoney(ownSavings)}
                onChangeText={(text) => setOwnSavings(formatInputMoney(text))}
                keyboardType="numeric"
              />
              <Text style={styles.inputSuffix}>원</Text>
            </View>
            {/* 빠른 금액 입력 버튼 */}
            <View style={styles.quickAmountContainer}>
              {QUICK_AMOUNTS.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.quickAmountButton}
                  onPress={() => addQuickAmount(setOwnSavings, ownSavings, item.value)}
                >
                  <Text style={styles.quickAmountText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.quickAmountButton, styles.quickAmountReset]}
                onPress={() => setOwnSavings('')}
              >
                <Text style={styles.quickAmountResetText}>초기화</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 총 가용 예산 표시 */}
          {totalBudget > 0 && (
            <View style={styles.totalBudgetCard}>
              <Text style={styles.totalBudgetLabel}>총 가용 예산</Text>
              <Text style={styles.totalBudgetValue}>{formatBudgetPreview(String(totalBudget))}원</Text>
              <Text style={styles.totalBudgetDetail}>
                양가 지원금 {formatBudgetPreview(parentSupport || '0')}원 + 예비부부 자금 {formatBudgetPreview(ownSavings || '0')}원
              </Text>
            </View>
          )}

          {/* 신혼여행/혼수 별도 관리 */}
          <View style={styles.section}>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>신혼여행/혼수 예산 별도 관리</Text>
              <Switch
                value={!includeHoneymoon}
                onValueChange={(val) => setIncludeHoneymoon(!val)}
                trackColor={{ false: COLORS.border, true: COLORS.lightPink }}
                thumbColor={!includeHoneymoon ? COLORS.darkPink : '#f4f3f4'}
              />
            </View>
            {!includeHoneymoon && (
              <Text style={styles.toggleHint}>
                * 별도 관리 시 예산 비율에서 제외됩니다
              </Text>
            )}
          </View>

          {/* 예상 하객 수 및 1인당 식대 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>예상 하객 수</Text>
            <Text style={styles.sectionDesc}>예식장·식대 예산 계산에 반영됩니다</Text>
            <View style={styles.guestRow}>
              <View style={styles.guestInputWrapper}>
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
              <Text style={styles.multiplySign}>×</Text>
              <View style={styles.guestInputWrapper}>
                <TextInput
                  style={styles.guestInput}
                  placeholder="70000"
                  placeholderTextColor={COLORS.textLight}
                  value={displayMoney(foodCostPerPerson)}
                  onChangeText={(text) => setFoodCostPerPerson(formatInputMoney(text))}
                  keyboardType="numeric"
                />
                <Text style={styles.inputSuffix}>원/인</Text>
              </View>
            </View>
            {expectedGuests && foodCostPerPerson && (
              <Text style={styles.calculatedCost}>
                예상 식대: {formatBudgetPreview(String(calculateVenueFoodCost()))}원
              </Text>
            )}
          </View>

          {/* 예식 타입 선택 - 드롭다운 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>예식 타입</Text>
            <Text style={styles.sectionDesc}>
              예식 타입에 따라 추천 예산 비율이 달라져요
            </Text>

            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowTypeDropdown(true)}
            >
              <Text style={styles.dropdownText}>
                {selectedType?.name || '선택해주세요'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
            {selectedType && (
              <Text style={styles.typeSelectedDesc}>{selectedType.desc}</Text>
            )}
          </View>

          {/* 예산 비율 미리보기 */}
          {totalBudget > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>예산 배분 미리보기</Text>
              <Text style={styles.sectionDesc}>
                예식 타입을 기준으로 추천된 비율이에요
              </Text>

              <View style={styles.chartContainer}>
                {CATEGORIES.map((cat) => {
                  const ratio = categoryRatios[cat.id];
                  let amount = Math.round(totalBudget * ratio);

                  // 예식장의 경우 식대 비용 표시
                  if (cat.id === 'venue') {
                    const venueFoodCost = calculateVenueFoodCost();
                    if (venueFoodCost > amount) {
                      amount = venueFoodCost;
                    }
                  }

                  return (
                    <View key={cat.id} style={styles.chartRow}>
                      <View style={styles.chartLabelContainer}>
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
                * 설정 완료 후 예산 화면에서 수정할 수 있어요
              </Text>
            </View>
          )}

          {/* 다음 버튼 */}
          <TouchableOpacity
            style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
            onPress={handleSave}
            disabled={!canProceed}
          >
            <Text style={styles.nextButtonText}>다음</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>

      {/* 예식 타입 드롭다운 모달 */}
      <Modal
        visible={showTypeDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTypeDropdown(false)}
      >
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setShowTypeDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownModalTitle}>예식 타입 선택</Text>
            {WEDDING_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.dropdownOption,
                  weddingType === type.id && styles.dropdownOptionSelected
                ]}
                onPress={() => {
                  setWeddingType(type.id);
                  setShowTypeDropdown(false);
                }}
              >
                <Text style={[
                  styles.dropdownOptionText,
                  weddingType === type.id && styles.dropdownOptionTextSelected
                ]}>
                  {type.name}
                </Text>
                <Text style={styles.dropdownOptionDesc}>{type.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
    fontSize: 16,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    paddingVertical: 10,
  },
  inputSuffix: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
    marginLeft: 4,
  },
  // 빠른 금액 입력 버튼
  quickAmountContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: COLORS.lightPink,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 13,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    fontWeight: '600',
  },
  quickAmountReset: {
    backgroundColor: COLORS.border,
  },
  quickAmountResetText: {
    fontSize: 13,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
  },
  // 총 가용 예산 카드
  totalBudgetCard: {
    backgroundColor: COLORS.darkPink,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  totalBudgetLabel: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  totalBudgetValue: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.white,
    marginBottom: 8,
  },
  totalBudgetDetail: {
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.white,
    opacity: 0.8,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
  },
  toggleHint: {
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textLight,
    marginTop: 8,
  },
  // 하객 수 입력
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guestInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  multiplySign: {
    fontSize: 16,
    color: COLORS.textGray,
    fontWeight: '600',
  },
  calculatedCost: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    marginTop: 12,
    textAlign: 'right',
  },
  // 드롭다운
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
  },
  dropdownArrow: {
    fontSize: 12,
    color: COLORS.textGray,
  },
  typeSelectedDesc: {
    fontSize: 13,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    marginTop: 8,
    textAlign: 'center',
  },
  // 드롭다운 모달
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownModal: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
  },
  dropdownModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    textAlign: 'center',
    marginBottom: 16,
  },
  dropdownOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: COLORS.background,
  },
  dropdownOptionSelected: {
    backgroundColor: COLORS.lightPink,
    borderWidth: 1,
    borderColor: COLORS.darkPink,
  },
  dropdownOptionText: {
    fontSize: 16,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    fontWeight: '600',
  },
  dropdownOptionTextSelected: {
    color: COLORS.darkPink,
  },
  dropdownOptionDesc: {
    fontSize: 13,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
    marginTop: 2,
  },
  // 차트
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
  stepIndicatorContainer: {
    backgroundColor: COLORS.background,
    paddingVertical: 10,
  },
});
