import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

const PRIORITY_ITEMS = [
  { id: 'photo', name: '사진·영상', icon: '📸', desc: '인생샷을 남기고 싶어요' },
  { id: 'dress', name: '드레스·스타일링', icon: '👗', desc: '예쁘게 빛나고 싶어요' },
  { id: 'food', name: '하객 식사 퀄리티', icon: '🍽️', desc: '맛있게 대접하고 싶어요' },
  { id: 'venue', name: '예식장 분위기', icon: '🏰', desc: '공간이 중요해요' },
  { id: 'flower', name: '플라워·데코', icon: '🌸', desc: '화려하게 꾸미고 싶어요' },
  { id: 'event', name: '이벤트·연출', icon: '🎉', desc: '특별한 순간을 만들고 싶어요' },
  { id: 'parents', name: '양가 부모님 대접', icon: '👨‍👩‍👧‍👦', desc: '부모님께 효도하고 싶어요' },
];

// 우선순위에 따른 비율 조정
const PRIORITY_ADJUSTMENTS = {
  photo: { photo: 0.05 },
  dress: { sdm: 0.05 },
  food: { venue: 0.05 },
  venue: { venue: 0.05 },
  flower: { flower: 0.05 },
  event: { ceremony: 0.03, etc: 0.02 },
  parents: { venue: 0.03, etc: 0.02 },
};

export default function BudgetPriorityScreen({ navigation }) {
  const [budgetData, setBudgetData] = useState(null);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [priorityLevels, setPriorityLevels] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('wedding-budget-data');
      if (saved) {
        const data = JSON.parse(saved);
        setBudgetData(data);
        if (data.priorities) {
          setSelectedPriorities(data.priorities);
        }
        if (data.priorityLevels) {
          setPriorityLevels(data.priorityLevels);
        }
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };

  const togglePriority = (itemId) => {
    if (selectedPriorities.includes(itemId)) {
      setSelectedPriorities(selectedPriorities.filter(id => id !== itemId));
      const newLevels = { ...priorityLevels };
      delete newLevels[itemId];
      setPriorityLevels(newLevels);
    } else {
      if (selectedPriorities.length >= 3) {
        // 최대 3개까지만 선택
        return;
      }
      setSelectedPriorities([...selectedPriorities, itemId]);
      setPriorityLevels({ ...priorityLevels, [itemId]: 3 }); // 기본 중요도 3
    }
  };

  const setPriorityLevel = (itemId, level) => {
    setPriorityLevels({ ...priorityLevels, [itemId]: level });
  };

  const handleSave = async () => {
    if (!budgetData) return;

    // 기본 비율에서 시작
    let newRatios = { ...budgetData.categoryRatios };

    // 우선순위에 따라 비율 조정
    selectedPriorities.forEach(priority => {
      const level = priorityLevels[priority] || 3;
      const adjustments = PRIORITY_ADJUSTMENTS[priority];
      if (adjustments) {
        Object.entries(adjustments).forEach(([catId, baseAdjust]) => {
          const adjust = baseAdjust * (level / 3); // 중요도에 따라 조정
          newRatios[catId] = (newRatios[catId] || 0) + adjust;
        });
      }
    });

    // 예비비에서 차감해서 총합 1.0 맞추기
    const totalRatio = Object.values(newRatios).reduce((sum, r) => sum + r, 0);
    if (totalRatio > 1) {
      const excess = totalRatio - 1;
      newRatios.reserve = Math.max(0.02, (newRatios.reserve || 0.05) - excess);
    }

    // 카테고리별 예산 재계산
    const categories = { ...budgetData.categories };
    Object.keys(categories).forEach(catId => {
      categories[catId].budgetAmount = Math.round(budgetData.totalBudget * newRatios[catId]);
    });

    const updatedData = {
      ...budgetData,
      categoryRatios: newRatios,
      categories,
      priorities: selectedPriorities,
      priorityLevels,
      isSetupComplete: true,
      updatedAt: new Date().toISOString(),
    };

    try {
      await AsyncStorage.setItem('wedding-budget-data', JSON.stringify(updatedData));
      // 메인 탭으로 돌아가기
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error) {
      console.error('저장 실패:', error);
    }
  };

  const renderStars = (itemId) => {
    const level = priorityLevels[itemId] || 0;
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setPriorityLevel(itemId, star)}
          >
            <Text style={[styles.star, star <= level && styles.starActive]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getAdjustmentText = (itemId) => {
    const level = priorityLevels[itemId] || 3;
    const percent = Math.round((level / 3) * 5);
    if (level >= 4) {
      return `예산을 기본보다 +${percent}~${percent + 3}% 더 배분할게요`;
    } else if (level <= 2) {
      return `예산을 기본보다 -${5 - percent}% 줄일게요`;
    }
    return '기본 비율을 유지할게요';
  };

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
        <Text style={styles.headerTitle}>우선순위 설정</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        {/* 안내 */}
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>🎯 우리에게 중요한 건?</Text>
          <Text style={styles.guideText}>
            두 분에게 가장 중요한 부분을 최대 3개 선택하고{'\n'}
            중요도를 표시해주세요. 예산 배분에 반영할게요.
          </Text>
        </View>

        {/* 우선순위 아이템 */}
        <View style={styles.priorityGrid}>
          {PRIORITY_ITEMS.map((item) => {
            const isSelected = selectedPriorities.includes(item.id);
            const canSelect = isSelected || selectedPriorities.length < 3;

            return (
              <View key={item.id} style={styles.priorityItemWrapper}>
                <TouchableOpacity
                  style={[
                    styles.priorityCard,
                    isSelected && styles.priorityCardSelected,
                    !canSelect && styles.priorityCardDisabled,
                  ]}
                  onPress={() => togglePriority(item.id)}
                  activeOpacity={canSelect ? 0.7 : 1}
                >
                  <Text style={styles.priorityIcon}>{item.icon}</Text>
                  <Text style={[
                    styles.priorityName,
                    isSelected && styles.priorityNameSelected
                  ]}>
                    {item.name}
                  </Text>
                  <Text style={styles.priorityDesc}>{item.desc}</Text>

                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* 중요도 별점 */}
                {isSelected && (
                  <View style={styles.levelContainer}>
                    {renderStars(item.id)}
                    <Text style={styles.adjustmentText}>
                      {getAdjustmentText(item.id)}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* 선택 현황 */}
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>
            선택됨: {selectedPriorities.length}/3
          </Text>
        </View>

        {/* 건너뛰기 & 완료 버튼 */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSave}
          >
            <Text style={styles.skipButtonText}>건너뛰기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.completeButton,
              selectedPriorities.length === 0 && styles.completeButtonDisabled
            ]}
            onPress={handleSave}
          >
            <Text style={styles.completeButtonText}>
              예산 분배 보기
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </View>
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
  content: {
    padding: 20,
  },
  guideCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    marginBottom: 8,
  },
  guideText: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
    lineHeight: 22,
  },
  priorityGrid: {
    gap: 12,
  },
  priorityItemWrapper: {
    marginBottom: 4,
  },
  priorityCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  priorityCardSelected: {
    borderColor: COLORS.darkPink,
    backgroundColor: COLORS.lightPink,
  },
  priorityCardDisabled: {
    opacity: 0.5,
  },
  priorityIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  priorityName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  priorityNameSelected: {
    color: COLORS.darkPink,
  },
  priorityDesc: {
    fontSize: 13,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.darkPink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  levelContainer: {
    backgroundColor: COLORS.white,
    marginTop: -8,
    marginHorizontal: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: COLORS.lightPink,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  star: {
    fontSize: 24,
    color: COLORS.border,
  },
  starActive: {
    color: '#FFD700',
  },
  adjustmentText: {
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
  },
  selectionInfo: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  selectionText: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  skipButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  skipButtonText: {
    fontSize: 15,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
  },
  completeButton: {
    flex: 2,
    backgroundColor: COLORS.darkPink,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  completeButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.white,
  },
  bottomSpacing: {
    height: 40,
  },
});
