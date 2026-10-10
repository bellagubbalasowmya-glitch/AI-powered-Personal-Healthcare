import type { SupportedLanguage } from '../types/health'

export interface TranslationDictionary {
  appName: string
  tagline: string
  demoBadge: string
  navOverview: string
  navRecords: string
  navSummary: string
  navExplainer: string
  navTimeline: string
  navReminders: string
  navVitals: string
  navAppointments: string
  navWellnessTracker: string
  navEmergency: string
  navCopilot: string
  navUnknownAlert: string
  navSettings: string
  privacyNote: string
  searchPlaceholder: string
  demoPatient: string
  notifications: string
  welcomeHeading: string
  welcomeSub: string
  uploadReport: string
  viewTimeline: string
  askCopilot: string
  recordsCount: string
  recentReportsCount: string
  activeMedicationsCount: string
  wellnessSourcesCount: string
  saveChanges: string
  cancel: string
  close: string
  filterAll: string
  searchRecords: string
  simulatedDataDisclaimer: string
  languageLabel: string
  languageNotice: string
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    appName: 'HealthTwin AI',
    tagline: 'Your Health, Connected and Understood.',
    demoBadge: 'DEMO MODE — SYNTHETIC DATA',
    navOverview: 'Dashboard',
    navRecords: 'Medical Records',
    navSummary: 'AI Health Summary',
    navExplainer: 'AI Report Explainer',
    navTimeline: 'Health Timeline',
    navReminders: 'Medicine Reminder',
    navVitals: 'Vitals Monitoring',
    navAppointments: 'Appointments',
    navWellnessTracker: 'Wellness Tracker',
    navEmergency: 'Emergency Health Card',
    navCopilot: 'Ask Health Copilot',
    navUnknownAlert: 'Unknown-Condition Alert',
    navSettings: 'Settings',
    privacyNote: 'Your health information deserves privacy.',
    searchPlaceholder: 'Search demo records, vitals, medicines, or doctors...',
    demoPatient: 'Demo Patient',
    notifications: 'Notifications',
    welcomeHeading: 'Your Health, All in One Place',
    welcomeSub:
      'Understand your records, explore wellness trends, and stay informed about your healthcare journey.',
    uploadReport: 'Upload a Report',
    viewTimeline: 'View Health Timeline',
    askCopilot: 'Ask Copilot',
    recordsCount: 'Medical Records',
    recentReportsCount: 'Recent Reports',
    activeMedicationsCount: 'Active Medication Records',
    wellnessSourcesCount: 'Wellness Data Sources',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    close: 'Close',
    filterAll: 'All Categories',
    searchRecords: 'Search records...',
    simulatedDataDisclaimer: 'Simulated Data — Not Connected to a Real Device',
    languageLabel: 'Preferred Language',
    languageNotice:
      'UI labels are localized in Telugu for core navigation. Detailed clinical reports remain in source English.',
  },
  te: {
    appName: 'హెల్త్‌ట్విన్ AI',
    tagline: 'మీ ఆరోగ్యం, అనుసంధానిత మరియు స్పష్టమైన అవగాహన.',
    demoBadge: 'డెమో మోడ్ — సింథటిక్ డేటా',
    navOverview: 'డ్యాష్‌బోర్డ్ (Dashboard)',
    navRecords: 'వైద్య రికార్డులు (Records)',
    navSummary: 'AI ఆరోగ్య నివేదిక (Summary)',
    navExplainer: 'AI రిపోర్ట్ వివరణ (Explainer)',
    navTimeline: 'ఆరోగ్య కాలక్రమం (Timeline)',
    navReminders: 'మందుల రిమైండర్ (Reminders)',
    navVitals: 'వైటల్స్ మానిటరింగ్ (Vitals)',
    navAppointments: 'అపాయింట్‌మెంట్లు (Appointments)',
    navWellnessTracker: 'వెల్‌నెస్ ట్రాకర్ (Wellness)',
    navEmergency: 'ఎమర్జెన్సీ కార్డ్ (Emergency)',
    navCopilot: 'హెల్త్ కోపైలట్ (Ask Copilot)',
    navUnknownAlert: 'అస్పష్ట స్థితి హెచ్చరిక (Alerts)',
    navSettings: 'సెట్టింగ్‌లు (Settings)',
    privacyNote: 'మీ ఆరోగ్య సమాచారానికి సంపూర్ణ గోప్యత అవసరం.',
    searchPlaceholder: 'రికార్డులు, వైటల్స్, మందులను శోధించండి...',
    demoPatient: 'డెమో పేషెంట్',
    notifications: 'నోటిఫికేషన్లు',
    welcomeHeading: 'మీ సమగ్ర ఆరోగ్యం, ఒకే వేదికపై',
    welcomeSub:
      'మీ వైద్య రికార్డులను సులభంగా అర్థం చేసుకోండి మరియు వెల్‌నెస్ వివరాలను పరిశీలించండి.',
    uploadReport: 'రిపోర్ట్ అప్‌లోడ్ చేయండి',
    viewTimeline: 'కాలక్రమం చూడండి',
    askCopilot: 'కోపైలట్‌ని అడగండి',
    recordsCount: 'వైద్య రికార్డులు',
    recentReportsCount: 'ఇటీవలి నివేదికలు',
    activeMedicationsCount: 'ప్రస్తుత ఔషధాలు',
    wellnessSourcesCount: 'వెల్‌నెస్ మూలాలు',
    saveChanges: 'మార్పులను భద్రపరుచు',
    cancel: 'రద్దు చేయి',
    close: 'మూసివేయి',
    filterAll: 'అన్ని విభాగాలు',
    searchRecords: 'రికార్డులను శోధించండి...',
    simulatedDataDisclaimer: 'సిమ్యులేటెడ్ డేటా — వాస్తవ పరికరంతో అనుసంధానించబడలేదు',
    languageLabel: 'ప్రాధాన్య భాష (Language)',
    languageNotice:
      'గమనిక: ప్రధాన మెనూ అంశాలు తెలుగులో ఉన్నాయి. వైద్య రిపోర్టుల మూలపాఠ్యం ఇంగ్లీషులోనే ఉంటుంది.',
  },
}
