import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * RiskFlag Component
 * Visual representation of risk level using flag colors
 */
const RiskFlag = ({ flagColor, size = 'medium', showLabel = true, animated = false }) => {
  /**
   * Get flag emoji based on color
   */
  const getFlagEmoji = () => {
    switch (flagColor) {
      case 'green':
        return '🟢';
      case 'yellow':
        return '🟡';
      case 'red':
        return '🔴';
      default:
        return '⚪';
    }
  };

  /**
   * Get risk level text
   */
  const getRiskLevelText = () => {
    switch (flagColor) {
      case 'green':
        return 'Low Risk';
      case 'yellow':
        return 'Medium Risk';
      case 'red':
        return 'High Risk';
      default:
        return 'Unknown';
    }
  };

  /**
   * Get flag description
   */
  const getFlagDescription = () => {
    switch (flagColor) {
      case 'green':
        return 'Safe conditions for most surfers';
      case 'yellow':
        return 'Caution advised - Check conditions';
      case 'red':
        return 'Dangerous conditions - Avoid surfing';
      default:
        return 'No data available';
    }
  };

  /**
   * Get background color with opacity
   */
  const getBackgroundColor = () => {
    switch (flagColor) {
      case 'green':
        return '#d1fae5';
      case 'yellow':
        return '#fef3c7';
      case 'red':
        return '#fee2e2';
      default:
        return '#f3f4f6';
    }
  };

  /**
   * Get border color
   */
  const getBorderColor = () => {
    switch (flagColor) {
      case 'green':
        return '#10b981';
      case 'yellow':
        return '#f59e0b';
      case 'red':
        return '#ef4444';
      default:
        return '#9ca3af';
    }
  };

  /**
   * Get text color
   */
  const getTextColor = () => {
    switch (flagColor) {
      case 'green':
        return '#065f46';
      case 'yellow':
        return '#92400e';
      case 'red':
        return '#991b1b';
      default:
        return '#4b5563';
    }
  };

  /**
   * Get size-specific styles
   */
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.containerSmall,
          emoji: styles.emojiSmall,
          text: styles.textSmall,
        };
      case 'large':
        return {
          container: styles.containerLarge,
          emoji: styles.emojiLarge,
          text: styles.textLarge,
        };
      default: // medium
        return {
          container: styles.containerMedium,
          emoji: styles.emojiMedium,
          text: styles.textMedium,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.container,
        sizeStyles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
      ]}
    >
      {/* Flag Emoji */}
      <Text style={[styles.emoji, sizeStyles.emoji]}>{getFlagEmoji()}</Text>

      {/* Risk Level Label */}
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.text, sizeStyles.text, { color: getTextColor() }]}>
            {getRiskLevelText()}
          </Text>
          {size === 'large' && (
            <Text style={[styles.description, { color: getTextColor() }]}>
              {getFlagDescription()}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  containerSmall: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  containerMedium: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  containerLarge: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  emoji: {
    marginRight: 6,
  },
  emojiSmall: {
    fontSize: 16,
  },
  emojiMedium: {
    fontSize: 20,
  },
  emojiLarge: {
    fontSize: 32,
    marginBottom: 8,
    marginRight: 0,
  },
  labelContainer: {
    flex: 1,
  },
  text: {
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 11,
  },
  textMedium: {
    fontSize: 13,
  },
  textLarge: {
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
});

export default RiskFlag;