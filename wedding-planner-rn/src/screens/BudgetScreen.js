import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

// 카테고리 기본 데이터 (혼수, 신혼여행 포함)
const DEFAULT_CATEGORIES = [
  { id: 'venue', name: '예식장·식대', icon: '🏛️', defaultRatio: 0.38 },
  { id: 'sdm', name: '스드메', icon: '👗', defaultRatio: 0.14 },
  { id: 'photo', name: '사진·영상', icon: '📸', defaultRatio: 0.10 },
  { id: 'flower', name: '플라워·데코', icon: '🌸', defaultRatio: 0.05 },
  { id: 'ceremony', name: '사회·축가', icon: '🎤', defaultRatio: 0.03 },
  { id: 'honeymoon', name: '신혼여행', icon: '✈️', defaultRatio: 0.15 },
  { id: 'dowry', name: '혼수', icon: '🏠', defaultRatio: 0.10 },
  { id: 'etc', name: '기타', icon: '🎁', defaultRatio: 0.02 },
  { id: 'reserve', name: '예비비', icon: '💰', defaultRatio: 0.03 },
];

export default function BudgetScreen({ navigation }) {
  const [budgetData, setBudgetData] = useState(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [customCategories, setCustomCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryBudget, setNewCategoryBudget] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadBudgetData();
    }, [])
  );

  const loadBudgetData = async () => {
    try {
      const saved = await AsyncStorage.getItem('wedding-budget-data');
      if (saved) {
        const data = JSON.parse(saved);
        setBudgetData(data);
        setIsSetupComplete(data.isSetupComplete || false);
        // 커스텀 카테고리 로드
        if (data.customCategories) {
          setCustomCategories(data.customCategories);
        }
      } else {
        setIsSetupComplete(false);
      }
    } catch (error) {
      console.error('예산 데이터 로드 실패:', error);
    }
  };

  // 새 예산 카테고리 추가
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('알림', '카테고리 이름을 입력해주세요.');
      return;
    }
    if (!newCategoryBudget || parseInt(newCategoryBudget) <= 0) {
      Alert.alert('알림', '예산 금액을 입력해주세요.');
      return;
    }

    const newCategory = {
      id: `custom-${Date.now()}`,
      name: newCategoryName.trim(),
      icon: '📌',
      isCustom: true,
    };

    const newCustomCategories = [...customCategories, newCategory];
    const budgetAmount = parseInt(newCategoryBudget);

    // 예산 데이터 업데이트
    const updatedCategories = {
      ...budgetData.categories,
      [newCategory.id]: {
        budgetAmount,
        confirmedAmount: 0,
        items: [],
      },
    };

    const updatedData = {
      ...budgetData,
      categories: updatedCategories,
      customCategories: newCustomCategories,
      updatedAt: new Date().toISOString(),
    };

    try {
      await AsyncStorage.setItem('wedding-budget-data', JSON.stringify(updatedData));
      setBudgetData(updatedData);
      setCustomCategories(newCustomCategories);
      setShowAddModal(false);
      setNewCategoryName('');
      setNewCategoryBudget('');
      Alert.alert('완료', '새 예산 항목이 추가되었습니다.');
    } catch (error) {
      console.error('카테고리 추가 실패:', error);
      Alert.alert('오류', '예산 항목 추가에 실패했습니다.');
    }
  };

  // 예산 카테고리 수정
  const handleEditCategory = async () => {
    if (!editingCategory) return;
    if (!newCategoryName.trim()) {
      Alert.alert('알림', '카테고리 이름을 입력해주세요.');
      return;
    }
    if (!newCategoryBudget || parseInt(newCategoryBudget) <= 0) {
      Alert.alert('알림', '예산 금액을 입력해주세요.');
      return;
    }

    const budgetAmount = parseInt(newCategoryBudget);

    // 커스텀 카테고리인 경우 이름도 수정
    let newCustomCategories = customCategories;
    if (editingCategory.isCustom) {
      newCustomCategories = customCategories.map(cat =>
        cat.id === editingCategory.id ? { ...cat, name: newCategoryName.trim() } : cat
      );
    }

    // 예산 데이터 업데이트
    const updatedCategories = {
      ...budgetData.categories,
      [editingCategory.id]: {
        ...budgetData.categories[editingCategory.id],
        budgetAmount,
      },
    };

    const updatedData = {
      ...budgetData,
      categories: updatedCategories,
      customCategories: newCustomCategories,
      updatedAt: new Date().toISOString(),
    };

    try {
      await AsyncStorage.setItem('wedding-budget-data', JSON.stringify(updatedData));
      setBudgetData(updatedData);
      setCustomCategories(newCustomCategories);
      setShowEditModal(false);
      setEditingCategory(null);
      setNewCategoryName('');
      setNewCategoryBudget('');
      Alert.alert('완료', '예산이 수정되었습니다.');
    } catch (error) {
      console.error('카테고리 수정 실패:', error);
      Alert.alert('오류', '예산 수정에 실패했습니다.');
    }
  };

  // 예산 카테고리 삭제 (커스텀 카테고리만 가능)
  const handleDeleteCategory = (categoryId) => {
    Alert.alert(
      '예산 항목 삭제',
      '이 예산 항목을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            const newCustomCategories = customCategories.filter(cat => cat.id !== categoryId);
            const updatedCategories = { ...budgetData.categories };
            delete updatedCategories[categoryId];

            const updatedData = {
              ...budgetData,
              categories: updatedCategories,
              customCategories: newCustomCategories,
              updatedAt: new Date().toISOString(),
            };

            try {
              await AsyncStorage.setItem('wedding-budget-data', JSON.stringify(updatedData));
              setBudgetData(updatedData);
              setCustomCategories(newCustomCategories);
              Alert.alert('완료', '예산 항목이 삭제되었습니다.');
            } catch (error) {
              console.error('카테고리 삭제 실패:', error);
              Alert.alert('오류', '예산 항목 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  // 카테고리 편집 모달 열기
  const openEditModal = (category, catData) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryBudget(String(catData.budgetAmount || 0));
    setShowEditModal(true);
  };

  // 모든 카테고리 (기본 + 커스텀) 가져오기
  const getAllCategories = () => {
    return [...DEFAULT_CATEGORIES, ...customCategories];
  };

  // 전체 예산 계산
  const getTotalBudget = () => {
    return budgetData?.totalBudget || 0;
  };

  // 예상 지출 계산
  const getExpectedSpending = () => {
    if (!budgetData?.categories) return 0;
    return Object.values(budgetData.categories).reduce((sum, cat) => {
      return sum + (cat.confirmedAmount || cat.budgetAmount || 0);
    }, 0);
  };

  // 여유 금액 계산
  const getRemainingBudget = () => {
    return getTotalBudget() - getExpectedSpending();
  };

  // 상태 계산
  const getBudgetStatus = () => {
    const remaining = getRemainingBudget();
    const total = getTotalBudget();
    const ratio = remaining / total;

    if (ratio >= 0.1) return { status: '안전', color: '#4CAF50', icon: '✅' };
    if (ratio >= 0) return { status: '타이트', color: '#FF9800', icon: '⚠️' };
    return { status: '초과', color: '#F44336', icon: '🚨' };
  };

  // 금액 포맷팅
  const formatMoney = (amount) => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억`;
    }
    if (amount >= 10000) {
      return `${Math.round(amount / 10000).toLocaleString()}만`;
    }
    return amount.toLocaleString();
  };

  // 셋업 미완료 시 초기 화면
  if (!isSetupComplete) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>예산</Text>
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💰</Text>
          <Text style={styles.emptyTitle}>예산 관리 시작하기</Text>
          <Text style={styles.emptySubtitle}>
            결혼 비용을 체계적으로 관리해보세요.{'\n'}
            어디에 돈을 더 쓰고, 어디를 줄일지{'\n'}
            플래너가 도와드릴게요.
          </Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>총 예산 대비 지출 현황 한눈에</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>우선순위에 따른 예산 배분</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>불필요한 옵션 걸러내기 & 플래너 팁</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>예산 조정 마법사</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate('BudgetSetup')}
          >
            <Text style={styles.startButtonText}>예산 설정 시작하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 대시보드 화면
  const status = getBudgetStatus();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>예산</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('BudgetSetup')}
        >
          <Text style={styles.settingsButtonText}>설정</Text>
        </TouchableOpacity>
      </View>

      {/* 상단 요약 영역 */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryLabel}>총 예산</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{status.icon} {status.status}</Text>
          </View>
        </View>

        <Text style={styles.totalBudgetText}>
          {formatMoney(getTotalBudget())}원
        </Text>

        {/* 게이지 바 */}
        <View style={styles.gaugeContainer}>
          <View style={styles.gaugeBackground}>
            <View
              style={[
                styles.gaugeFill,
                {
                  width: `${Math.min((getExpectedSpending() / getTotalBudget()) * 100, 100)}%`,
                  backgroundColor: status.color
                }
              ]}
            />
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>예상 지출</Text>
            <Text style={styles.summaryItemValue}>{formatMoney(getExpectedSpending())}원</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>여유</Text>
            <Text style={[
              styles.summaryItemValue,
              { color: getRemainingBudget() >= 0 ? COLORS.darkPink : '#F44336' }
            ]}>
              {getRemainingBudget() >= 0 ? '' : '-'}{formatMoney(Math.abs(getRemainingBudget()))}원
            </Text>
          </View>
        </View>
      </View>

      {/* 카테고리별 예산 리스트 */}
      <View style={styles.categorySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>카테고리별 예산</Text>
          <TouchableOpacity
            style={styles.addCategoryButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addCategoryButtonText}>+ 항목 추가</Text>
          </TouchableOpacity>
        </View>

        {getAllCategories().map((category) => {
          const catData = budgetData?.categories?.[category.id] || {};
          const budget = catData.budgetAmount || 0;
          const confirmed = catData.confirmedAmount || 0;
          const diff = budget - confirmed;

          let statusColor = COLORS.textGray;
          if (confirmed > 0) {
            statusColor = diff >= 0 ? '#4CAF50' : '#FF9800';
          }

          return (
            <View key={category.id} style={styles.categoryCardWrapper}>
              <TouchableOpacity
                style={styles.categoryCard}
                onPress={() => navigation.navigate('BudgetCategoryDetail', {
                  categoryId: category.id,
                  categoryName: category.name,
                  categoryIcon: category.icon
                })}
              >
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryBudget}>
                    예산: {formatMoney(budget)}원
                  </Text>
                </View>
                <View style={styles.categoryRight}>
                  <Text style={[styles.categoryStatus, { color: statusColor }]}>
                    {confirmed > 0 ? `${formatMoney(confirmed)}원` : '미정'}
                  </Text>
                  {confirmed > 0 && diff !== 0 && (
                    <Text style={[
                      styles.categoryDiff,
                      { color: diff >= 0 ? '#4CAF50' : '#F44336' }
                    ]}>
                      {diff >= 0 ? `-${formatMoney(diff)}` : `+${formatMoney(Math.abs(diff))}`}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
              {/* 편집/삭제 버튼 */}
              <View style={styles.categoryActions}>
                <TouchableOpacity
                  style={styles.editCategoryButton}
                  onPress={() => openEditModal(category, catData)}
                >
                  <Text style={styles.editCategoryText}>✎</Text>
                </TouchableOpacity>
                {category.isCustom && (
                  <TouchableOpacity
                    style={styles.deleteCategoryButton}
                    onPress={() => handleDeleteCategory(category.id)}
                  >
                    <Text style={styles.deleteCategoryText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* 액션 버튼 */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('BudgetPriority')}
        >
          <Text style={styles.actionButtonIcon}>🎯</Text>
          <Text style={styles.actionButtonText}>우선순위 조정</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonPrimary]}
          onPress={() => navigation.navigate('BudgetWizard')}
        >
          <Text style={styles.actionButtonIcon}>✨</Text>
          <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
            예산 조정 마법사
          </Text>
        </TouchableOpacity>
      </View>

      {/* 플래너 팁 */}
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 플래너 TIP</Text>
        <Text style={styles.tipText}>
          예산이 타이트할 때는 '사진·영상'의 옵션 중 야외 추가 촬영이나 앨범 업그레이드를
          먼저 검토해보세요. 대부분의 커플이 "다시 한다면 뺄 것 같다"고 답한 항목이에요.
        </Text>
      </View>

      <View style={styles.bottomSpacing} />

      {/* 예산 항목 추가 모달 */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>예산 항목 추가</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="항목 이름"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="예산 금액 (원)"
              value={newCategoryBudget}
              onChangeText={setNewCategoryBudget}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  setNewCategoryName('');
                  setNewCategoryBudget('');
                }}
              >
                <Text style={styles.modalCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleAddCategory}
              >
                <Text style={styles.modalConfirmText}>추가</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 예산 항목 수정 모달 */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>예산 수정</Text>
            {editingCategory?.isCustom && (
              <TextInput
                style={styles.modalInput}
                placeholder="항목 이름"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />
            )}
            {!editingCategory?.isCustom && (
              <View style={styles.modalCategoryInfo}>
                <Text style={styles.modalCategoryIcon}>{editingCategory?.icon}</Text>
                <Text style={styles.modalCategoryName}>{editingCategory?.name}</Text>
              </View>
            )}
            <TextInput
              style={styles.modalInput}
              placeholder="예산 금액 (원)"
              value={newCategoryBudget}
              onChangeText={setNewCategoryBudget}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowEditModal(false);
                  setEditingCategory(null);
                  setNewCategoryName('');
                  setNewCategoryBudget('');
                }}
              >
                <Text style={styles.modalCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleEditCategory}
              >
                <Text style={styles.modalConfirmText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: COLORS.lightPink,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
  },
  settingsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.white,
    borderRadius: 8,
  },
  settingsButtonText: {
    fontSize: 13,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
  },
  // 빈 상태
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 100,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  featureList: {
    width: '100%',
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
  },
  startButton: {
    backgroundColor: COLORS.darkPink,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  startButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
  },
  // 대시보드
  summaryCard: {
    backgroundColor: COLORS.white,
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.white,
    fontWeight: 'bold',
  },
  totalBudgetText: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    marginBottom: 16,
  },
  gaugeContainer: {
    marginBottom: 16,
  },
  gaugeBackground: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  summaryItemLabel: {
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
    marginBottom: 4,
  },
  summaryItemValue: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
  },
  // 카테고리 섹션
  categorySection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    marginBottom: 12,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    marginBottom: 2,
  },
  categoryBudget: {
    fontSize: 13,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryStatus: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    fontWeight: '600',
  },
  categoryDiff: {
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    marginTop: 2,
  },
  // 액션 버튼
  actionSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtonPrimary: {
    backgroundColor: COLORS.darkPink,
    borderColor: COLORS.darkPink,
  },
  actionButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    fontWeight: '600',
    color: COLORS.textDark,
  },
  actionButtonTextPrimary: {
    color: COLORS.white,
  },
  // 팁 카드
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
    height: 120,
  },
  // 섹션 헤더
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addCategoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.darkPink,
    borderRadius: 8,
  },
  addCategoryButtonText: {
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.white,
    fontWeight: '600',
  },
  // 카테고리 카드 래퍼
  categoryCardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryActions: {
    flexDirection: 'row',
    marginLeft: 6,
    gap: 4,
    flexShrink: 0,
  },
  editCategoryButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editCategoryText: {
    fontSize: 12,
    color: COLORS.textGray,
  },
  deleteCategoryButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteCategoryText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width - 60,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    fontFamily: 'GowunDodum_400Regular',
    marginBottom: 12,
  },
  modalCategoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: COLORS.lightPink,
    borderRadius: 10,
  },
  modalCategoryIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  modalCategoryName: {
    fontSize: 16,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: COLORS.border,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: COLORS.darkPink,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.white,
  },
});
