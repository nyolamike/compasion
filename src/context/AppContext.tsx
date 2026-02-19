import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { db, DbUser, DbParticipant, DbTrainingNeed, DbTrainingPlan, DbTrainingMaterial, DbFacility, DbTrainingSession, DbAttendanceRecord, DbEvaluation, DbFeedback, DbSurveyTemplate, DbSurveyQuestion, DbSurveySchedule, DbSurveyResponse } from '@/lib/database';


// User types
type UserRole = 'administrator' | 'manager' | 'coordinator' | 'facilitator';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  region: string;
  avatar?: string;
}

interface AppContextType {
  // User state
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  
  // Navigation
  currentView: string;
  setCurrentView: (view: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // Data - Users/Staff
  users: DbUser[];
  loadUsers: () => Promise<void>;
  
  // Data - Participants
  participants: DbParticipant[];
  loadParticipants: () => Promise<void>;
  addParticipant: (participant: Omit<DbParticipant, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  
  // Training Needs
  trainingNeeds: DbTrainingNeed[];
  loadTrainingNeeds: () => Promise<void>;
  addTrainingNeed: (need: Omit<DbTrainingNeed, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTrainingNeed: (id: string, updates: Partial<DbTrainingNeed>) => Promise<void>;
  
  // Training Plans
  trainingPlans: DbTrainingPlan[];
  loadTrainingPlans: () => Promise<void>;
  addTrainingPlan: (plan: Omit<DbTrainingPlan, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTrainingPlan: (id: string, updates: Partial<DbTrainingPlan>) => Promise<void>;
  deleteTrainingPlan: (id: string) => Promise<void>;
  
  // Training Materials
  trainingMaterials: DbTrainingMaterial[];
  loadTrainingMaterials: () => Promise<void>;
  addTrainingMaterial: (material: Omit<DbTrainingMaterial, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTrainingMaterial: (id: string, updates: Partial<DbTrainingMaterial>) => Promise<void>;
  
  // Facilities
  facilities: DbFacility[];
  loadFacilities: () => Promise<void>;
  
  // Training Sessions
  trainingSessions: DbTrainingSession[];
  loadTrainingSessions: () => Promise<void>;
  addTrainingSession: (session: Omit<DbTrainingSession, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTrainingSession: (id: string, updates: Partial<DbTrainingSession>) => Promise<void>;
  
  // Attendance
  attendanceRecords: DbAttendanceRecord[];
  loadAttendanceRecords: () => Promise<void>;
  addAttendanceRecord: (record: Omit<DbAttendanceRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateAttendance: (id: string, status: DbAttendanceRecord['status']) => Promise<void>;
  
  // Evaluations
  evaluations: DbEvaluation[];
  loadEvaluations: () => Promise<void>;
  addEvaluation: (evaluation: Omit<DbEvaluation, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  
  // Feedback
  feedbackRecords: DbFeedback[];
  loadFeedback: () => Promise<void>;
  addFeedback: (feedback: Omit<DbFeedback, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  
  // Offline status
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  pendingSyncCount: number;
  syncData: () => Promise<void>;
  isSyncing: boolean;
  
  // Loading state
  isLoading: boolean;
  error: string | null;
  
  // Modals
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  
  // Refresh all data
  refreshAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // User state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Navigation
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Data state
  const [users, setUsers] = useState<DbUser[]>([]);
  const [participants, setParticipants] = useState<DbParticipant[]>([]);
  const [trainingNeeds, setTrainingNeeds] = useState<DbTrainingNeed[]>([]);
  const [trainingPlans, setTrainingPlans] = useState<DbTrainingPlan[]>([]);
  const [trainingMaterials, setTrainingMaterials] = useState<DbTrainingMaterial[]>([]);
  const [facilities, setFacilities] = useState<DbFacility[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<DbTrainingSession[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<DbAttendanceRecord[]>([]);
  const [evaluations, setEvaluations] = useState<DbEvaluation[]>([]);
  const [feedbackRecords, setFeedbackRecords] = useState<DbFeedback[]>([]);
  
  // Offline state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modals
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingSyncCount > 0) {
      syncData();
    }
  }, [isOnline]);

  // Load data functions
  const loadUsers = useCallback(async () => {
    try {
      const data = await db.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  }, []);

  const loadParticipants = useCallback(async () => {
    try {
      const data = await db.getParticipants();
      setParticipants(data);
    } catch (err) {
      console.error('Failed to load participants:', err);
    }
  }, []);

  const loadTrainingNeeds = useCallback(async () => {
    try {
      const data = await db.getTrainingNeeds();
      setTrainingNeeds(data);
    } catch (err) {
      console.error('Failed to load training needs:', err);
    }
  }, []);

  const loadTrainingPlans = useCallback(async () => {
    try {
      const data = await db.getTrainingPlans();
      setTrainingPlans(data);
    } catch (err) {
      console.error('Failed to load training plans:', err);
    }
  }, []);

  const loadTrainingMaterials = useCallback(async () => {
    try {
      const data = await db.getTrainingMaterials();
      setTrainingMaterials(data);
    } catch (err) {
      console.error('Failed to load training materials:', err);
    }
  }, []);

  const loadFacilities = useCallback(async () => {
    try {
      const data = await db.getFacilities();
      setFacilities(data);
    } catch (err) {
      console.error('Failed to load facilities:', err);
    }
  }, []);

  const loadTrainingSessions = useCallback(async () => {
    try {
      const data = await db.getTrainingSessions();
      setTrainingSessions(data);
    } catch (err) {
      console.error('Failed to load training sessions:', err);
    }
  }, []);

  const loadAttendanceRecords = useCallback(async () => {
    try {
      const data = await db.getAttendanceRecords();
      setAttendanceRecords(data);
      // Update pending sync count
      const unsyncedCount = data.filter(r => !r.synced).length;
      setPendingSyncCount(prev => prev - attendanceRecords.filter(r => !r.synced).length + unsyncedCount);
    } catch (err) {
      console.error('Failed to load attendance records:', err);
    }
  }, []);

  const loadEvaluations = useCallback(async () => {
    try {
      const data = await db.getEvaluations();
      setEvaluations(data);
    } catch (err) {
      console.error('Failed to load evaluations:', err);
    }
  }, []);

  const loadFeedback = useCallback(async () => {
    try {
      const data = await db.getFeedback();
      setFeedbackRecords(data);
    } catch (err) {
      console.error('Failed to load feedback:', err);
    }
  }, []);

  const refreshAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadUsers(),
        loadParticipants(),
        loadTrainingNeeds(),
        loadTrainingPlans(),
        loadTrainingMaterials(),
        loadFacilities(),
        loadTrainingSessions(),
        loadAttendanceRecords(),
        loadEvaluations(),
        loadFeedback(),
      ]);
      
      // Calculate pending sync count
      const count = await db.getUnsyncedCount();
      setPendingSyncCount(count);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Failed to refresh data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [loadUsers, loadParticipants, loadTrainingNeeds, loadTrainingPlans, loadTrainingMaterials, loadFacilities, loadTrainingSessions, loadAttendanceRecords, loadEvaluations, loadFeedback]);

  // Initial data load
  useEffect(() => {
    refreshAllData();
    
    // Auto-login with default user for demo
    const autoLogin = async () => {
      try {
        const user = await db.getUserByRole('coordinator');
        if (user) {
          setCurrentUser({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            region: user.regions[0] || 'Central Region',
          });
        }
      } catch (err) {
        console.error('Auto-login failed:', err);
      }
    };
    autoLogin();
  }, []);

  // Login function
  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      let user = await db.getUserByEmail(email);
      if (!user) {
        user = await db.getUserByRole(role);
      }
      
      if (user) {
        setCurrentUser({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          region: user.regions[0] || 'Central Region',
        });
        setShowLoginModal(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login failed:', err);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  // CRUD operations
  const addParticipant = async (participant: Omit<DbParticipant, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newParticipant = await db.createParticipant(participant);
      setParticipants(prev => [...prev, newParticipant]);
    } catch (err) {
      console.error('Failed to add participant:', err);
      throw err;
    }
  };

  const addTrainingNeed = async (need: Omit<DbTrainingNeed, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newNeed = await db.createTrainingNeed(need);
      setTrainingNeeds(prev => [newNeed, ...prev]);
    } catch (err) {
      console.error('Failed to add training need:', err);
      throw err;
    }
  };

  const updateTrainingNeed = async (id: string, updates: Partial<DbTrainingNeed>) => {
    try {
      const updated = await db.updateTrainingNeed(id, updates);
      setTrainingNeeds(prev => prev.map(n => n.id === id ? updated : n));
    } catch (err) {
      console.error('Failed to update training need:', err);
      throw err;
    }
  };

  const addTrainingPlan = async (plan: Omit<DbTrainingPlan, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newPlan = await db.createTrainingPlan(plan);
      setTrainingPlans(prev => [newPlan, ...prev]);
    } catch (err) {
      console.error('Failed to add training plan:', err);
      throw err;
    }
  };

  const updateTrainingPlan = async (id: string, updates: Partial<DbTrainingPlan>) => {
    try {
      const updated = await db.updateTrainingPlan(id, updates);
      setTrainingPlans(prev => prev.map(p => p.id === id ? updated : p));
    } catch (err) {
      console.error('Failed to update training plan:', err);
      throw err;
    }
  };

  const deleteTrainingPlan = async (id: string) => {
    try {
      await db.deleteTrainingPlan(id);
      setTrainingPlans(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete training plan:', err);
      throw err;
    }
  };

  const addTrainingMaterial = async (material: Omit<DbTrainingMaterial, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newMaterial = await db.createTrainingMaterial(material);
      setTrainingMaterials(prev => [newMaterial, ...prev]);
    } catch (err) {
      console.error('Failed to add training material:', err);
      throw err;
    }
  };

  const updateTrainingMaterial = async (id: string, updates: Partial<DbTrainingMaterial>) => {
    try {
      const updated = await db.updateTrainingMaterial(id, updates);
      setTrainingMaterials(prev => prev.map(m => m.id === id ? updated : m));
    } catch (err) {
      console.error('Failed to update training material:', err);
      throw err;
    }
  };

  const addTrainingSession = async (session: Omit<DbTrainingSession, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newSession = await db.createTrainingSession(session);
      setTrainingSessions(prev => [...prev, newSession]);
    } catch (err) {
      console.error('Failed to add training session:', err);
      throw err;
    }
  };

  const updateTrainingSession = async (id: string, updates: Partial<DbTrainingSession>) => {
    try {
      const updated = await db.updateTrainingSession(id, updates);
      setTrainingSessions(prev => prev.map(s => s.id === id ? updated : s));
    } catch (err) {
      console.error('Failed to update training session:', err);
      throw err;
    }
  };

  const addAttendanceRecord = async (record: Omit<DbAttendanceRecord, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newRecord = await db.createAttendanceRecord({
        ...record,
        synced: isOnline,
      });
      setAttendanceRecords(prev => [...prev, newRecord]);
      if (!isOnline) {
        setPendingSyncCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Failed to add attendance record:', err);
      throw err;
    }
  };

  const updateAttendance = async (id: string, status: DbAttendanceRecord['status']) => {
    try {
      const updated = await db.updateAttendanceRecord(id, { status, synced: isOnline });
      setAttendanceRecords(prev => prev.map(r => r.id === id ? updated : r));
      if (!isOnline) {
        const record = attendanceRecords.find(r => r.id === id);
        if (record?.synced) {
          setPendingSyncCount(prev => prev + 1);
        }
      }
    } catch (err) {
      console.error('Failed to update attendance:', err);
      throw err;
    }
  };

  const addEvaluation = async (evaluation: Omit<DbEvaluation, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newEvaluation = await db.createEvaluation({
        ...evaluation,
        synced: isOnline,
      });
      setEvaluations(prev => [newEvaluation, ...prev]);
      if (!isOnline) {
        setPendingSyncCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Failed to add evaluation:', err);
      throw err;
    }
  };

  const addFeedback = async (feedback: Omit<DbFeedback, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newFeedback = await db.createFeedback({
        ...feedback,
        synced: isOnline,
      });
      setFeedbackRecords(prev => [newFeedback, ...prev]);
      if (!isOnline) {
        setPendingSyncCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Failed to add feedback:', err);
      throw err;
    }
  };

  // Sync function
  const syncData = async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    try {
      const result = await db.syncAllPendingData();
      const totalSynced = result.attendance + result.evaluations + result.feedback;
      setPendingSyncCount(prev => Math.max(0, prev - totalSynced));
      
      // Refresh data after sync
      await Promise.all([
        loadAttendanceRecords(),
        loadEvaluations(),
        loadFeedback(),
      ]);
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      isAuthenticated: !!currentUser,
      login,
      logout,
      currentView,
      setCurrentView,
      sidebarOpen,
      setSidebarOpen,
      users,
      loadUsers,
      participants,
      loadParticipants,
      addParticipant,
      trainingNeeds,
      loadTrainingNeeds,
      addTrainingNeed,
      updateTrainingNeed,
      trainingPlans,
      loadTrainingPlans,
      addTrainingPlan,
      updateTrainingPlan,
      deleteTrainingPlan,
      trainingMaterials,
      loadTrainingMaterials,
      addTrainingMaterial,
      updateTrainingMaterial,
      facilities,
      loadFacilities,
      trainingSessions,
      loadTrainingSessions,
      addTrainingSession,
      updateTrainingSession,
      attendanceRecords,
      loadAttendanceRecords,
      addAttendanceRecord,
      updateAttendance,
      evaluations,
      loadEvaluations,
      addEvaluation,
      feedbackRecords,
      loadFeedback,
      addFeedback,
      isOnline,
      setIsOnline,
      pendingSyncCount,
      syncData,
      isSyncing,
      isLoading,
      error,
      showLoginModal,
      setShowLoginModal,
      refreshAllData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
