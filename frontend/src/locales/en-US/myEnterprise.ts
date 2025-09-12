export const myEnterprise = {
  // Page title and description
  title: 'My Enterprise',
  description: 'Manage your enterprise information, members and departments',
  
  // Overview page
  overview: {
    basicInfo: 'Basic Information',
    detailedInfo: 'Detailed Information',
    emailSuffix: 'Email Suffix',
    creditCode: 'Credit Code',
    memberCount: 'Member Count',
    description: 'Description',
    address: 'Address',
    industry: 'Industry',
    enterpriseMembers: 'Enterprise Members',
    departmentCount: 'Department Count',
    messageCount: 'Message Count'
  },
  
  // Tabs
  tabs: {
    overview: 'Overview',
    members: 'Members',
    departments: 'Departments',
    messages: 'Messages'
  },
  
  // Enterprise information
  enterpriseInfo: {
    title: 'Enterprise Information',
    name: 'Enterprise Name',
    emailSuffix: 'Email Suffix',
    creditCode: 'Credit Code',
    description: 'Description',
    address: 'Address',
    phone: 'Phone',
    website: 'Website',
    industry: 'Industry',
    size: 'Size',
    status: 'Status',
    maxMembers: 'Max Members',
    currentMembers: 'Current Members',
    edit: 'Edit Enterprise Info',
    save: 'Save',
    cancel: 'Cancel',
    enterprise: 'Enterprise',
    managementCenter: 'Enterprise Management Center',
    me: 'Me',
    currentUser: 'Current User',
    unknownUser: 'Unknown User',
    unknownTime: 'Unknown Time',
    error: 'Error'
  },
  
  // Member management
  memberManagement: {
    title: 'Member Management',
    totalMembers: 'Total Members',
    onlineMembers: 'Online Members',
    pendingInvites: 'Pending Invites',
    addMember: 'Add Member',
    inviteMember: 'Invite Member',
    memberList: 'Member List',
    name: 'Name',
    email: 'Email',
    role: 'Role',
    department: 'Department',
    status: 'Status',
    lastActive: 'Last Active',
    actions: 'Actions',
    edit: 'Edit',
    remove: 'Remove',
    promote: 'Promote',
    demote: 'Demote',
    noMembers: 'No members',
    loading: 'Loading members...',
    searchPlaceholder: 'Search member name, email or department...',
    allDepartments: 'All Departments',
    lastLogin: 'Last Login',
    neverLoggedIn: 'Never Logged In',
    memberNotFound: 'Member Not Found',
    updateSuccess: 'Update Success',
    updateSuccessMessage: 'Member information updated successfully',
    updateFailed: 'Update Failed',
    editMemberPosition: 'Edit Member Position',
    memberName: 'Member Name',
    enterpriseRole: 'Enterprise Role',
    positionDescription: 'Position Description',
    positionDescriptionPlaceholder: 'Please enter position description (optional)',
    noDepartment: 'No Department',
    adminCannotEditOtherAdmin: 'Admins cannot modify other admins\' departments',
    saving: 'Saving...',
    save: 'Save'
  },
  
  // Department management
  departmentManagement: {
    title: 'Department Management',
    addDepartment: 'Add Department',
    departmentName: 'Department Name',
    departmentDescription: 'Description',
    departmentHead: 'Department Head',
    memberCount: 'Member Count',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    noDepartments: 'No departments',
    loading: 'Loading departments...',
    create: 'Create',
    update: 'Update',
    confirmDelete: 'Confirm Delete',
    deleteConfirmMessage: 'Are you sure you want to delete this department? This action cannot be undone.',
    createSuccess: 'Create Success',
    createSuccessMessage: 'Department created successfully',
    createFailed: 'Create Failed',
    updateSuccess: 'Update Success',
    updateSuccessMessage: 'Department information updated successfully',
    updateFailed: 'Update Failed',
    deleteSuccess: 'Delete Success',
    deleteSuccessMessage: 'Department deleted successfully',
    deleteFailed: 'Delete Failed',
    createDepartment: 'Create Department',
    editDepartment: 'Edit Department',
    departmentCode: 'Department Code',
    departmentNamePlaceholder: 'Please enter department name',
    departmentCodePlaceholder: 'Please enter department code',
    departmentDescriptionPlaceholder: 'Please enter department description (optional)',
    unnamedDepartment: 'Unnamed Department',
    unknownDepartment: 'Unknown Department'
  },
  
  // Message system
  messageSystem: {
    title: 'Enterprise Messages',
    sendMessage: 'Send Message',
    messageContent: 'Message Content',
    selectDepartment: 'Select Department',
    selectRecipient: 'Select Recipient',
    send: 'Send',
    cancel: 'Cancel',
    noMessages: 'No messages',
    loading: 'Loading messages...',
    reply: 'Reply',
    expandReplies: 'Expand Replies',
    collapseReplies: 'Collapse Replies',
    inputError: 'Input Error',
    contentRequired: 'Please enter message content',
    departmentRequired: 'Please select department',
    recipientRequired: 'Please select message recipient',
    cannotSendToSelf: 'Cannot send message to yourself',
    sendSuccess: 'Send Success',
    sendSuccessMessage: 'Message sent successfully',
    sendFailed: 'Send Failed',
    noContent: 'No Content',
    read: 'Read',
    readBy: 'Read By',
    replyPlaceholder: 'Enter reply content...',
    expandRepliesWithCount: 'Expand Replies ({count})',
    replyContentRequired: 'Please enter reply content',
    replySuccessMessage: 'Reply sent successfully',
    replyFailed: 'Reply Failed',
    deleteSuccess: 'Delete Success',
    deleteSuccessMessage: 'Message deleted successfully',
    deleteFailed: 'Delete Failed',
    messageType: 'Message Type',
    selectMessageType: 'Select Message Type',
    selectDepartmentPlaceholder: 'Please select department',
    selectRecipientPlaceholder: 'Select recipients (multiple)',
    messageContentPlaceholder: 'Please enter message content',
    messageContentHelp: 'Please enter your message content',
    selectAllMembers: 'Select All Members',
    selectAdmins: 'Select Admins',
    clearSelection: 'Clear Selection',
    selectedRecipients: 'Selected {count} recipients',
    multiSelectHelp: 'You can select multiple users as recipients, with quick selection support',
    sendToAllMembers: 'Send to All Members',
    deleteMessage: 'Delete Message',
    deleteMessageConfirm: 'Are you sure you want to delete this message? This action cannot be undone.',
    deleteMessageLoading: 'Deleting...'
  },
  
  // Roles and permissions
  roles: {
    owner: 'Owner',
    admin: 'Administrator',
    collaborator: 'Collaborator',
    viewer: 'Viewer',
    superAdmin: 'Super Admin',
    member: 'Member',
    unknown: 'Unknown'
  },
  
  // Message types
  messageTypes: {
    general: 'General Message',
    announcement: 'Announcement',
    department: 'Department Message',
    group: 'Group Message',
    unknown: 'Unknown Type'
  },
  
  // Statuses
  statuses: {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    suspended: 'Suspended'
  },
  
  // Action buttons
  actions: {
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    refresh: 'Refresh',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    export: 'Export',
    import: 'Import',
    update: 'Update',
    transfer: 'Transfer',
    send: 'Send',
    retry: 'Retry',
    transferSuperAdmin: 'Transfer Super Admin Role',
    deleteMessage: 'Delete Message',
    deleteReply: 'Delete Reply',
    transferSuperAdminTitle: 'Transfer Super Admin Role',
    importantNotice: 'Important Notice',
    transferWarning: 'After transferring the super admin role, you will be demoted to a regular member and lose all administrative privileges. This action cannot be undone, please proceed with caution.',
    selectNewSuperAdmin: 'Select New Super Admin',
    selectNewSuperAdminPlaceholder: 'Please select new super admin',
    confirmTransfer: 'Confirm Transfer'
  },
  
  // Error messages
  errors: {
    fetchEnterpriseFailed: 'Failed to fetch enterprise information',
    fetchMembersFailed: 'Failed to fetch member list',
    fetchDepartmentsFailed: 'Failed to fetch department list',
    fetchMessagesFailed: 'Failed to fetch message list',
    unknownError: 'Unknown error',
    loadFailed: 'Load Failed',
    notJoined: 'Not Joined Enterprise',
    notJoinedMessage: 'You have not joined any enterprise',
    insufficientPermissions: 'Insufficient Permissions',
    superAdminCannotEdit: 'Super admin role cannot be modified through this interface, please use role transfer function',
    fetchFailed: 'Fetch Failed',
    memberInfoNotFound: 'Unable to get member information, please refresh the page and try again'
  },
  
  // Loading states
  loading: {
    title: 'Loading Enterprise Information',
    description: 'Connecting to enterprise services, please wait...',
    loadingMembers: 'Loading members...',
    loadingDepartments: 'Loading departments...',
    loadingMessages: 'Loading messages...'
  },
  
  // Form validation
  validation: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number',
    url: 'Please enter a valid URL',
    minLength: 'Minimum {min} characters required',
    maxLength: 'Maximum {max} characters allowed'
  }
};
