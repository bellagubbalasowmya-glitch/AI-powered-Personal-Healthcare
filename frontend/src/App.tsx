import { useState, useEffect } from 'react'
import { Activity } from 'lucide-react'
import { Sidebar } from './components/layout/Sidebar'
import type { NavPage } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { ToastContainer } from './components/common/Toast'
import type { ToastItem } from './components/common/Toast'
import { Dashboard } from './pages/Dashboard'
import { MedicalRecords } from './pages/MedicalRecords'
import { HealthSummary } from './pages/HealthSummary'
import { HealthTimeline } from './pages/HealthTimeline'
import { HealthCopilot } from './pages/HealthCopilot'
import { Settings } from './pages/Settings'

// Authentication
import { AuthProvider, useAuth } from './context/AuthContext'
import { AuthPage } from './pages/Auth/AuthPage'

// 7 New Healthcare Modules
import { MedicineReminderPage } from './pages/MedicineReminder'
import { VitalsMonitoringPage } from './pages/VitalsMonitoring'
import { ReportExplainerPage } from './pages/ReportExplainer'
import { AppointmentsManagerPage } from './pages/AppointmentsManager'
import { EmergencyCardPage } from './pages/EmergencyCard'
import { WellnessTrackerPage } from './pages/WellnessTracker'
import { UnknownConditionAlertPage } from './pages/UnknownConditionAlert'

// API Service
import { api } from './services/api'

import { EMPTY_EMERGENCY_CARD } from './services/api'
import { INITIAL_MOCK_RECORDS } from './data/mockRecords'


// Types
import type {
  MedicalRecord,
  TimelineEvent,
  SupportedLanguage,
  MedicineReminder,
  VitalMeasurement,
  ReportExplainerDocument,
  DoctorAppointment,
  EmergencyCardInfo,
  DailyWellnessEntry,
  UnknownConditionAlertItem,
} from './types/health'

function AppContent() {
  const { user, profile, isLoading: isAuthLoading } = useAuth()
  const [currentPage, setCurrentPage] = useState<NavPage>('overview')
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en')
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [activeDrawerRecord, setActiveDrawerRecord] = useState<MedicalRecord | null>(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false)
  const [toasts, setToasts] = useState<ToastItem[]>([])

  // State for the 7 new healthcare modules
  const [reminders, setReminders] = useState<MedicineReminder[]>([])
  const [vitals, setVitals] = useState<VitalMeasurement[]>([])
  const [explainerDocs, setExplainerDocs] = useState<ReportExplainerDocument[]>([])
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([])
  const [emergencyCard, setEmergencyCard] = useState<EmergencyCardInfo>({
    ...EMPTY_EMERGENCY_CARD,
    patientName: profile?.full_name || user?.user_metadata?.full_name || '',
    patientId: profile?.patient_id || '',
  })
  const [wellnessLogs, setWellnessLogs] = useState<DailyWellnessEntry[]>([])
  const [unknownAlerts, setUnknownAlerts] = useState<UnknownConditionAlertItem[]>([])

  // API connectivity & loading state
  const [isBackendLive, setIsBackendLive] = useState<boolean>(true)
  const [isInitialSyncing, setIsInitialSyncing] = useState<boolean>(true)

  const addToast = (
    title: string,
    message?: string,
    type: 'success' | 'warning' | 'info' | 'error' = 'info'
  ) => {
    const id = `toast-${Date.now()}`
    const newToast: ToastItem = { id, title, message, type }
    setToasts((prev) => [...prev, newToast])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Load live data from Express Backend on mount
  useEffect(() => {
    let isMounted = true

    const syncWithBackend = async () => {
      try {
        const health = await api.checkHealth()
        if (isMounted) setIsBackendLive(health.isLive)

        const [
          recRes,
          timeRes,
          remRes,
          vitRes,
          aptRes,
          wellRes,
          emRes,
          expRes,
          altRes,
        ] = await Promise.all([
          api.getRecords(),
          api.getTimeline(),
          api.getReminders(),
          api.getVitals(),
          api.getAppointments(),
          api.getWellnessLogs(),
          api.getEmergencyCard(),
          api.getExplainerDocs(),
          api.getUnknownAlerts(),
        ])

        if (!isMounted) return

        if (recRes.data && recRes.data.length > 0) {
          setRecords(recRes.data)
        } else {
          setRecords(INITIAL_MOCK_RECORDS)
        }

        if (timeRes.data) setTimelineEvents(timeRes.data)
        if (remRes.data) setReminders(remRes.data)
        if (vitRes.data) setVitals(vitRes.data)
        if (aptRes.data) setAppointments(aptRes.data)
        if (wellRes.data) setWellnessLogs(wellRes.data)
        if (emRes.data && emRes.data.patientName) setEmergencyCard(emRes.data)
        if (expRes.data) setExplainerDocs(expRes.data)
        if (altRes.data) setUnknownAlerts(altRes.data)

        if (health.isLive) {
          addToast('Connected to Backend API', 'Express REST service active on port 5000.', 'success')
        }
      } catch (err: any) {
        console.warn('[Sync] Using fallback data store:', err.message)
      } finally {
        if (isMounted) setIsInitialSyncing(false)
      }
    }

    syncWithBackend()
    return () => {
      isMounted = false
    }
  }, [])

  // Medical Records handlers
  const handleAddRecord = (newRecord: MedicalRecord) => {
    setRecords((prev) => [newRecord, ...prev])

    const newTimelineEvent: TimelineEvent = {
      id: `evt-${Date.now()}`,
      title: `${newRecord.name} Uploaded`,
      eventType: newRecord.category,
      date: newRecord.recordDate,
      source: newRecord.facility,
      description: newRecord.summary || `Medical report analyzed.`,
      relatedRecordId: newRecord.id,
      tags: ['Uploaded Document', newRecord.processingStatus || 'Processed'],
      severity: 'neutral',
    }
    setTimelineEvents((prev) => [newTimelineEvent, ...prev])

    addToast(
      'Document Analyzed & Saved',
      `"${newRecord.name}" processed and synchronized with digital twin records.`,
      'success'
    )
  }


  const handleUpdateRecord = (updatedRecord: MedicalRecord) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
    )
    api.updateRecord(updatedRecord.id, updatedRecord).catch((err) => console.warn('Record update error:', err.message))
    addToast(
      'Changes Saved',
      `Updated fields for "${updatedRecord.name}".`,
      'success'
    )
  }

  const handleDeleteRecord = (id: string) => {
    const recToDelete = records.find((r) => r.id === id)
    setRecords((prev) => prev.filter((r) => r.id !== id))
    api.deleteRecord(id).catch((err) => console.warn('Record delete error:', err.message))
    addToast(
      'Record Removed',
      `"${recToDelete?.name || 'Document'}" removed.`,
      'info'
    )
  }

  const handleSelectEvent = (event: TimelineEvent) => {
    if (event.relatedRecordId) {
      const match = records.find((r) => r.id === event.relatedRecordId)
      if (match) {
        setActiveDrawerRecord(match)
        return
      }
    }
    addToast('Timeline Event', event.description, 'info')
  }

  const handleNavigateToRecordFromTimeline = (recordId: string) => {
    const match = records.find((r) => r.id === recordId)
    if (match) {
      setCurrentPage('records')
      setActiveDrawerRecord(match)
    }
  }

  // 1. Medicine Reminder Handlers
  const handleAddReminder = (item: MedicineReminder) => {
    setReminders((prev) => [item, ...prev])
    api.createReminder(item).catch((err) => console.warn('Reminder sync error:', err.message))
  }
  const handleUpdateReminder = (item: MedicineReminder) => {
    setReminders((prev) => prev.map((r) => (r.id === item.id ? item : r)))
    api.updateReminder(item.id, item).catch((err) => console.warn('Reminder update error:', err.message))
  }
  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id))
    api.deleteReminder(id).catch((err) => console.warn('Reminder delete error:', err.message))
  }

  // 2. Vitals Monitoring Handlers
  const handleAddVital = (v: VitalMeasurement) => {
    setVitals((prev) => [v, ...prev])
    api.createVital(v).catch((err) => console.warn('Vital sync error:', err.message))
  }
  const handleDeleteVital = (id: string) => {
    setVitals((prev) => prev.filter((v) => v.id !== id))
    api.deleteVital(id).catch((err) => console.warn('Vital delete error:', err.message))
  }

  // 3. Report Explainer Handlers
  const handleAddExplainerDoc = (doc: ReportExplainerDocument) => {
    setExplainerDocs((prev) => [doc, ...prev])
    api.uploadExplainerReport(doc).catch((err) => console.warn('Explainer upload error:', err.message))
  }
  const handleUpdateExplainerDoc = (doc: ReportExplainerDocument) => {
    setExplainerDocs((prev) => prev.map((d) => (d.id === doc.id ? doc : d)))
  }
  const handleDeleteExplainerDoc = (id: string) => {
    setExplainerDocs((prev) => prev.filter((d) => d.id !== id))
  }

  // 4. Appointments Handlers
  const handleAddAppointment = (apt: DoctorAppointment) => {
    setAppointments((prev) => [apt, ...prev])
    api.createAppointment(apt).catch((err) => console.warn('Appointment sync error:', err.message))
  }
  const handleUpdateAppointment = (apt: DoctorAppointment) => {
    setAppointments((prev) => prev.map((a) => (a.id === apt.id ? apt : a)))
    api.updateAppointment(apt.id, apt).catch((err) => console.warn('Appointment update error:', err.message))
  }
  const handleDeleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id))
    api.deleteAppointment(id).catch((err) => console.warn('Appointment delete error:', err.message))
  }

  // 5. Emergency Card Handlers
  const handleUpdateEmergencyCard = (info: EmergencyCardInfo) => {
    setEmergencyCard(info)
    api.updateEmergencyCard(info).catch((err) => console.warn('Emergency card sync error:', err.message))
  }

  // 6. Wellness Logs Handlers
  const handleAddWellnessLog = (log: DailyWellnessEntry) => {
    setWellnessLogs((prev) => [log, ...prev])
    api.createWellnessLog(log).catch((err) => console.warn('Wellness sync error:', err.message))
  }
  const handleUpdateWellnessLog = (log: DailyWellnessEntry) => {
    setWellnessLogs((prev) => prev.map((l) => (l.id === log.id ? log : l)))
    api.updateWellnessLog(log.id, log).catch((err) => console.warn('Wellness update error:', err.message))
  }
  const handleDeleteWellnessLog = (id: string) => {
    setWellnessLogs((prev) => prev.filter((l) => l.id !== id))
    api.deleteWellnessLog(id).catch((err) => console.warn('Wellness delete error:', err.message))
  }

  // 7. Unknown Alerts Handlers
  const handleUpdateUnknownAlert = (alert: UnknownConditionAlertItem) => {
    setUnknownAlerts((prev) => prev.map((a) => (a.id === alert.id ? alert : a)))
    api.toggleAlertReview(alert.id).catch((err) => console.warn('Alert update error:', err.message))
  }

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xl shadow-teal-700/20 animate-pulse">
            <Activity className="w-7 h-7" />
          </div>
          <div className="text-center">
            <h2 className="text-base font-bold text-slate-800 tracking-tight">HealthTwin AI</h2>
            <p className="text-xs text-slate-500 mt-0.5">Connecting securely with Supabase...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <AuthPage />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      {/* Left Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        currentLanguage={currentLanguage}
        isOpenMobile={isOpenMobileMenu}
        onCloseMobile={() => setIsOpenMobileMenu(false)}
      />

      {/* Main Container Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          currentLanguage={currentLanguage}
          records={records}
          onOpenRecordDetail={(rec) => {
            setCurrentPage('records')
            setActiveDrawerRecord(rec)
          }}
          onToggleMobileMenu={() => setIsOpenMobileMenu(!isOpenMobileMenu)}
          isBackendLive={isBackendLive}
        />

        {/* Syncing Loading Bar */}
        {isInitialSyncing && (
          <div className="h-0.5 bg-linear-to-r from-teal-500 via-teal-400 to-indigo-500 animate-pulse w-full" />
        )}

        {/* Page Content View */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {currentPage === 'overview' && (
            <Dashboard
              records={records}
              timelineEvents={timelineEvents}
              reminders={reminders}
              vitals={vitals}
              onNavigate={setCurrentPage}
              onOpenUpload={() => setIsUploadOpen(true)}
              onSelectEvent={handleSelectEvent}
              onSelectRecord={(rec) => {
                setCurrentPage('records')
                setActiveDrawerRecord(rec)
              }}
            />
          )}

          {currentPage === 'records' && (
            <MedicalRecords
              records={records}
              onAddRecord={handleAddRecord}
              onUpdateRecord={handleUpdateRecord}
              onDeleteRecord={handleDeleteRecord}
              activeDrawerRecord={activeDrawerRecord}
              setActiveDrawerRecord={setActiveDrawerRecord}
              isUploadOpen={isUploadOpen}
              setIsUploadOpen={setIsUploadOpen}
            />
          )}

          {currentPage === 'summary' && (
            <HealthSummary
              records={records}
              onOpenUpload={() => setIsUploadOpen(true)}
            />
          )}


          {currentPage === 'explainer' && (
            <ReportExplainerPage
              documents={explainerDocs}
              onAddDocument={handleAddExplainerDoc}
              onUpdateDocument={handleUpdateExplainerDoc}
              onDeleteDocument={handleDeleteExplainerDoc}
              onShowToast={addToast}
            />
          )}

          {currentPage === 'timeline' && (
            <HealthTimeline
              events={timelineEvents}
              onNavigateToRecord={handleNavigateToRecordFromTimeline}
            />
          )}

          {currentPage === 'reminders' && (
            <MedicineReminderPage
              reminders={reminders}
              onAddReminder={handleAddReminder}
              onUpdateReminder={handleUpdateReminder}
              onDeleteReminder={handleDeleteReminder}
              onShowToast={addToast}
            />
          )}

          {currentPage === 'vitals' && (
            <VitalsMonitoringPage
              vitals={vitals}
              onAddVital={handleAddVital}
              onDeleteVital={handleDeleteVital}
              onShowToast={addToast}
            />
          )}

          {currentPage === 'appointments' && (
            <AppointmentsManagerPage
              appointments={appointments}
              onAddAppointment={handleAddAppointment}
              onUpdateAppointment={handleUpdateAppointment}
              onDeleteAppointment={handleDeleteAppointment}
              onShowToast={addToast}
            />
          )}

          {currentPage === 'wellness' && (
            <WellnessTrackerPage
              logs={wellnessLogs}
              onAddLog={handleAddWellnessLog}
              onUpdateLog={handleUpdateWellnessLog}
              onDeleteLog={handleDeleteWellnessLog}
              onShowToast={addToast}
            />
          )}

          {currentPage === 'emergency' && (
            <EmergencyCardPage
              cardInfo={emergencyCard}
              onUpdateCardInfo={handleUpdateEmergencyCard}
              onShowToast={addToast}
            />
          )}

          {currentPage === 'copilot' && (
            <HealthCopilot />
          )}

          {currentPage === 'unknown-alert' && (
            <UnknownConditionAlertPage
              alerts={unknownAlerts}
              onUpdateAlert={handleUpdateUnknownAlert}
              onShowToast={addToast}
            />
          )}

          {currentPage === 'settings' && (
            <Settings
              currentLanguage={currentLanguage}
              onLanguageChange={setCurrentLanguage}
              onShowToast={addToast}
            />
          )}
        </main>
      </div>

      {/* Floating Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
