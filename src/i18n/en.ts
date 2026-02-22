import type { Translations } from './nl';

const en: Translations = {
  // Tab bar
  tabs: {
    home: 'Home',
    history: 'History',
    statistics: 'Statistics',
    settings: 'Settings',
  },

  // Home screen
  home: {
    title: 'Alcohol Tracker',
    subtitle: 'Track your consumption',
    timerLabel: 'TIME SINCE LAST DRINK',
    dailyLimit: '🎯 Daily Limit',
    today: 'Today',
    caloriesTitle: '🔥 Calories today',
    caloriesAvg: (avg: number) => `Average ${avg} kcal per drink`,
    bacTitle: '🧪 BAC Estimate',
    bacSetupText: 'Set your weight and gender to see a BAC estimate.',
    bacSetupButton: 'Configure →',
    bacTrendRising: '↑ Rising',
    bacTrendDeclining: '↓ Declining',
    bacSoberIn: (time: string) => `Sober in ${time}`,
    bacSoberAgain: 'Sober again',
    bacDisclaimer: 'This is an estimate — do not use for driving decisions',
    logDrink: 'Log drink',
    logADrink: 'Log a drink',
    recentTitle: '🕐 Recent',
  },

  // History screen
  history: {
    title: 'History',
    subtitle: 'View your drinking pattern',
    today: 'Today',
    dayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    deleteDrinkTitle: 'Delete drink',
    deleteDrinkMessage: (drinkLabel: string) =>
      `Are you sure you want to delete this ${drinkLabel}?`,
    cancel: 'Cancel',
    delete: 'Delete',
    drinkSingular: 'drink',
    drinkPlural: 'drinks',
    noDrinks: 'No drinks on this day',
    noDrinksSubtext: 'Well done!',
  },

  // Statistics screen
  statistics: {
    title: 'Statistics',
    subtitle: 'Insight into your drinking pattern',
    loading: 'Loading...',
    avgPerWeek: 'Avg. per week',
    dryDaysStreak: 'Dry days in a row',
    longestStreak: 'Longest streak',
    dryDaysMonth: 'Dry days this month',
    caloriesThisWeek: 'Calories this week',
    avgCaloriesPerDrinkDay: 'Avg. kcal per drinking day',
    highestBacMonth: 'Highest BAC this month',
    avgBacPerDrinkDay: 'Avg. BAC per drinking day',
    weeklyOverview: '📅 Weekly overview',
    weeklySubtitle: 'Past 8 weeks',
    monthlyOverview: '📈 Monthly overview',
    monthlySubtitle: 'Past 6 months',
  },

  // Settings screen
  settings: {
    title: 'Settings',
    subtitle: 'Customize the app to your liking',
    dailyLimit: 'Daily Limit',
    dailyLimitDesc: 'Maximum number of drinks per day',
    profile: 'Profile',
    profileDesc: 'For BAC calculation',
    weightLabel: 'Weight (kg)',
    genderLabel: 'Gender',
    genderMale: 'Male',
    genderFemale: 'Female',
    genderOther: 'Other',
    waterReminder: 'Water Reminder',
    waterReminderToggle: 'Water reminder',
    waterReminderDesc: 'Remind me to drink water',
    waterReminderInterval: 'Remind me every',
    waterReminderDrinks: 'drinks',
    theme: 'Theme',
    themeDark: 'Dark',
    themeLight: 'Light',
    language: 'Language',
    languageNl: 'Nederlands',
    languageEn: 'English',
    notifications: 'Notifications',
    dailyReminder: 'Daily reminder',
    dailyReminderDesc: 'Remind me to log',
    limitWarning: 'Limit warning',
    limitWarningDesc: 'Warn me when I reach my limit',
    data: 'Data',
    exportCsv: 'Export as CSV',
    exportCsvDesc: 'Download all your data',
    importCsv: 'Import CSV',
    importCsvDesc: 'Restore from a backup',
    resetData: 'Delete all drinks',
    resetDataDesc: 'Remove all logged drinks',
    resetDataTitle: 'Delete all drinks',
    resetDataMessage: 'Are you sure you want to delete all logged drinks? This cannot be undone.',
    resetDataConfirm: 'Delete all',
    resetDataSuccess: 'Done',
    resetDataSuccessMsg: 'All drinks have been deleted.',
    // Tip Jar
    tipJar: {
      title: 'Support the Developer',
      description: 'Enjoying the app? A voluntary tip helps support ongoing development!',
      tipSmall: 'Small',
      tipMedium: 'Medium',
      tipLarge: 'Large',
      tipDisclaimer: 'Tips are voluntary and do not unlock any extra features.',
      thankYouTitle: 'Thank you!',
      thankYouMessage: 'Your support is truly appreciated!',
      purchaseError: 'Something went wrong with the purchase. Please try again later.',
    },
    aboutTitle: 'Alcohol Tracker v1.0.0',
    aboutText: 'All data is stored locally on your device. No account needed, no data collection.',
    // Alert strings
    exportNoData: 'No data',
    exportNoDataMsg: 'No drinks to export yet.',
    exportDialogTitle: 'Export drink data',
    error: 'Error',
    exportErrorMsg: 'Something went wrong while exporting.',
    importErrorNoData: 'The CSV file contains no data.',
    importErrorNoValid: 'No valid drinks found.',
    importErrorMsg: 'Something went wrong while importing.',
    importTitle: 'Import',
    importConfirm: (count: number) => `${count} drinks found. Do you want to import them?`,
    importCancel: 'Cancel',
    importButton: 'Import',
    importSuccess: 'Success',
    importSuccessMsg: (count: number) => `${count} drinks imported.`,
  },

  // Drink log modal
  modal: {
    title: 'Log a drink',
    subtitle: 'Tap a type to log',
    chooseSizeOpen: '▲ Choose size',
    chooseSizeClosed: '▼ Choose size',
    manualTimeOn: '⏰ Manual time on',
    manualTimeQuestion: '🕐 Add an earlier drink?',
    dateLabel: 'Date',
    timeLabel: 'Time',
    adding: 'Adding...',
    addButton: (emoji: string) => `${emoji} Add`,
    cancel: 'Cancel',
  },

  // Water reminder modal
  water: {
    title: 'Time for water! 💧',
    subtitle: "You've had a few drinks. Have a glass of water to stay hydrated.",
    logButton: 'Log a glass of water',
    skipButton: 'Skip',
    logged: (count: number) => count === 1 ? '1 glass today' : `${count} glasses today`,
  },

  // Components
  components: {
    waterBanner: 'Time for a glass of water!',
    progressOf: 'of',
    progressToday: 'today',
    progressLimitReached: 'Limit reached',
  },

  // Drink labels
  drinks: {
    labels: {
      beer: 'Beer',
      beer_fluitje: 'Small glass',
      beer_vaasje: 'Medium glass',
      beer_pint: 'Pint',
      beer_blikje: 'Can',
      wine: 'Wine',
      spirits: 'Spirits',
      cocktail: 'Cocktail',
      other: 'Other',
    },
    beerDescriptions: {
      beer_fluitje: '~180ml',
      beer_vaasje: '~250ml',
      beer_pint: '~500ml',
      beer_blikje: '~330ml',
    },
  },

  // Utility strings
  utils: {
    sober: 'Sober',
    hourAbbrev: 'h',
    hourWord: 'hours',
    dayWord: 'day',
    daysWord: 'days',
    noDrinksLogged: 'No drinks logged yet',
  },

  // Notifications
  notifications: {
    waterTitle: '💧 Water time!',
    waterBody: 'Have a glass of water before you continue.',
  },
};

export default en;
