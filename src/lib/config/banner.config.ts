export type BannerPosition = 'bottom' | 'bottom-with-tabs' | 'center' | 'top';

export interface BannerConfig {
  // Which routes should show this banner
  routes: string[];
  // Position of the banner
  position: BannerPosition;
  // Whether to show backdrop
  showBackdrop: boolean;
  // Whether banner can be dismissed
  dismissible: boolean;
  // Whether banner should be persistent (stays fixed)
  persistent: boolean;
  // Whether to show close button
  showCloseButton: boolean;
  // Custom styles for the banner container
  containerClassName?: string;
}

export const defaultBannerConfig: BannerConfig = {
  routes: [],
  position: 'bottom',
  showBackdrop: true,
  dismissible: true,
  persistent: false,
  showCloseButton: true,
};
