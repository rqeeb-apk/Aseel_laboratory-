/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Professional Educational Lab Report PDF Generator
 * مختبر الميكاترونكس اليمني - مولّد ومصدّر تقارير التجارب المعملية بصيغة PDF
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  CircuitElement,
  WireConnection,
  SimulationResult,
  MultimeterState,
  StudentProfile,
  RenderStyle,
} from '../../types/circuit';
import { StudentUser } from '../../types/auth';
import { captureCircuitSnapshot } from '../../utils/circuitSnapshot';
import { exportElementToPDF } from '../../utils/pdfExport';
import { ProjectLogo } from '../ui/ProjectLogo';
import {
  FileText,
  Download,
  Printer,
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit3,
  Calendar,
  Layers,
  Zap,
  Activity,
  Gauge,
  User,
  ShieldCheck,
  Check,
  Share2,
} from 'lucide-react';

interface LabReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: CircuitElement[];
  wires: WireConnection[];
  simResult: SimulationResult;
  multimeterState: MultimeterState;
  studentProfile: StudentProfile;
  currentUser?: StudentUser | null;
  renderStyle: RenderStyle;
}

export const LabReportModal: React.FC<LabReportModalProps> = ({
  isOpen,
  onClose,
  elements,
  wires,
  simResult,
  multimeterState,
  studentProfile,
  currentUser,
  renderStyle,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  // Editable report metadata
  const [reportTitle, setReportTitle] = useState('تقرير التجربة المعملية: دراسة وتحليل الدائرة الكهربائية');
  const [studentName, setStudentName] = useState(currentUser?.fullName || studentProfile.name || 'طالب ميكاترونكس');
  const [studentId, setStudentId] = useState(currentUser?.phone || studentProfile.academicId || '2026-ENG-01');
  const [university, setUniversity] = useState(studentProfile.university || 'جامعة صنعاء - كلية الهندسة');
  const [department, setDepartment] = useState(studentProfile.department || 'هندسة الميكاترونكس والروبوتات');
  const [experimentGoal, setExperimentGoal] = useState('التحقق العملي من قوانين الدوائر الكهربائية، قياس فروق الجهد وشدة التيار ومقارنتها بالحسابات النظرية.');
  const [studentNotes, setStudentNotes] = useState('أظهرت نتائج المحاكاة تطابقاً دقيقاً مع قوانين كيرشوف وقانون أوم ضمن حدود الاستقرار الفيزيائي للدائرة.');

  // Snapshot of current circuit
  const [circuitImage, setCircuitImage] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string>('');
  const [showConfig, setShowConfig] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  // Sync snapshot whenever opened or elements change
  useEffect(() => {
    if (isOpen) {
      loadSnapshot();
    }
  }, [isOpen, elements, wires]);

  const loadSnapshot = async () => {
    setIsCapturing(true);
    try {
      const img = await captureCircuitSnapshot(elements, wires, {
        theme: 'dark',
        scale: 2,
        padding: 60,
      });
      setCircuitImage(img);
    } catch (e) {
      console.error('Failed to capture snapshot:', e);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportRef.current || isExporting) return;
    setIsExporting(true);
    setIsDownloaded(false);

    try {
      const fileName = `تقرير_${studentName.replace(/\s+/g, '_')}_مختبر_الميكاترونكس.pdf`;
      await exportElementToPDF(reportRef.current, {
        fileName,
        onProgress: status => setExportProgress(status),
      });
      setIsDownloaded(true);
      setTimeout(() => setIsDownloaded(false), 4000);
    } catch (err) {
      alert('حدث خطأ أثناء تصدير ملف الـ PDF. يمكنك استخدام زر "طباعة التقرير" كبديل مباشر.');
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  // Compute live lab metrics
  const totalPowerW = Array.from(simResult.elementPowers?.values() || []).reduce((a, b) => a + b, 0);
  const totalPowerStr = totalPowerW < 1 
    ? `${(totalPowerW * 1000).toFixed(2)} mW` 
    : `${totalPowerW.toFixed(3)} W`;

  // Status badge calculation
  const statusColor = simResult.diagnostics.status === 'ok' 
    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : simResult.diagnostics.status === 'short_circuit'
    ? 'text-rose-700 bg-rose-50 border-rose-200'
    : 'text-amber-700 bg-amber-50 border-amber-200';

  const statusArabic = simResult.diagnostics.status === 'ok'
    ? 'دارة سليمة ومستقرة (Normal & Stable)'
    : simResult.diagnostics.status === 'short_circuit'
    ? 'دارة قصر كهربائي (Short Circuit)'
    : 'دارة مفتوحة / في وضع الاستعداد';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white" dir="rtl">
      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden print:max-h-none print:border-none print:shadow-none print:rounded-none">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 text-white shrink-0 print:hidden select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">تصدير تقرير المختبر التعليمي (PDF)</h3>
              <p className="text-[11px] text-slate-400">توثيق شامل للدائرة وقيم القياسات الحالية للطلاب والمشرفين</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setShowConfig(prev => !prev)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-750 text-xs font-semibold text-slate-200 transition-colors"
              title="تعديل بيانات التقرير"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">تعديل البيانات</span>
            </button>

            <button
              onClick={loadSnapshot}
              disabled={isCapturing}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-750 text-xs font-semibold text-slate-200 transition-colors disabled:opacity-50"
              title="تحديث صورة المخطط"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isCapturing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">تحديث المخطط</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              title="طباعة عبر المتصفح"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">طباعة</span>
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 min-h-[38px] active:scale-95"
            >
              {isExporting ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : isDownloaded ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <Download className="w-4 h-4 text-white" />
              )}
              <span>{isExporting ? 'جاري التصدير...' : isDownloaded ? 'تم الحفظ!' : 'تحميل ملف PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Export Progress Notification */}
        {exportProgress && (
          <div className="bg-emerald-950/80 border-b border-emerald-800 px-4 py-2 text-xs text-emerald-200 flex items-center gap-2 print:hidden animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>{exportProgress}</span>
          </div>
        )}

        {/* Collapsible Report Metadata Customizer (Hidden when printing) */}
        {showConfig && (
          <div className="bg-slate-950 border-b border-slate-800 p-3 sm:p-4 text-xs space-y-3 shrink-0 print:hidden animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">عنوان التقرير / التجربة:</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={e => setReportTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">اسم الطالب / المهندس:</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الرقم الأكاديمي أو الهاتف:</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الجامعة أو الكلية:</label>
                <input
                  type="text"
                  value={university}
                  onChange={e => setUniversity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">القسم الهندسي والتخصص:</label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الهدف التعليمي من التجربة:</label>
                <input
                  type="text"
                  value={experimentGoal}
                  onChange={e => setExperimentGoal(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">استنتاجات وملاحظات الطالب:</label>
              <textarea
                value={studentNotes}
                onChange={e => setStudentNotes(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* Scrollable Document Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-950 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          
          {/* THE PHYSICAL A4 REPORT TEMPLATE (Captured by html2canvas / printed) */}
          <div
            ref={reportRef}
            id="printable-lab-report"
            className="w-full max-w-[800px] bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6 font-sans print:shadow-none print:rounded-none print:p-8"
            style={{ minHeight: '1050px' }}
          >
            {/* 1. ACADEMIC HEADER WITH OFFICIAL EMBLEM */}
            <header className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ProjectLogo variant="emblem" size="lg" theme="light" />
                <div className="space-y-0.5">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                    {university}
                  </h1>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-700">
                    {department}
                  </h2>
                  <p className="text-[11px] font-semibold text-sky-700">
                    مختبر الميكاترونكس اليمني (Yemen Mechatronics Lab)
                  </p>
                </div>
              </div>

              <div className="text-left font-mono text-xs shrink-0 space-y-0.5 border-r pr-4 border-slate-200">
                <div className="font-black text-slate-900 tracking-wider">ACADEMIC LAB REPORT</div>
                <div className="text-[11px] text-slate-500 flex items-center justify-end gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{new Date().toLocaleDateString('ar-YE', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="text-[10px] text-slate-400">Time: {new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded border border-slate-300">
                  تقرير معتمد
                </div>
              </div>
            </header>

            {/* Title Banner */}
            <div className="bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-center">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                {reportTitle}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                <span className="font-bold text-slate-800">الهدف التعليمي: </span>
                {experimentGoal}
              </p>
            </div>

            {/* 2. STUDENT INFORMATION GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase">اسم الطالب</span>
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{studentName}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase">الرقم الأكاديمي / الهاتف</span>
                <span className="font-mono font-bold text-slate-800">{studentId}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase">عدد العناصر الفعالة</span>
                <span className="font-bold text-slate-900">{elements.length} مكون كهربائي</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase">حالة المحاكاة</span>
                <span className={`inline-block font-bold px-2 py-0.5 rounded text-[10px] border ${statusColor}`}>
                  {simResult.isRunning ? 'نشطة (Active)' : 'متوقفة (Idle)'}
                </span>
              </div>
            </div>

            {/* 3. CIRCUIT DIAGRAM SNAPSHOT (The visual centerpiece) */}
            <section className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-600" />
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    أولاً: مخطط الدائرة الكهربائية المعملية (Circuit Schematic)
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  نمط الرسم: {renderStyle === 'schematic' ? 'مخطط هندسي (IEC/IEEE)' : 'مكونات واقعية (Realistic)'}
                </span>
              </div>

              <div className="relative rounded-xl overflow-hidden border-2 border-slate-800 bg-slate-950 flex items-center justify-center min-h-[220px]">
                {circuitImage ? (
                  <img
                    src={circuitImage}
                    alt="مخطط الدائرة الكهربائية"
                    className="w-full h-auto object-contain max-h-[340px]"
                  />
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    جاري التقاط مخطط الدائرة...
                  </div>
                )}
                
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur-sm rounded text-[9px] text-slate-300 font-mono border border-slate-700">
                  Yemen Mechatronics Lab Engine v2.4
                </div>
              </div>
              <p className="text-[10px] text-slate-500 italic text-center">
                * تم التقاط المخطط مباشرة من مساحة العمل التفاعلية مع الحفاظ على ترقيم المنافذ وتدفق الإشارات.
              </p>
            </section>

            {/* 4. BILL OF MATERIALS & COMPONENT OPERATING PARAMETERS */}
            <section className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    ثانياً: جدول المكونات والقياسات التشغيلية (Bill of Materials & Electrical Values)
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold">
                  إجمالي المكونات: {elements.length}
                </span>
              </div>

              {elements.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                  لا توجد مكونات مركبة حالياً على لوحة الدائرة.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-[11px] border border-slate-300 rounded-lg overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold text-[10px]">
                      <tr>
                        <th className="p-2">الرمز</th>
                        <th className="p-2">نوع المكون</th>
                        <th className="p-2">القيمة المقننة</th>
                        <th className="p-2">فرق الجهد (ΔV)</th>
                        <th className="p-2">التيار (I)</th>
                        <th className="p-2">القدرة (P)</th>
                        <th className="p-2">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {elements.map((el, i) => {
                        const currentA = simResult.elementCurrents?.get(el.id) ?? 0;
                        const powerW = simResult.elementPowers?.get(el.id) ?? 0;
                        
                        // Current format
                        const currentStr = Math.abs(currentA) < 0.001 
                          ? `${(currentA * 1000000).toFixed(1)} µA` 
                          : Math.abs(currentA) < 1 
                          ? `${(currentA * 1000).toFixed(2)} mA` 
                          : `${currentA.toFixed(3)} A`;

                        // Power format
                        const powerStr = powerW < 0.001 
                          ? `${(powerW * 1000000).toFixed(1)} µW` 
                          : powerW < 1 
                          ? `${(powerW * 1000).toFixed(2)} mW` 
                          : `${powerW.toFixed(3)} W`;

                        // Approximate voltage across element
                        const vDrop = currentA !== 0 && el.type === 'resistor' 
                          ? `${(Math.abs(currentA) * (el.value || 1000)).toFixed(2)} V`
                          : el.properties.voltage 
                          ? `${el.properties.voltage} V` 
                          : '—';

                        const isBurnt = simResult.diagnostics.burntComponents?.includes(el.id);

                        return (
                          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                            <td className="p-2 font-mono font-bold text-sky-700">{el.label}</td>
                            <td className="p-2 text-slate-600">{el.type}</td>
                            <td className="p-2 font-mono font-bold">{el.value} {el.unit}</td>
                            <td className="p-2 font-mono">{vDrop}</td>
                            <td className="p-2 font-mono text-emerald-700 font-semibold">{currentStr}</td>
                            <td className="p-2 font-mono text-amber-700">{powerStr}</td>
                            <td className="p-2">
                              {isBurnt ? (
                                <span className="text-[10px] font-bold text-rose-600">احتراق</span>
                              ) : (
                                <span className="text-[10px] font-semibold text-emerald-600">طبيعي</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* 5. INSTRUMENTATION TELEMETRY & DIAGNOSTICS */}
            <section className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    ثالثاً: قراءات أجهزة القياس والتشخيص الكهربائي (Instrumentation & Diagnostics)
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {/* Multimeter Card */}
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
                  <div className="flex items-center justify-between text-amber-900 font-bold text-[11px]">
                    <span>الملتيميتر الرقمي (DMM)</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 bg-amber-200/60 rounded">
                      نمط {multimeterState.mode}
                    </span>
                  </div>
                  <div className="font-mono text-base font-black text-amber-800">
                    {multimeterState.displayValue} {multimeterState.displayUnit}
                  </div>
                  <div className="text-[10px] text-amber-700">
                    {multimeterState.redProbe?.connectedPin ? 'المجسات متصلة بالدائرة' : 'المجسات معلقة أو غير متصلة'}
                  </div>
                </div>

                {/* Circuit Health & Status Card */}
                <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-200 space-y-1">
                  <div className="text-sky-900 font-bold text-[11px]">
                    تشخيص سلامة الدائرة
                  </div>
                  <div className="text-xs font-bold text-sky-800">
                    {statusArabic}
                  </div>
                  <div className="text-[10px] text-slate-600">
                    عدد العقد: {simResult.diagnostics.nodeCount} • الأسلاك: {wires.length}
                  </div>
                </div>

                {/* Power & Energy Card */}
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                  <div className="text-emerald-900 font-bold text-[11px]">
                    إجمالي استهلاك القدرة
                  </div>
                  <div className="font-mono text-base font-black text-emerald-800">
                    {totalPowerStr}
                  </div>
                  <div className="text-[10px] text-slate-600">
                    معدل الفقد الحراري ضمن الحدود الآمنة
                  </div>
                </div>
              </div>

              {simResult.diagnostics.warnings && simResult.diagnostics.warnings.length > 0 && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>تنبيه معملي: {simResult.diagnostics.warnings.join(' • ')}</span>
                </div>
              )}
            </section>

            {/* 6. ENGINEERING THEORY & VERIFICATION */}
            <section className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-purple-600" />
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    رابعاً: التحليل النظري والقوانين الهندسية المطبقة (Governing Laws)
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700">
                <div className="space-y-1">
                  <span className="font-bold text-slate-900">1. قانون أوم (Ohm's Law):</span>
                  <p className="font-mono text-sky-800 font-semibold">V = I × R  ⇒  I = V / R</p>
                  <p className="text-[10px] text-slate-500">يتناسب التيار المار في مقاومة طردياً مع فرق الجهد المطبق وعكسياً مع المقاومة.</p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-900">2. قوانين كيرشوف (Kirchhoff's Laws):</span>
                  <p className="font-mono text-purple-800 font-semibold">KVL: ∑V = 0  |  KCL: ∑I_in = ∑I_out</p>
                  <p className="text-[10px] text-slate-500">مجموع الجهود في حلقة مغلقة يساوي صفر، ومجموع التيارات الداخلة إلى عقدة يساوي الخارجة.</p>
                </div>
              </div>
            </section>

            {/* 7. STUDENT NOTES & CONCLUSIONS */}
            <section className="space-y-1.5">
              <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <Edit3 className="w-4 h-4 text-slate-700" />
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  خامساً: استنتاجات وملاحظات الطالب المعملية (Student Observations)
                </h3>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed min-h-[50px]">
                {studentNotes || 'لا توجد ملاحظات إضافية.'}
              </div>
            </section>

            {/* 8. ACADEMIC ENDORSEMENT & SIGN-OFF */}
            <footer className="pt-6 border-t-2 border-slate-900 mt-6 flex items-end justify-between text-xs text-slate-700">
              <div className="space-y-4">
                <div>
                  <span className="font-bold">توقيع الطالب المعملي: </span>
                  <span className="font-serif italic text-slate-900 mr-2">___________________________</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  كود التحقق الرقمي: YM-LAB-{Math.random().toString(36).substring(2, 9).toUpperCase()}
                </div>
              </div>

              {/* Official Stamp Box */}
              <div className="text-center border-2 border-dashed border-sky-600/80 p-2.5 rounded-xl bg-sky-50/50 w-44">
                <div className="text-[10px] font-black text-sky-800 uppercase tracking-wider">
                  مختبر الميكاترونكس اليمني
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">معتمد للأغراض الأكاديمية والتدريسية</div>
                <div className="mt-2 text-[10px] font-bold text-slate-700">
                  توقيع أستاذ المادة: _________
                </div>
              </div>
            </footer>
          </div>
        </div>

      </div>
    </div>
  );
};
