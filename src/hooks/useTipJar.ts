import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { notificationAsync, NotificationFeedbackType } from '../utils/haptics';
import { TIPS_OFFERING_ID } from '../constants/purchases';
import { useTranslation } from '../context/LanguageContext';

export interface TipPackage {
  identifier: string;
  localizedPrice: string;
  rcPackage: any;
}

export function useTipJar() {
  const { t } = useTranslation();
  const [isAvailable, setIsAvailable] = useState(false);
  const [packages, setPackages] = useState<TipPackage[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const thankYouTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadOfferings();
    return () => {
      if (thankYouTimer.current) clearTimeout(thankYouTimer.current);
    };
  }, []);

  const loadOfferings = async () => {
    // Purchases not available on web
    if (Platform.OS === 'web') {
      setIsAvailable(false);
      return;
    }

    try {
      const Purchases = require('react-native-purchases').default;
      const offerings = await Purchases.getOfferings();
      const tipsOffering = offerings.all[TIPS_OFFERING_ID];

      if (tipsOffering && tipsOffering.availablePackages.length > 0) {
        const mapped = tipsOffering.availablePackages.map((pkg: any) => ({
          identifier: pkg.identifier,
          localizedPrice: pkg.product.priceString,
          rcPackage: pkg,
        }));
        setPackages(mapped);
        setIsAvailable(true);
      }
    } catch {
      // RevenueCat not configured or running in simulator — tip jar stays hidden
      setIsAvailable(false);
    }
  };

  const purchaseTip = useCallback(async (pkg: TipPackage) => {
    if (isPurchasing || Platform.OS === 'web') return;
    setIsPurchasing(true);

    try {
      const Purchases = require('react-native-purchases').default;
      await Purchases.purchasePackage(pkg.rcPackage);

      // Success!
      notificationAsync(NotificationFeedbackType.Success);
      setShowThankYou(true);
      thankYouTimer.current = setTimeout(() => {
        setShowThankYou(false);
      }, 3000);
    } catch (e: any) {
      // User cancelled — not an error
      if (e.userCancelled) {
        // Do nothing
      } else {
        Alert.alert(t.settings.tipJar.thankYouTitle, t.settings.tipJar.purchaseError);
      }
    } finally {
      setIsPurchasing(false);
    }
  }, [isPurchasing, t]);

  return {
    isAvailable,
    packages,
    isPurchasing,
    showThankYou,
    purchaseTip,
  };
}
