import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

/**
 * 온보딩 스텝 인디케이터 컴포넌트
 * @param {number} currentStep - 현재 스텝 (1부터 시작)
 * @param {number} totalSteps - 전체 스텝 수
 * @param {Array} stepLabels - 각 스텝의 라벨 (옵션)
 */
export default function StepIndicator({ currentStep, totalSteps, stepLabels = [] }) {
  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {[...Array(totalSteps)].map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <React.Fragment key={stepNumber}>
              {/* 스텝 원 */}
              <View
                style={[
                  styles.stepCircle,
                  isActive && styles.stepCircleActive,
                  isCompleted && styles.stepCircleCompleted,
                ]}
              >
                {isCompleted ? (
                  <Text style={styles.checkMark}>✓</Text>
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      (isActive || isCompleted) && styles.stepNumberActive,
                    ]}
                  >
                    {stepNumber}
                  </Text>
                )}
              </View>

              {/* 연결선 */}
              {stepNumber < totalSteps && (
                <View
                  style={[
                    styles.connector,
                    isCompleted && styles.connectorCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* 라벨 표시 (옵션) */}
      {stepLabels.length > 0 && (
        <View style={styles.labelsContainer}>
          {stepLabels.map((label, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <Text
                key={index}
                style={[
                  styles.stepLabel,
                  (isActive || isCompleted) && styles.stepLabelActive,
                ]}
              >
                {label}
              </Text>
            );
          })}
        </View>
      )}

      {/* 현재 스텝 표시 */}
      <Text style={styles.progressText}>
        {currentStep} / {totalSteps} 단계
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  stepCircleActive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.darkPink,
  },
  stepCircleCompleted: {
    backgroundColor: COLORS.darkPink,
    borderColor: COLORS.darkPink,
  },
  stepNumber: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    fontWeight: 'bold',
    color: COLORS.textGray,
  },
  stepNumberActive: {
    color: COLORS.darkPink,
  },
  checkMark: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  connector: {
    width: 40,
    height: 3,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  connectorCompleted: {
    backgroundColor: COLORS.darkPink,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  stepLabel: {
    fontSize: 11,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
    flex: 1,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: COLORS.darkPink,
    fontWeight: 'bold',
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
    marginTop: 4,
  },
});
