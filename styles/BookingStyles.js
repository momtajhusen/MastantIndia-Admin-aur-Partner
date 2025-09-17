// styles/BookingStyles.js
import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export const BookingStyles = StyleSheet.create({
  // ===================================
  // CONTAINER & LAYOUT STYLES
  // ===================================
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },

  // ===================================
  // HEADER STYLES
  // ===================================
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSpacer: {
    width: 24,
  },

  // ===================================
  // TAB NAVIGATION STYLES
  // ===================================
  tabContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#f3e5f5',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#6200ea',
    fontWeight: '600',
  },
  tabBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // ===================================
  // BOOKING CARD STYLES
  // ===================================
  listContainer: {
    padding: 15,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  manufacturerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  cardContent: {
    gap: 8,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },

  // ===================================
  // STATUS BADGE STYLES
  // ===================================
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  bookingId: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },

  // ===================================
  // ACTION BUTTON STYLES
  // ===================================
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionSection: {
    padding: 20,
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ===================================
  // EMPTY STATE STYLES
  // ===================================
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },

  // ===================================
  // MODAL STYLES
  // ===================================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },

  // ===================================
  // QR CODE STYLES
  // ===================================
  qrContainer: {
    alignItems: 'center',
  },
  qrCodeBox: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6200ea',
    marginBottom: 16,
  },
  qrCodeText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#6200ea',
    fontWeight: 'bold',
  },
  qrInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  qrActions: {
    flexDirection: 'row',
    gap: 12,
  },
  qrActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6200ea',
    gap: 6,
  },
  qrActionText: {
    color: '#6200ea',
    fontSize: 14,
    fontWeight: '600',
  },

  // ===================================
  // DETAILS SECTION STYLES
  // ===================================
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },

  // ===================================
  // CLIENT INFO STYLES
  // ===================================
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6200ea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clientInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  clientCategory: {
    fontSize: 14,
    color: '#666',
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3e5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ===================================
  // DETAILS GRID STYLES
  // ===================================
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    marginBottom: 2,
  },
  detailPrice: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  navigateText: {
    fontSize: 14,
    color: '#6200ea',
    fontWeight: '600',
    marginTop: 4,
  },

  // ===================================
  // WORK DESCRIPTION STYLES
  // ===================================
  workDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },

  // ===================================
  // UTILITY STYLES
  // ===================================
  spacer: {
    height: 50,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  centerText: {
    textAlign: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
  
  // ===================================
  // RESPONSIVE STYLES
  // ===================================
  responsiveContainer: {
    width: screenWidth > 768 ? '80%' : '100%',
    alignSelf: 'center',
  },
  
  // ===================================
  // ANIMATION STYLES (for future use)
  // ===================================
  fadeIn: {
    opacity: 1,
  },
  fadeOut: {
    opacity: 0.5,
  },
  scaleUp: {
    transform: [{ scale: 1.05 }],
  },
  scaleDown: {
    transform: [{ scale: 0.95 }],
  },
});

// ===================================
// COLOR CONSTANTS
// ===================================
export const BookingColors = {
  primary: '#6200ea',
  primaryLight: '#f3e5f5',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  pending: '#FFC107',
  
  // Text Colors
  textPrimary: '#000',
  textSecondary: '#666',
  textMuted: '#999',
  textWhite: '#fff',
  
  // Background Colors
  background: '#f8f9fa',
  cardBackground: '#fff',
  modalOverlay: 'rgba(0,0,0,0.5)',
  
  // Border Colors
  border: '#eee',
  borderLight: '#f0f0f0',
  
  // Status Colors
  statusPending: '#FFC107',
  statusConfirmed: '#2196F3',
  statusInProgress: '#FF9800',
  statusCompleted: '#4CAF50',
  statusCancelled: '#F44336',
};

// ===================================
// TYPOGRAPHY CONSTANTS
// ===================================
export const BookingTypography = {
  // Font Sizes
  xs: 10,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  
  // Font Weights
  normal: 'normal',
  medium: '500',
  semiBold: '600',
  bold: 'bold',
  
  // Line Heights
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
};

// ===================================
// SPACING CONSTANTS
// ===================================
export const BookingSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// ===================================
// BORDER RADIUS CONSTANTS
// ===================================
export const BookingBorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
};

// ===================================
// SHADOW STYLES
// ===================================
export const BookingShadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

// ===================================
// EXPORT DEFAULT
// ===================================
export default {
  BookingStyles,
  BookingColors,
  BookingTypography,
  BookingSpacing,
  BookingBorderRadius,
  BookingShadows,
};