import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

// 카테고리 기본 데이터
const DEFAULT_CATEGORIES = [
  { id: 'venue', name: '예식장·식대', icon: '🏛️', defaultRatio: 0.50 },
  { id: 'sdm', name: '스드메', icon: '👗', defaultRatio: 0.18 },
  { id: 'photo', name: '사진·영상', icon: '📸', defaultRatio: 0.12 },
  { id: 'flower', name: '플라워·데코', icon: '🌸', defaultRatio: 0.07 },
  { id: 'ceremony', name: '사회·축가', icon: '🎤', defaultRatio: 0.03 },
  { id: 'etc', name: '기타', icon: '🎁', defaultRatio: 0.05 },
  { id: 'reserve', name: '예비비', icon: '💰', defaultRatio: 0.05 },
];

export default function BudgetScreen({ navigation }) {
  const [budgetData, setBudgetData] = useState(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

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
      } else {
        setIsSetupComplete(false);
      }
    } catch (error) {
      console.error('예산 데이터 로드 실패:', error);
    }
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
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureText}>총 예산 대비 지출 현황 한눈에</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎯</Text>
              <Text style={styles.featureText}>우선순위에 따른 예산 배분</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💡</Text>
              <Text style={styles.featureText}>업셀링 필터링 & 플래너 팁</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔄</Text>
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
          <Text style={styles.settingsButtonText}>⚙️</Text>
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
        <Text style={styles.sectionTitle}>카테고리별 예산</Text>

        {DEFAULT_CATEGORIES.map((category) => {
          const catData = budgetData?.categories?.[category.id] || {};
          const budget = catData.budgetAmount || 0;
          const confirmed = catData.confirmedAmount || 0;
          const diff = budget - confirmed;

          let statusIcon = '⏳';
          let statusColor = COLORS.textGray;
          if (confirmed > 0) {
            if (diff >= 0) {
              statusIcon = '✅';
              statusColor = '#4CAF50';
            } else {
              statusIcon = '⚠️';
              statusColor = '#FF9800';
            }
          }

          return (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => navigation.navigate('BudgetCategoryDetail', {
                categoryId: category.id,
                categoryName: category.name,
                categoryIcon: category.icon
              })}
            >
              <View style={styles.categoryLeft}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryBudget}>
                    예산: {formatMoney(budget)}원
                  </Text>
                </View>
              </View>
              <View style={styles.categoryRight}>
                <Text style={[styles.categoryStatus, { color: statusColor }]}>
                  {statusIcon} {confirmed > 0 ? `${formatMoney(confirmed)}원` : '미정'}
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
    padding: 8,
  },
  settingsButtonText: {
    fontSize: 22,
  },
  // 빈 상태
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
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
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
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
});
