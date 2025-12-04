import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';

const ADJUSTMENT_OPTIONS = [
  { id: 'increase-photo', name: '사진·영상 예산 늘리기', icon: '📸', category: 'photo' },
  { id: 'increase-dress', name: '드레스 업그레이드', icon: '👗', category: 'sdm' },
  { id: 'decrease-total', name: '전체 예산 줄이기', icon: '💸', category: null },
  { id: 'rebalance', name: '예산 구조만 바꾸기', icon: '🔄', category: null },
];

const CATEGORY_NAMES = {
  venue: '예식장·식대',
  sdm: '스드메',
  photo: '사진·영상',
  flower: '플라워·데코',
  ceremony: '사회·축가',
  etc: '기타',
  reserve: '예비비',
};

export default function BudgetWizardScreen({ navigation }) {
  const [budgetData, setBudgetData] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('wedding-budget-data');
      if (saved) {
        setBudgetData(JSON.parse(saved));
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

  const generateRecommendations = () => {
    if (!budgetData || !selectedOption || !adjustAmount) return;

    const amount = parseInt(adjustAmount);
    const categories = budgetData.categories;
    const recs = [];

    if (selectedOption.id === 'increase-photo' || selectedOption.id === 'increase-dress') {
      // 특정 카테고리 예산 늘리기
      const targetCat = selectedOption.category;

      // 1안: 플라워/데코에서 줄이기
      recs.push({
        id: 1,
        name: '플라워·데코에서 줄이기',
        icon: '🌸',
        changes: [
          { category: targetCat, change: amount, direction: 'increase' },
          { category: 'flower', change: amount * 0.6, direction: 'decrease' },
          { category: 'etc', change: amount * 0.4, direction: 'decrease' },
        ],
        impact: {
          positive: [`${CATEGORY_NAMES[targetCat]} 퀄리티 상승`],
          negative: ['플라워 장식 심플해짐', '답례품/이벤트 축소'],
        },
      });

      // 2안: 예비비에서 줄이기
      recs.push({
        id: 2,
        name: '예비비에서 충당하기',
        icon: '💰',
        changes: [
          { category: targetCat, change: amount, direction: 'increase' },
          { category: 'reserve', change: amount, direction: 'decrease' },
        ],
        impact: {
          positive: [`${CATEGORY_NAMES[targetCat]} 퀄리티 상승`],
          negative: ['예비비 감소 (비상 상황 대비 약해짐)'],
        },
      });

      // 3안: 여러 곳에서 조금씩
      recs.push({
        id: 3,
        name: '여러 곳에서 조금씩',
        icon: '⚖️',
        changes: [
          { category: targetCat, change: amount, direction: 'increase' },
          { category: 'flower', change: amount * 0.3, direction: 'decrease' },
          { category: 'ceremony', change: amount * 0.2, direction: 'decrease' },
          { category: 'etc', change: amount * 0.3, direction: 'decrease' },
          { category: 'reserve', change: amount * 0.2, direction: 'decrease' },
        ],
        impact: {
          positive: [`${CATEGORY_NAMES[targetCat]} 퀄리티 상승`],
          negative: ['전체적으로 소폭 축소'],
        },
      });
    } else if (selectedOption.id === 'decrease-total') {
      // 전체 예산 줄이기
      recs.push({
        id: 1,
        name: '옵션 항목 위주로 줄이기',
        icon: '✂️',
        changes: [
          { category: 'flower', change: amount * 0.35, direction: 'decrease' },
          { category: 'etc', change: amount * 0.35, direction: 'decrease' },
          { category: 'ceremony', change: amount * 0.15, direction: 'decrease' },
          { category: 'reserve', change: amount * 0.15, direction: 'decrease' },
        ],
        impact: {
          positive: ['필수 항목 유지'],
          negative: ['플라워/이벤트 축소', '예비비 감소'],
        },
      });

      recs.push({
        id: 2,
        name: '전 항목 균등 감소',
        icon: '📉',
        changes: Object.keys(CATEGORY_NAMES).map(cat => ({
          category: cat,
          change: amount / 7,
          direction: 'decrease',
        })),
        impact: {
          positive: ['균형 있는 감소'],
          negative: ['전체적인 퀄리티 소폭 하락'],
        },
      });
    } else {
      // 구조만 바꾸기 (총액 유지)
      recs.push({
        id: 1,
        name: '사진 중심으로 재배분',
        icon: '📸',
        changes: [
          { category: 'photo', change: amount, direction: 'increase' },
          { category: 'flower', change: amount * 0.5, direction: 'decrease' },
          { category: 'etc', change: amount * 0.5, direction: 'decrease' },
        ],
        impact: {
          positive: ['사진 퀄리티 상승'],
          negative: ['플라워/기타 축소'],
        },
      });

      recs.push({
        id: 2,
        name: '식사 중심으로 재배분',
        icon: '🍽️',
        changes: [
          { category: 'venue', change: amount, direction: 'increase' },
          { category: 'sdm', change: amount * 0.5, direction: 'decrease' },
          { category: 'flower', change: amount * 0.5, direction: 'decrease' },
        ],
        impact: {
          positive: ['식사 퀄리티 상승'],
          negative: ['스드메/플라워 축소'],
        },
      });
    }

    setRecommendations(recs);
  };

  const handleNext = () => {
    if (step === 1 && selectedOption) {
      setStep(2);
    } else if (step === 2 && adjustAmount) {
      generateRecommendations();
      setStep(3);
    }
  };

  const handleApply = async () => {
    if (!selectedRecommendation || !budgetData) return;

    const updatedCategories = { ...budgetData.categories };

    selectedRecommendation.changes.forEach(change => {
      if (updatedCategories[change.category]) {
        const currentBudget = updatedCategories[change.category].budgetAmount || 0;
        if (change.direction === 'increase') {
          updatedCategories[change.category].budgetAmount = currentBudget + change.change;
        } else {
          updatedCategories[change.category].budgetAmount = Math.max(0, currentBudget - change.change);
        }
      }
    });

    const updatedData = {
      ...budgetData,
      categories: updatedCategories,
      updatedAt: new Date().toISOString(),
    };

    try {
      await AsyncStorage.setItem('wedding-budget-data', JSON.stringify(updatedData));
      Alert.alert(
        '적용 완료',
        '예산이 조정되었습니다.',
        [{ text: '확인', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('저장 실패:', error);
      Alert.alert('오류', '저장에 실패했습니다.');
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>어떤 방향으로 조정할까요?</Text>
      <Text style={styles.stepDesc}>원하는 조정 방향을 선택해주세요</Text>

      <View style={styles.optionsGrid}>
        {ADJUSTMENT_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionCard,
              selectedOption?.id === option.id && styles.optionCardSelected
            ]}
            onPress={() => setSelectedOption(option)}
          >
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <Text style={[
              styles.optionName,
              selectedOption?.id === option.id && styles.optionNameSelected
            ]}>
              {option.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>
        {selectedOption?.id === 'decrease-total'
          ? '얼마를 줄이고 싶으세요?'
          : selectedOption?.id === 'rebalance'
          ? '얼마를 재배분할까요?'
          : '얼마를 더 쓰고 싶으세요?'}
      </Text>
      <Text style={styles.stepDesc}>
        조정하고 싶은 금액을 입력해주세요
      </Text>

      <View style={styles.amountInputContainer}>
        <TextInput
          style={styles.amountInput}
          placeholder="예: 1000000"
          placeholderTextColor={COLORS.textLight}
          value={displayMoney(adjustAmount)}
          onChangeText={(text) => setAdjustAmount(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
        />
        <Text style={styles.amountSuffix}>원</Text>
      </View>

      {adjustAmount && (
        <Text style={styles.amountPreview}>
          = {formatMoney(adjustAmount)}원
        </Text>
      )}

      {/* 빠른 선택 버튼 */}
      <View style={styles.quickAmounts}>
        {[500000, 1000000, 2000000, 3000000].map(amount => (
          <TouchableOpacity
            key={amount}
            style={styles.quickAmountButton}
            onPress={() => setAdjustAmount(String(amount))}
          >
            <Text style={styles.quickAmountText}>{formatMoney(amount)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>추천 조합</Text>
      <Text style={styles.stepDesc}>
        {formatMoney(adjustAmount)}원 조정을 위한 추천안이에요
      </Text>

      {recommendations.map(rec => (
        <TouchableOpacity
          key={rec.id}
          style={[
            styles.recCard,
            selectedRecommendation?.id === rec.id && styles.recCardSelected
          ]}
          onPress={() => setSelectedRecommendation(rec)}
        >
          <View style={styles.recHeader}>
            <Text style={styles.recIcon}>{rec.icon}</Text>
            <Text style={[
              styles.recName,
              selectedRecommendation?.id === rec.id && styles.recNameSelected
            ]}>
              {rec.id}안) {rec.name}
            </Text>
            {selectedRecommendation?.id === rec.id && (
              <View style={styles.recSelectedBadge}>
                <Text style={styles.recSelectedText}>✓</Text>
              </View>
            )}
          </View>

          <View style={styles.recChanges}>
            {rec.changes.map((change, idx) => (
              <View key={idx} style={styles.changeItem}>
                <Text style={styles.changeCat}>{CATEGORY_NAMES[change.category]}</Text>
                <Text style={[
                  styles.changeAmount,
                  { color: change.direction === 'increase' ? '#4CAF50' : '#F44336' }
                ]}>
                  {change.direction === 'increase' ? '+' : '-'}{formatMoney(change.change)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.recImpact}>
            {rec.impact.positive.map((p, idx) => (
              <Text key={`p-${idx}`} style={styles.impactPositive}>👍 {p}</Text>
            ))}
            {rec.impact.negative.map((n, idx) => (
              <Text key={`n-${idx}`} style={styles.impactNegative}>👎 {n}</Text>
            ))}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (step > 1) {
              setStep(step - 1);
            } else {
              navigation.goBack();
            }
          }}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>예산 조정 마법사</Text>
        <View style={styles.headerRight} />
      </View>

      {/* 스텝 인디케이터 */}
      <View style={styles.stepIndicator}>
        {[1, 2, 3].map(s => (
          <View key={s} style={styles.stepDotContainer}>
            <View style={[styles.stepDot, s <= step && styles.stepDotActive]} />
            {s < 3 && <View style={[styles.stepLine, s < step && styles.stepLineActive]} />}
          </View>
        ))}
      </View>

      {/* 스텝 내용 */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      {/* 버튼 */}
      <View style={styles.buttonContainer}>
        {step < 3 ? (
          <TouchableOpacity
            style={[
              styles.nextButton,
              (step === 1 && !selectedOption) && styles.buttonDisabled,
              (step === 2 && !adjustAmount) && styles.buttonDisabled,
            ]}
            onPress={handleNext}
            disabled={(step === 1 && !selectedOption) || (step === 2 && !adjustAmount)}
          >
            <Text style={styles.nextButtonText}>다음</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.applyButton,
              !selectedRecommendation && styles.buttonDisabled
            ]}
            onPress={handleApply}
            disabled={!selectedRecommendation}
          >
            <Text style={styles.applyButtonText}>이 안으로 적용하기</Text>
          </TouchableOpacity>
        )}
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
  headerRight: {
    width: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  stepDotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.border,
  },
  stepDotActive: {
    backgroundColor: COLORS.darkPink,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: COLORS.darkPink,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
    marginBottom: 24,
  },
  optionsGrid: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: COLORS.darkPink,
    backgroundColor: COLORS.lightPink,
  },
  optionIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
  },
  optionNameSelected: {
    color: COLORS.darkPink,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    paddingVertical: 12,
  },
  amountSuffix: {
    fontSize: 18,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
  },
  amountPreview: {
    fontSize: 16,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    marginTop: 12,
    textAlign: 'right',
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },
  quickAmountButton: {
    backgroundColor: COLORS.lightPink,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  quickAmountText: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    fontWeight: '600',
  },
  recCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  recCardSelected: {
    borderColor: COLORS.darkPink,
    backgroundColor: COLORS.lightPink,
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  recName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    flex: 1,
  },
  recNameSelected: {
    color: COLORS.darkPink,
  },
  recSelectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.darkPink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recSelectedText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  recChanges: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  changeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  changeCat: {
    fontSize: 13,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
  },
  changeAmount: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'GowunDodum_400Regular',
  },
  recImpact: {
    gap: 4,
  },
  impactPositive: {
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    color: '#4CAF50',
  },
  impactNegative: {
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    color: '#F44336',
  },
  buttonContainer: {
    padding: 20,
  },
  nextButton: {
    backgroundColor: COLORS.darkPink,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.white,
  },
  applyButton: {
    backgroundColor: COLORS.darkPink,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.white,
  },
  buttonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  bottomSpacing: {
    height: 40,
  },
});
