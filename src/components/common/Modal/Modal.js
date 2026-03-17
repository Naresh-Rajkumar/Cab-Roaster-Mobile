import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeProvider';
import spacing from '../../../theme/spacing.json';
import typography from '../../../theme/typography.json';

const Modal = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  animationType = 'slide',
  size = 'md',
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const getMaxHeight = () => {
    switch (size) {
      case 'sm':
        return '40%';
      case 'lg':
        return '90%';
      case 'full':
        return '100%';
      default:
        return '65%';
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={[
                styles.content,
                {
                  backgroundColor: colors.surface,
                  maxHeight: getMaxHeight(),
                },
              ]}
            >
              {(title || showCloseButton) && (
                <View
                  style={[
                    styles.header,
                    { borderBottomColor: colors.divider },
                  ]}
                >
                  <Text
                    style={[
                      styles.title,
                      {
                        color: colors.text,
                        fontFamily: typography.fontFamily.semiBold,
                      },
                    ]}
                  >
                    {title}
                  </Text>
                  {showCloseButton && (
                    <TouchableOpacity
                      onPress={onClose}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name="close"
                        size={spacing.iconSize.lg}
                        color={colors.icon}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              <View style={styles.body}>{children}</View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: spacing.borderRadius.xl,
    borderTopRightRadius: spacing.borderRadius.xl,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    flex: 1,
  },
  body: {
    padding: spacing.base,
  },
});

export default React.memo(Modal);
