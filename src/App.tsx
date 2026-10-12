/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Main Application
 * مختبر الميكاترونكس اليمني (تعلّم • حاكِ • جرّب • ابتكر)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CircuitElement,
  WireConnection,
  ViewMode,
  RenderStyle,
  SimulationResult,
  ComponentType,
  MultimeterState,
  SavedCircuit,
  StudentProfile,
  LabExperiment,
} from './types/circuit';
import { Monitor, Smartphone, Sparkles } from 'lucide-react';
import { COMPONENT_CATALOG } from './data/componentsCatalog';
import { CURRICULUM_EXPERIMENTS } from './data/curriculumExperiments';
import { runCircuitSimulation } from './engine/simulationEngine';
import { Toolbar } from './components/ui/Toolbar';
import { MobileBottomNav } from './components/ui/MobileBottomNav';
import { CircuitCanvas } from './components/canvas/CircuitCanvas';
import { ComponentDrawer } from './components/library/ComponentDrawer';
import { DigitalMultimeter } from './components/instruments/DigitalMultimeter';
import { ExperimentsModal } from './components/experiments/ExperimentsModal';
import { StudentNotebook } from './components/student/StudentNotebook';
import { EngineeringCalculators } from './components/calculators/EngineeringCalculators';
import { EditElementModal } from './components/canvas/EditElementModal';
import { WorkbenchModal } from './components/canvas/WorkbenchModal';
import { WorkbenchBackgroundId } from './data/workbenchBackgrounds';
import { StudentUser, OwnerUser } from './types/auth';
import { authService } from './services/authService';
import { AuthScreen } from './components/auth/AuthScreen';
import { PendingStatusView } from './components/auth/PendingStatusView';
import { OwnerDashboardModal } from './components/auth/OwnerDashboardModal';
import { ChangePasswordModal } from './components/auth/ChangePasswordModal';
import { LabReportModal } from './components/report/LabReportModal';
import { DisplayMode } from './types/displayMode';
import { DesktopComponentLibraryPanel } from './components/desktop/DesktopComponentLibraryPanel';
import { DesktopPropertiesInspector } from './components/desktop/DesktopPropertiesInspector';

const STORAGE_KEYS = {
  PROFILE: 'ym_student_profile',
  SAVED_CIRCUITS: 'ym_saved_circuits',
  CURRENT_STATE: 'ym_circuit_state',
  WORKBENCH_BG: 'ym_workbench_bg',
  WORKBENCH_OPACITY: 'ym_workbench_opacity',
  SHOW_GRID: 'ym_show_grid',
  DISPLAY_MODE: 'yemen_mechatronics_display_mode',
};

// Initial default Ohm's law circuit template
const INITIAL_ELEMENTS: CircuitElement[] = [
  {
    id: 'v1',
    type: 'dc_source',
    x: 140,
    y: 180,
    rotation: 0,
    label: 'V1',
    value: 9,
    unit: 'V',
    properties: { voltage: 9 },
  },
  {
    id: 'amm1',
    type: 'ammeter',
    x: 300,
    y: 120,
    rotation: 0,
    label: 'A1',
    value: 0,
    unit: 'mA',
    properties: { reading: 9 },
  },
  {
    id: 'r1',
    type: 'resistor',
    x: 460,
    y: 180,
    rotation: 90,
    label: 'R1',
    value: 1000,
    unit: 'Ω',
    properties: { resistance: 1000 },
  },
  {
    id: 'vm1',
    type: 'voltmeter',
    x: 580,
    y: 180,
    rotation: 90,
    label: 'VM1',
    value: 0,
    unit: 'V',
    properties: { reading: 9 },
  },
  {
    id: 'gnd1',
    type: 'ground',
    x: 140,
    y: 280,
    rotation: 0,
    label: 'GND',
    value: 0,
    unit: 'V',
    properties: {},
  },
];

const INITIAL_WIRES: WireConnection[] = [
  { id: 'w1', fromComponentId: 'v1', fromPinId: 'pos', toComponentId: 'amm1', toPinId: 'in' },
  { id: 'w2', fromComponentId: 'amm1', fromPinId: 'out', toComponentId: 'r1', toPinId: 'p1' },
  { id: 'w3', fromComponentId: 'r1', fromPinId: 'p2', toComponentId: 'v1', toPinId: 'neg' },
  { id: 'w4', fromComponentId: 'v1', fromPinId: 'neg', toComponentId: 'gnd1', toPinId: 'gnd' },
  { id: 'w5', fromComponentId: 'r1', fromPinId: 'p1', toComponentId: 'vm1', toPinId: 'pos' },
  { id: 'w6', fromComponentId: 'r1', fromPinId: 'p2', toComponentId: 'vm1', toPinId: 'neg' },
];

export default function App() {
  // Authentication & Subscription State
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<StudentUser | null>(null);
  const [currentOwner, setCurrentOwner] = useState<OwnerUser | null>(null);
  const [isOwnerDashboardOpen, setIsOwnerDashboardOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDemoPreviewActive, setIsDemoPreviewActive] = useState(false);

  // Check existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = authService.getToken();
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const res = await authService.getMe();
        if (res.role === 'owner') {
          setCurrentOwner(res.user as OwnerUser);
        } else if (res.role === 'student') {
          const user = res.user as StudentUser;
          setCurrentUser(user);
          if (user.fullName) {
            setStudentProfile(prev => ({ ...prev, name: user.fullName }));
          }
        }
      } catch {
        authService.clearToken();
        setCurrentUser(null);
        setCurrentOwner(null);
      } finally {
        setAuthLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleStudentSuccess = (user: StudentUser) => {
    setCurrentUser(user);
    if (user.fullName) {
      setStudentProfile(prev => ({ ...prev, name: user.fullName }));
    }
  };

  const handleOwnerSuccess = (owner: OwnerUser) => {
    setCurrentOwner(owner);
    setIsOwnerDashboardOpen(true);
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setCurrentOwner(null);
    setIsOwnerDashboardOpen(false);
    setIsDemoPreviewActive(false);
  };

  const handleRefreshUserStatus = async () => {
    try {
      const res = await authService.getMe();
      if (res.role === 'student') {
        setCurrentUser(res.user as StudentUser);
      }
    } catch {}
  };

  // Circuit Canvas State
  const [elements, setElements] = useState<CircuitElement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_STATE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.elements && parsed.elements.length > 0) return parsed.elements;
      }
    } catch {}
    return INITIAL_ELEMENTS;
  });

  const [wires, setWires] = useState<WireConnection[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_STATE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.wires) return parsed.wires;
      }
    } catch {}
    return INITIAL_WIRES;
  });

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('current_flow');
  const [renderStyle, setRenderStyle] = useState<RenderStyle>('schematic');
  const [isSimRunning, setIsSimRunning] = useState<boolean>(true);

  // Modal / Drawer visibility
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isExperimentsOpen, setIsExperimentsOpen] = useState(false);
  const [isMultimeterOpen, setIsMultimeterOpen] = useState(false);
  const [isCalculatorsOpen, setIsCalculatorsOpen] = useState(false);
  const [isStudentOpen, setIsStudentOpen] = useState(false);
  const [isLabReportOpen, setIsLabReportOpen] = useState(false);
  const [isWorkbenchModalOpen, setIsWorkbenchModalOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<CircuitElement | null>(null);

  // Display Mode State: 'auto' | 'mobile' | 'desktop'
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DISPLAY_MODE);
      if (saved === 'mobile' || saved === 'desktop' || saved === 'auto') {
        return saved as DisplayMode;
      }
    } catch {}
    return 'auto';
  });

  const handleSetDisplayMode = (mode: DisplayMode) => {
    setDisplayMode(mode);
    try {
      localStorage.setItem(STORAGE_KEYS.DISPLAY_MODE, mode);
    } catch {}
  };

  // Window width tracking for responsive layout calculation
  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Active Layout determination
  const isDesktopLayout =
    displayMode === 'desktop' ||
    (displayMode === 'auto' && windowWidth >= 1024);

  // Desktop side panels collapse state
  const [isDesktopLibraryCollapsed, setIsDesktopLibraryCollapsed] = useState(false);
  const [isDesktopPropsCollapsed, setIsDesktopPropsCollapsed] = useState(false);

  // Update specific property on an element (e.g. wiper position, light level)
  const handleUpdateElementProperty = (id: string, property: string, value: any) => {
    setElements(prev =>
      prev.map(el => {
        if (el.id === id) {
          return {
            ...el,
            properties: {
              ...el.properties,
              [property]: value,
            },
          };
        }
        return el;
      })
    );
  };

  // Workbench Physical Surface State
  const [workbenchBg, setWorkbenchBg] = useState<WorkbenchBackgroundId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WORKBENCH_BG);
      if (saved) return saved as WorkbenchBackgroundId;
    } catch {}
    return 'esd_green';
  });
  const [workbenchOpacity, setWorkbenchOpacity] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WORKBENCH_OPACITY);
      if (saved) return parseFloat(saved);
    } catch {}
    return 0.7;
  });
  const [showGrid, setShowGrid] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHOW_GRID);
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  // Multimeter State
  const [multimeterState, setMultimeterState] = useState<MultimeterState>({
    isOpen: false,
    mode: 'DCV',
    range: 'auto',
    redProbe: null,
    blackProbe: null,
    displayValue: '0.00',
    displayUnit: 'V',
  });

  // Student Profile State
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: 'مهندس ميكاترونكس',
      university: 'جامعة صنعاء - كلية الهندسة',
      department: 'هندسة الميكاترونكس والروبوتات',
      academicId: '2024-ENG-0101',
      completedExperiments: ['exp_ohm'],
      quizScores: { exp_ohm: 100 },
      savedCircuitsCount: 1,
    };
  });

  // Saved Circuits
  const [savedCircuits, setSavedCircuits] = useState<SavedCircuit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_CIRCUITS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'circuit_ohm_sample',
        name: 'قانون أوم النموذجي',
        date: new Date().toLocaleDateString('ar-YE'),
        description: 'دارة تجربة قانون أوم مع أميتر وفولتميتر وبطارية 9V',
        elements: INITIAL_ELEMENTS,
        wires: INITIAL_WIRES,
      },
    ];
  });

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_STATE, JSON.stringify({ elements, wires }));
    } catch {}
  }, [elements, wires]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(studentProfile));
    } catch {}
  }, [studentProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_CIRCUITS, JSON.stringify(savedCircuits));
    } catch {}
  }, [savedCircuits]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKBENCH_BG, workbenchBg);
      localStorage.setItem(STORAGE_KEYS.WORKBENCH_OPACITY, workbenchOpacity.toString());
      localStorage.setItem(STORAGE_KEYS.SHOW_GRID, showGrid.toString());
    } catch {}
  }, [workbenchBg, workbenchOpacity, showGrid]);

  // Run Real Electrical Simulation Engine
  const simResult: SimulationResult = useMemo(() => {
    if (!isSimRunning) {
      return {
        isRunning: false,
        timestamp: Date.now(),
        nodeVoltages: new Map(),
        pinVoltages: new Map(),
        elementCurrents: new Map(),
        elementPowers: new Map(),
        branchCurrents: new Map(),
        diagnostics: {
          status: 'idle',
          message: 'المحاكاة متوقفة مؤقتاً.',
          nodeCount: 0,
          componentCount: elements.length,
          burntComponents: [],
          warnings: [],
        },
      };
    }
    return runCircuitSimulation(elements, wires);
  }, [elements, wires, isSimRunning]);

  // Keyboard Shortcuts (Delete, Rotate, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
          handleDeleteElement(selectedElementId);
        } else if (selectedWireId) {
          handleDeleteWire(selectedWireId);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (selectedElementId) {
          handleRotateElement(selectedElementId);
        }
      } else if (e.key === 'Escape') {
        setSelectedElementId(null);
        setSelectedWireId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, selectedWireId]);

  // Element actions
  const handleAddComponent = (type: ComponentType) => {
    const meta = COMPONENT_CATALOG[type];
    if (!meta) return;

    const countOfType = elements.filter(e => e.type === type).length + 1;
    const prefixMap: Partial<Record<ComponentType, string>> = {
      dc_source: 'V',
      ac_source: 'VAC',
      ground: 'GND',
      vcc: 'VCC',
      resistor: 'R',
      capacitor: 'C',
      inductor: 'L',
      diode: 'D',
      led: 'LED',
      transistor_npn: 'Q',
      transistor_pnp: 'Q',
      dc_motor: 'M',
      spst_switch: 'SW',
      push_button: 'PB',
      potentiometer: 'POT',
      lamp: 'LMP',
      buzzer: 'BZ',
      voltmeter: 'VM',
      ammeter: 'AMM',
      timer_555: 'IC',
      and_gate: 'AND',
      or_gate: 'OR',
      not_gate: 'NOT',
    };
    const prefix = prefixMap[type] || 'EL';

    const newElement: CircuitElement = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      x: 340 + Math.floor(Math.random() * 40 - 20),
      y: 200 + Math.floor(Math.random() * 40 - 20),
      rotation: 0,
      label: `${prefix}${countOfType}`,
      value: meta.defaultValue,
      unit: meta.defaultUnit,
      properties: { ...meta.defaultProperties },
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
    setIsLibraryOpen(false);
  };

  const handleUpdateElementPosition = (id: string, x: number, y: number) => {
    setElements(prev => prev.map(el => (el.id === id ? { ...el, x, y } : el)));
  };

  const handleRotateElement = (id: string) => {
    setElements(prev =>
      prev.map(el => {
        if (el.id !== id) return el;
        const rotations: (0 | 90 | 180 | 270)[] = [0, 90, 180, 270];
        const nextIdx = (rotations.indexOf(el.rotation) + 1) % 4;
        return { ...el, rotation: rotations[nextIdx] };
      })
    );
  };

  const handleDeleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setWires(prev => prev.filter(w => w.fromComponentId !== id && w.toComponentId !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const handleDuplicateElement = (id: string) => {
    const el = elements.find(item => item.id === id);
    if (!el) return;
    const duplicated: CircuitElement = {
      ...el,
      id: `${el.type}_${Date.now()}_copy`,
      x: el.x + 40,
      y: el.y + 40,
      label: `${el.label}_نسخة`,
      properties: { ...el.properties },
    };
    setElements(prev => [...prev, duplicated]);
    setSelectedElementId(duplicated.id);
  };

  // Wire actions
  const handleAddWire = (
    fromComponentId: string,
    fromPinId: string,
    toComponentId: string,
    toPinId: string
  ) => {
    // Prevent duplicate wires between same pins
    const exists = wires.some(
      w =>
        (w.fromComponentId === fromComponentId &&
          w.fromPinId === fromPinId &&
          w.toComponentId === toComponentId &&
          w.toPinId === toPinId) ||
        (w.fromComponentId === toComponentId &&
          w.fromPinId === toPinId &&
          w.toComponentId === fromComponentId &&
          w.toPinId === fromPinId)
    );

    if (exists) return;

    const newWire: WireConnection = {
      id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fromComponentId,
      fromPinId,
      toComponentId,
      toPinId,
    };

    setWires(prev => [...prev, newWire]);
    setSelectedWireId(newWire.id);
  };

  const handleDeleteWire = (id: string) => {
    setWires(prev => prev.filter(w => w.id !== id));
    if (selectedWireId === id) setSelectedWireId(null);
  };

  // Interactive component toggles
  const handleToggleComponent = (id: string) => {
    setElements(prev =>
      prev.map(el => {
        if (el.id !== id) return el;
        if (el.type === 'spst_switch') {
          return {
            ...el,
            properties: { ...el.properties, closed: !el.properties.closed },
          };
        }
        if (el.type === 'push_button') {
          return {
            ...el,
            properties: { ...el.properties, pressed: !el.properties.pressed },
          };
        }
        return el;
      })
    );
  };

  const handleClearCanvas = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع مكونات المختبر الحالية؟')) {
      setElements([]);
      setWires([]);
      setSelectedElementId(null);
      setSelectedWireId(null);
    }
  };

  const handleResetSim = () => {
    setElements(prev =>
      prev.map(el => ({
        ...el,
        properties: {
          ...el.properties,
          isBurnt: false,
          isLit: false,
          rpm: 0,
          isRunning: false,
        },
      }))
    );
  };

  // Load experiment template
  const handleLoadTemplate = (exp: LabExperiment) => {
    setElements(exp.circuitTemplate.elements);
    setWires(exp.circuitTemplate.wires);
    setSelectedElementId(null);
    setSelectedWireId(null);
  };

  // Save / Load custom student circuits
  const handleSaveCurrentCircuit = (name: string, description: string) => {
    const newSaved: SavedCircuit = {
      id: `circuit_${Date.now()}`,
      name,
      description,
      date: new Date().toLocaleDateString('ar-YE'),
      elements: [...elements],
      wires: [...wires],
    };
    setSavedCircuits(prev => [newSaved, ...prev]);
    setStudentProfile(prev => ({
      ...prev,
      savedCircuitsCount: prev.savedCircuitsCount + 1,
    }));
  };

  const handleLoadSavedCircuit = (circuit: SavedCircuit) => {
    setElements(circuit.elements);
    setWires(circuit.wires);
    setSelectedElementId(null);
    setSelectedWireId(null);
  };

  const handleDeleteSavedCircuit = (id: string) => {
    setSavedCircuits(prev => prev.filter(c => c.id !== id));
  };

  const handleImportCircuit = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.elements && parsed.wires) {
        setElements(parsed.elements);
        setWires(parsed.wires);
        alert('تم استيراد الدائرة بنجاح إلى المختبر!');
      } else {
        alert('الملف لا يحتوي على بنية دارة صحيحة.');
      }
    } catch {
      alert('خطأ في قراءة ملف الدائرة.');
    }
  };

  // Multimeter probe actions
  const handleConnectProbe = (probe: 'red' | 'black', componentId: string, pinId: string) => {
    setMultimeterState(prev => ({
      ...prev,
      [probe === 'red' ? 'redProbe' : 'blackProbe']: {
        x: 0,
        y: 0,
        connectedPin: { componentId, pinId },
      },
    }));
  };

  const handleDisconnectProbe = (probe: 'red' | 'black') => {
    setMultimeterState(prev => ({
      ...prev,
      [probe === 'red' ? 'redProbe' : 'blackProbe']: null,
    }));
  };

  // Mark experiment completed
  const handleMarkExperimentCompleted = (expId: string, score: number) => {
    setStudentProfile(prev => ({
      ...prev,
      completedExperiments: Array.from(new Set([...prev.completedExperiments, expId])),
      quizScores: { ...prev.quizScores, [expId]: score },
    }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center select-none" dir="rtl">
        <div className="w-14 h-14 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center mb-4">
          <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <h2 className="text-lg font-bold text-white">مختبر الميكاترونكس اليمني</h2>
        <p className="text-xs text-slate-400 mt-1">جارٍ التحقق من بيانات الدخول والجلسة...</p>
      </div>
    );
  }

  // Not logged in -> Show Splash & Auth Screen
  if (!currentUser && !currentOwner) {
    return (
      <AuthScreen
        onStudentSuccess={handleStudentSuccess}
        onOwnerSuccess={handleOwnerSuccess}
      />
    );
  }

  // Logged in student but subscription is pending or suspended -> Block lab access unless exploring in demo mode
  if (currentUser && currentUser.subscriptionStatus !== 'active' && !isDemoPreviewActive) {
    return (
      <>
        <PendingStatusView
          user={currentUser}
          onRefreshStatus={handleRefreshUserStatus}
          onLogout={handleLogout}
          onOpenChangePassword={() => setIsChangePasswordOpen(true)}
          onEnterDemoMode={() => setIsDemoPreviewActive(true)}
        />
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="relative w-full h-[100dvh] flex flex-col bg-slate-950 overflow-hidden font-sans select-none" dir="rtl">
      {/* Top Application Toolbar */}
      <Toolbar
        isSimRunning={isSimRunning}
        onToggleSim={() => setIsSimRunning(prev => !prev)}
        onResetSim={handleResetSim}
        onClearCanvas={handleClearCanvas}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        renderStyle={renderStyle}
        onChangeRenderStyle={setRenderStyle}
        displayMode={displayMode}
        onChangeDisplayMode={handleSetDisplayMode}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenExperiments={() => setIsExperimentsOpen(true)}
        onOpenMultimeter={() => setIsMultimeterOpen(prev => !prev)}
        onOpenCalculators={() => setIsCalculatorsOpen(true)}
        onOpenStudent={() => setIsStudentOpen(true)}
        onOpenLabReport={() => setIsLabReportOpen(true)}
        onOpenWorkbenchModal={() => setIsWorkbenchModalOpen(true)}
        currentUser={currentUser}
        currentOwner={currentOwner}
        onOpenOwnerDashboard={() => setIsOwnerDashboardOpen(true)}
        onLogout={handleLogout}
        simResult={simResult}
      />

      {/* Guest/Demo Exploration Banner */}
      {isDemoPreviewActive && currentUser && currentUser.subscriptionStatus !== 'active' && (
        <div className="shrink-0 bg-gradient-to-r from-sky-950/95 to-slate-900 border-b border-sky-500/40 px-3 py-1.5 flex items-center justify-between text-[11px] text-sky-200 z-30">
          <div className="flex items-center gap-1.5 truncate">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">🌟 وضع استكشاف المختبر (طالب زائر) • يمكنك اختبار المكونات وتبديل وضع العرض (جوال / سطح مكتب) بحرية</span>
          </div>
          <button
            onClick={() => setIsDemoPreviewActive(false)}
            className="px-2.5 py-0.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold shrink-0 mr-2 text-[10px] border border-sky-500/40"
          >
            عرض حالة التفعيل
          </button>
        </div>
      )}

      {/* Mobile Notice Banner when Forced into Desktop Mode */}
      {isDesktopLayout && windowWidth < 1024 && (
        <div className="shrink-0 bg-amber-950/90 border-b border-amber-500/40 px-3 py-1.5 flex items-center justify-between text-[11px] text-amber-200 z-30">
          <div className="flex items-center gap-1.5 truncate">
            <Monitor className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">🖥️ وضع سطح المكتب نشط — اسحب أفقياً للتنقل بين المكتبة والدائرة والخصائص</span>
          </div>
          <button
            onClick={() => handleSetDisplayMode('mobile')}
            className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold shrink-0 mr-2 text-[10px] border border-amber-500/30"
          >
            العودة للجوال 📱
          </button>
        </div>
      )}

      {/* Main Interactive Circuit Workbench */}
      <main
        className={`relative flex-1 w-full h-full overflow-hidden ${
          isDesktopLayout && windowWidth < 1024 ? 'overflow-x-auto overflow-y-hidden' : ''
        }`}
      >
        <div
          className={`relative w-full h-full flex ${
            isDesktopLayout && windowWidth < 1024 ? 'min-w-[1050px]' : ''
          }`}
        >
          {/* 1. Desktop Mode: Docked Component Library Panel (Right Side in RTL) */}
          {isDesktopLayout && (
            <DesktopComponentLibraryPanel
              onAddComponent={handleAddComponent}
              isCollapsed={isDesktopLibraryCollapsed}
              onToggleCollapse={() => setIsDesktopLibraryCollapsed(prev => !prev)}
            />
          )}

          {/* 2. Center Interactive Circuit Canvas */}
          <div className="relative flex-1 h-full overflow-hidden">
            <CircuitCanvas
              elements={elements}
              wires={wires}
              selectedElementId={selectedElementId}
              selectedWireId={selectedWireId}
              viewMode={viewMode}
              renderStyle={renderStyle}
              simResult={simResult}
              workbenchBg={workbenchBg}
              workbenchOpacity={workbenchOpacity}
              showGrid={showGrid}
              onOpenWorkbenchSettings={() => setIsWorkbenchModalOpen(true)}
              onSelectElement={setSelectedElementId}
              onSelectWire={setSelectedWireId}
              onUpdateElementPosition={handleUpdateElementPosition}
              onRotateElement={handleRotateElement}
              onDeleteElement={handleDeleteElement}
              onDuplicateElement={handleDuplicateElement}
              onDeleteWire={handleDeleteWire}
              onAddWire={handleAddWire}
              onToggleComponent={handleToggleComponent}
              onEditElement={setEditingElement}
            />

            {/* Floating Digital Multimeter Instrument (can be toggled in both modes) */}
            {isMultimeterOpen && (
              <DigitalMultimeter
                multimeterState={multimeterState}
                simResult={simResult}
                elements={elements}
                onClose={() => setIsMultimeterOpen(false)}
                onUpdateMode={mode => setMultimeterState(prev => ({ ...prev, mode }))}
                onConnectProbe={handleConnectProbe}
                onDisconnectProbe={handleDisconnectProbe}
              />
            )}
          </div>

          {/* 3. Desktop Mode: Docked Properties & Live Measurements Inspector (Left Side in RTL) */}
          {isDesktopLayout && (
            <DesktopPropertiesInspector
              selectedElement={elements.find(el => el.id === selectedElementId) || null}
              selectedWireId={selectedWireId}
              elements={elements}
              wires={wires}
              simResult={simResult}
              multimeterState={multimeterState}
              isSimRunning={isSimRunning}
              renderStyle={renderStyle}
              viewMode={viewMode}
              onToggleSim={() => setIsSimRunning(prev => !prev)}
              onResetSim={handleResetSim}
              onClearCanvas={handleClearCanvas}
              onChangeRenderStyle={setRenderStyle}
              onChangeViewMode={setViewMode}
              onRotateElement={handleRotateElement}
              onDuplicateElement={handleDuplicateElement}
              onDeleteElement={handleDeleteElement}
              onDeleteWire={handleDeleteWire}
              onEditElement={setEditingElement}
              onToggleComponent={handleToggleComponent}
              onUpdateElementProperty={handleUpdateElementProperty}
              onOpenFullMultimeter={() => setIsMultimeterOpen(prev => !prev)}
              onUpdateMultimeterMode={mode => setMultimeterState(prev => ({ ...prev, mode }))}
              isCollapsed={isDesktopPropsCollapsed}
              onToggleCollapse={() => setIsDesktopPropsCollapsed(prev => !prev)}
            />
          )}

          {/* Collapsible Component Library Drawer (for Mobile Mode) */}
          {!isDesktopLayout && (
            <ComponentDrawer
              isOpen={isLibraryOpen}
              onClose={() => setIsLibraryOpen(false)}
              onAddComponent={handleAddComponent}
            />
          )}
        </div>
      </main>

      {/* Bottom Thumb Zone Navigation Bar for Mobile Phones (Only shown in Mobile Layout) */}
      {!isDesktopLayout && (
        <MobileBottomNav
          activeScreen="canvas"
          onNavigate={screen => {
            if (screen === 'library') setIsLibraryOpen(true);
            else if (screen === 'experiments') setIsExperimentsOpen(true);
            else if (screen === 'multimeter') setIsMultimeterOpen(prev => !prev);
            else if (screen === 'calculators') setIsCalculatorsOpen(true);
            else if (screen === 'student') setIsStudentOpen(true);
          }}
        />
      )}

      {/* University Curriculum Experiments Modal */}
      <ExperimentsModal
        isOpen={isExperimentsOpen}
        onClose={() => setIsExperimentsOpen(false)}
        onLoadTemplate={handleLoadTemplate}
        completedExpIds={studentProfile.completedExperiments}
        onMarkExperimentCompleted={handleMarkExperimentCompleted}
        simResult={simResult}
      />

      {/* Student Profile & Notebook Modal */}
      <StudentNotebook
        isOpen={isStudentOpen}
        onClose={() => setIsStudentOpen(false)}
        profile={studentProfile}
        onUpdateProfile={updates => setStudentProfile(prev => ({ ...prev, ...updates }))}
        savedCircuits={savedCircuits}
        onLoadSavedCircuit={handleLoadSavedCircuit}
        onDeleteSavedCircuit={handleDeleteSavedCircuit}
        onImportCircuit={handleImportCircuit}
        currentElements={elements}
        currentWires={wires}
        onSaveCurrentCircuit={handleSaveCurrentCircuit}
        userPhone={currentUser?.phone}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        onLogout={handleLogout}
        onOpenLabReport={() => setIsLabReportOpen(true)}
      />

      {/* Engineering Calculators Modal */}
      <EngineeringCalculators
        isOpen={isCalculatorsOpen}
        onClose={() => setIsCalculatorsOpen(false)}
      />

      {/* Element Properties Edit Modal */}
      <EditElementModal
        element={editingElement}
        isOpen={!!editingElement}
        onClose={() => setEditingElement(null)}
        onSave={updated => {
          setElements(prev => prev.map(el => (el.id === updated.id ? updated : el)));
          setEditingElement(null);
        }}
      />

      {/* Physical Workbench Background Selector Modal */}
      <WorkbenchModal
        isOpen={isWorkbenchModalOpen}
        onClose={() => setIsWorkbenchModalOpen(false)}
        selectedBackground={workbenchBg}
        onSelectBackground={setWorkbenchBg}
        opacity={workbenchOpacity}
        onChangeOpacity={setWorkbenchOpacity}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(prev => !prev)}
      />

      {/* Owner Dashboard Control Modal */}
      {currentOwner && (
        <OwnerDashboardModal
          owner={currentOwner}
          isOpen={isOwnerDashboardOpen}
          onClose={() => setIsOwnerDashboardOpen(false)}
          onLogout={handleLogout}
        />
      )}

      {/* Student Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      {/* Educational Lab Report PDF Generator Modal */}
      <LabReportModal
        isOpen={isLabReportOpen}
        onClose={() => setIsLabReportOpen(false)}
        elements={elements}
        wires={wires}
        simResult={simResult}
        multimeterState={multimeterState}
        studentProfile={studentProfile}
        currentUser={currentUser}
        renderStyle={renderStyle}
      />
    </div>
  );
}
