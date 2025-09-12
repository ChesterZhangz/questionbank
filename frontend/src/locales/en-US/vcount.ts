const vcount = {
  // Recharge page
  recharge: {
    title: 'VCount Recharge',
    subtitle: 'Recharge VCount virtual currency for your account',
    formTitle: 'Recharge Information',
    presetAmounts: 'Quick Amount Selection',
    customAmount: 'Custom Amount',
    amountPlaceholder: 'Enter recharge amount',
    amountHint: 'Amount range: 0.01 - 10,000 V',
    description: 'Recharge Description',
    descriptionPlaceholder: 'Enter recharge description (optional)',
    confirmRecharge: 'Confirm Recharge',
    processing: 'Processing...',
    noteTitle: 'Recharge Notes',
    note1: 'VCount will be credited immediately after successful recharge',
    note2: 'VCount can be used to purchase question banks, papers and other resources',
    note3: 'Contact administrator if you have any questions',
    securityTitle: 'Security Notice',
    securityNote: 'Please ensure you are in a secure network environment when recharging. Avoid operating on public networks or untrusted devices.',
    action: 'Action'
  },

  // Management page
  management: {
    title: 'VCount Management',
    subtitle: 'Manage VCount information for all users in the system',
    totalUsers: 'Total Users',
    totalBalance: 'Total Balance',
    totalRecharged: 'Total Recharged',
    totalSpent: 'Total Spent',
    averageBalance: 'Average Balance',
    searchPlaceholder: 'Search by name, email or role',
    sortByBalance: 'Sort by Balance',
    sortByRecharged: 'Sort by Recharged',
    sortBySpent: 'Sort by Spent',
    sortByCreated: 'Sort by Created',
    userList: 'User List',
    users: 'users',
    user: 'User',
    role: 'Role',
    balance: 'Balance',
    recharged: 'Recharged',
    spent: 'Spent',
    transactions: 'Transactions',
    page: 'Page',
    export: 'Export Data',
    exportSuccess: 'Data exported successfully',
    accessDenied: 'Access Denied',
    accessDeniedMessage: 'Only administrators can access this page',
    userDetail: 'User Details',
    userInfo: 'User Information',
    vcountInfo: 'VCount Information',
    action: 'Action'

  },

  // Common VCount related
  currentBalance: 'Current Balance',
  totalRecharged: 'Total Recharged',
  totalSpent: 'Total Spent',
  transactionCount: 'Transaction Count',
  loadFailed: 'Load Failed',
  rechargeVCount: 'Recharge VCount',
  defaultDescription: 'User Recharge',

  // Success messages
  success: {
    rechargeSuccess: 'Recharge successful! VCount credited',
    rechargeSuccessMessage: 'Your VCount balance has been updated and is ready to use!'
  },

  // Error messages
  errors: {
    invalidAmount: 'Please enter a valid recharge amount',
    amountTooLarge: 'Recharge amount cannot exceed 10,000 V',
    rechargeFailed: 'Recharge failed, please try again later',
    loadFailed: 'Load failed, please refresh and try again',
    accessDenied: 'Insufficient permissions to access this feature',
    noPaymentMethod: 'Please bind a payment method first',
    noPaymentMethodDesc: 'You need to bind a bank card or Alipay before recharging',
    systemNotReady: 'Recharge system is not yet developed',
    systemNotReadyDesc: 'Recharge functionality is under development, stay tuned'
  }
};

export default vcount;
