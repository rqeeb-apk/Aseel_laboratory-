/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Student Profile & Lab Notebook
 */

import React, { useState } from 'react';
import { StudentProfile, SavedCircuit, CircuitElement, WireConnection } from '../../types/circuit';
import { CURRICULUM_EXPERIMENTS } from '../../data/curriculumExperiments';
import { runElectricalTests, TestCaseResult } from '../../engine/circuitCalculations.test';
import {
  User,
  GraduationCap,
  Save,
  Download,
  Upload,
  CheckCircle2,
  Trash2,
  FileText,
  Printer,
  Check,
  X,
  Code,
  ShieldCheck,
} from 'lucide-react';

interface StudentNotebookProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onUpdateProfile: (profile: Partial<StudentProfile>) => void;
  savedCircuits: SavedCircuit[];
  onLoadSavedCircuit: (circuit: SavedCircuit) => void;
  onDeleteSavedCircuit: (id: string) => void;
  onImportCircuit: (jsonString: string) => void;
  currentElements: CircuitElement[];
  currentWires: WireConnection[];
  onSaveCurrentCircuit: (name: string, description: string) => void;
  userPhone?: string;
  onOpenChangePassword?: () => void;
  onLogout?: () => void;
  onOpenLabReport?: () => void;
}

export const StudentNotebook: React.FC<StudentNotebookProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  savedCircuits,
  onLoadSavedCircuit,
  onDeleteSavedCircuit,
  onImportCircuit,
  currentElements,
  currentWires,
  onSaveCurrentCircuit,
  userPhone,
  onOpenChangePassword,
  onLogout,
  onOpenLabReport,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'circuits' | 'tests' | 'report'>('profile');
  const [saveName, setSaveName] = useState('');
  const [saveDesc, setSaveDesc] = useState('');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [testResults, setTestResults] = useState<TestCaseResult[] | null>(null);

  if (!isOpen) return null;

  const yemeniUniversities = [
    'جامعة صنعاء - كلية الهندسة',
    'جامعة عدن - كلية الهندسة',
    'جامعة تعز - كلية الهندسة وتكنولوجيا المعلومات',
    'جامعة حضرموت - كلية الهندسة والبترول',
    'جامعة ذمار - كلية الهندسة',
    'جامعة إب - كلية الهندسة والعمارة',
    'جامعة العلوم والتكنولوجيا - صنعاء / عدن',
    'جامعة 21 سبتمبر للعلوم الطبية والتطبيقية',
    'جامعة سبأ',
    'جامعة البيضاء',
    'جامعة الحديدة',
    'جامعة أخرى / تعليم ذاتي',
  ];

  const engineeringDepts = [
    'هندسة الميكاترونكس والروبوتات',
    'الهندسة الكهربائية وهندسة القوى',
    'هندسة الإلكترونيات والاتصالات',
    'هندسة الحاسوب والتحكم الآلي',
    'الهندسة الطبية الحيوية',
    'الفيزياء التطبيقية والإلكترونيات',
  ];

  const handleRunTests = () => {
    const results = runElectricalTests();
    setTestResults(results);
  };

  const handleSaveCircuitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveName.trim()) return;
    onSaveCurrentCircuit(saveName, saveDesc);
    setSaveName('');
    setSaveDesc('');
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleExportJSON = (circuit: SavedCircuit) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(circuit, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${circuit.name.replace(/\s+/g, '_')}_circuit.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) onImportCircuit(content);
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl shadow-black/80 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">سجل الطالب وملف الإنجاز</h2>
              <p className="text-xs text-slate-400">حفظ الدوائر والتقارير الأكاديمية واختبارات المحاكاة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 shrink-0 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 ${
              activeTab === 'profile'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            بيانات الطالب الأكاديمية
          </button>
          <button
            onClick={() => setActiveTab('circuits')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 ${
              activeTab === 'circuits'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            الدوائر المحفوظة ({savedCircuits.length})
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 ${
              activeTab === 'tests'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            اختبارات دقة المحاكاة
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 ${
              activeTab === 'report'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            التقرير المعملي للطباعة
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/40">
          {/* TAB 1: Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم الطالب / المهندس:</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => onUpdateProfile({ name: e.target.value })}
                  placeholder="مثال: م. علي صالح الأهدل"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الجامعة اليمنية:</label>
                <select
                  value={profile.university}
                  onChange={e => onUpdateProfile({ university: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {yemeniUniversities.map((u, i) => (
                    <option key={i} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">القسم الهندسي:</label>
                <select
                  value={profile.department}
                  onChange={e => onUpdateProfile({ department: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {engineeringDepts.map((d, i) => (
                    <option key={i} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الرقم الجامعي (Academic ID):</label>
                <input
                  type="text"
                  value={profile.academicId}
                  onChange={e => onUpdateProfile({ academicId: e.target.value })}
                  placeholder="مثال: 2024-ENG-0482"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Stats overview */}
              <div className="pt-4 grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl">
                  <span className="text-[11px] text-slate-400">التجارب المنجزة:</span>
                  <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
                    {profile.completedExperiments.length} / {CURRICULUM_EXPERIMENTS.length}
                  </div>
                </div>
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl">
                  <span className="text-[11px] text-slate-400">الدوائر المحفوظة:</span>
                  <div className="text-xl font-bold text-sky-400 font-mono mt-0.5">
                    {savedCircuits.length}
                  </div>
                </div>
              </div>

              {/* Account Security & Subscription Card */}
              <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">حساب الطالب والاشتراك في الأكاديمية</h4>
                    {userPhone && (
                      <p className="text-[11px] font-mono text-cyan-400 mt-0.5">رقم الهاتف: {userPhone}</p>
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    اشتراك معتمد وفعال
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-slate-800/80">
                  {onOpenChangePassword && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenChangePassword();
                      }}
                      className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all text-center"
                    >
                      تغيير كلمة المرور
                    </button>
                  )}
                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onLogout();
                      }}
                      className="py-2 px-4 bg-red-950/60 hover:bg-red-900/60 text-red-300 text-xs font-semibold rounded-xl border border-red-800/60 transition-all text-center"
                    >
                      تسجيل الخروج
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Circuits */}
          {activeTab === 'circuits' && (
            <div className="space-y-5">
              {/* Save Current Circuit Card */}
              <form onSubmit={handleSaveCircuitSubmit} className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <Save className="w-4 h-4" /> حفظ الدائرة الحالية الموجودة في المختبر
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={saveName}
                    onChange={e => setSaveName(e.target.value)}
                    placeholder="اسم الدائرة (مثال: دارة مجزئ الجهد الذاتية)"
                    className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500"
                    required
                  />
                  <input
                    type="text"
                    value={saveDesc}
                    onChange={e => setSaveDesc(e.target.value)}
                    placeholder="وصف مختصر للدائرة والغرض منها"
                    className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    تحتوي على: {currentElements.length} مكون و {currentWires.length} سلك توصيل
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-colors min-h-[38px]"
                  >
                    حفظ الدائرة الآن
                  </button>
                </div>
                {showSaveSuccess && (
                  <div className="p-2 bg-emerald-950/40 text-emerald-300 text-xs rounded-lg flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> تم حفظ الدائرة بنجاح في متصفحك!
                  </div>
                )}
              </form>

              {/* Import JSON input */}
              <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl">
                <span className="text-xs text-slate-400">استيراد دائرة من ملف خارجي (JSON):</span>
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-sky-400" />
                  <span>رفع ملف JSON</span>
                  <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
                </label>
              </div>

              {/* Saved Circuits List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300">الدوائر المخزنة محلياً:</h4>
                {savedCircuits.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    لم تحفظ أي دارة بعد. أنشئ دارة في المختبر واحفظها من النموذج أعلاه.
                  </div>
                ) : (
                  savedCircuits.map(sc => (
                    <div
                      key={sc.id}
                      className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between gap-3"
                    >
                      <div>
                        <h5 className="text-xs font-bold text-slate-200">{sc.name}</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">{sc.description || 'بدون وصف'}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                          <span>{sc.date}</span>
                          <span>•</span>
                          <span>{sc.elements.length} مكون</span>
                          <span>•</span>
                          <span>{sc.wires.length} سلك</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            onLoadSavedCircuit(sc);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-sky-500/15 hover:bg-sky-500 text-sky-400 hover:text-slate-950 border border-sky-500/30 rounded-xl text-xs font-bold transition-all"
                        >
                          فتح بالمختبر
                        </button>
                        <button
                          onClick={() => handleExportJSON(sc)}
                          title="تصدير ملف JSON"
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteSavedCircuit(sc.id)}
                          title="حذف"
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-rose-400 hover:text-rose-200 bg-rose-950/40 border border-rose-900/40 hover:bg-rose-900/60 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Electrical Tests */}
          {activeTab === 'tests' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">فحص دقة المحرك الحسابي والكهربائي</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    يقوم هذا الاختبار الآلي بالتحقق من تطبيق قانون أوم، مجزئات الجهد، المقاومة المكافئة، والعزل.
                  </p>
                </div>
                <button
                  onClick={handleRunTests}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-colors shrink-0"
                >
                  تشغيل الفحص الرياضي
                </button>
              </div>

              {testResults && (
                <div className="space-y-2.5">
                  {testResults.map((t, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border ${
                        t.passed
                          ? 'bg-emerald-950/20 border-emerald-800/40'
                          : 'bg-rose-950/20 border-rose-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {t.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <X className="w-4 h-4 text-rose-400" />
                          )}
                          <h5 className="text-xs font-bold text-slate-200">{t.name}</h5>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${t.passed ? 'bg-emerald-900/60 text-emerald-300' : 'bg-rose-900/60 text-rose-300'}`}>
                          {t.passed ? 'ناجح PASSED' : 'فشل FAILED'}
                        </span>
                      </div>
                      <div className="mt-2 text-[11px] font-mono grid grid-cols-2 gap-2 text-slate-400">
                        <div>القيمة النظرية: <span className="text-slate-200">{t.expected}</span></div>
                        <div>قيمة المحاكاة: <span className="text-emerald-400 font-bold">{t.actual}</span></div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{t.notes}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Lab Report Generator */}
          {activeTab === 'report' && (
            <div className="space-y-4">
              <div className="p-6 bg-white text-slate-900 rounded-2xl shadow-xl space-y-4 font-sans" id="printable-lab-report">
                {/* Academic Header */}
                <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold">{profile.university}</h3>
                    <h4 className="text-xs font-semibold text-slate-600">{profile.department}</h4>
                    <p className="text-[11px] text-slate-500">مختبر الميكاترونكس والإلكترونيات الافتراضي</p>
                  </div>
                  <div className="text-left font-mono text-xs">
                    <div className="font-bold">YEMEN MECHATRONICS LAB</div>
                    <div className="text-slate-500">{new Date().toLocaleDateString('ar-YE')}</div>
                  </div>
                </div>

                {/* Student Info */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div><span className="font-bold">اسم الطالب:</span> {profile.name}</div>
                  <div><span className="font-bold">الرقم الأكاديمي:</span> {profile.academicId}</div>
                  <div><span className="font-bold">الدوائر النشطة:</span> {currentElements.length} مكون</div>
                  <div><span className="font-bold">حالة التجربة:</span> مكتملة ومحققة رياضياً</div>
                </div>

                {/* Circuit Bill of Materials */}
                <div>
                  <h5 className="text-xs font-bold text-slate-900 mb-1">جدول مكونات الدائرة المعملية (Bill of Materials - BOM):</h5>
                  <table className="w-full text-right text-[11px] border border-slate-300">
                    <thead className="bg-slate-100 border-b border-slate-300">
                      <tr>
                        <th className="p-1.5">العنصر</th>
                        <th className="p-1.5">النوع</th>
                        <th className="p-1.5">القيمة المقننة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {currentElements.map((el, i) => (
                        <tr key={i}>
                          <td className="p-1.5 font-bold">{el.label}</td>
                          <td className="p-1.5">{el.type}</td>
                          <td className="p-1.5 font-mono">{el.value} {el.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Sign-off */}
                <div className="pt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200">
                  <div>توقيع الطالب: ......................</div>
                  <div>اعتماد أستاذ المادة: ......................</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                {onOpenLabReport && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenLabReport();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
                  >
                    <FileText className="w-4 h-4" />
                    <span>فتح وتصدير التقرير الكامل كملف PDF (مع المخطط والقياسات)</span>
                  </button>
                )}

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>طباعة سريعة</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
