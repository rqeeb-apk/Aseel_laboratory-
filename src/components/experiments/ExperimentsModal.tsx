/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - Interactive University Experiments Modal
 */

import React, { useState } from 'react';
import { LabExperiment, SimulationResult } from '../../types/circuit';
import { CURRICULUM_EXPERIMENTS } from '../../data/curriculumExperiments';
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Play,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  X,
  ChevronLeft,
} from 'lucide-react';

interface ExperimentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTemplate: (experiment: LabExperiment) => void;
  completedExpIds: string[];
  onMarkExperimentCompleted: (expId: string, score: number) => void;
  simResult: SimulationResult;
}

export const ExperimentsModal: React.FC<ExperimentsModalProps> = ({
  isOpen,
  onClose,
  onLoadTemplate,
  completedExpIds,
  onMarkExperimentCompleted,
  simResult,
}) => {
  const [selectedExp, setSelectedExp] = useState<LabExperiment>(CURRICULUM_EXPERIMENTS[0]);
  const [activeTab, setActiveTab] = useState<'guide' | 'theory' | 'quiz'>('guide');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  if (!isOpen) return null;

  const handleStepToggle = (stepNum: number) => {
    setCheckedSteps(prev => ({
      ...prev,
      [stepNum]: !prev[stepNum],
    }));
  };

  const handleQuizSelect = (questionIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    let correctCount = 0;
    selectedExp.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });
    const percentage = Math.round((correctCount / selectedExp.quiz.length) * 100);
    onMarkExperimentCompleted(selectedExp.id, percentage);
  };

  const isCompleted = completedExpIds.includes(selectedExp.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl shadow-black/80 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                دليل التجارب المعملية المعتمدة
              </h2>
              <p className="text-xs text-slate-400">
                تجارب هندسة الميكاترونكس والإلكترونيات للجامعات اليمنية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Split: Experiment List (Left/Start) + Details (Right/End) */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Experiments Navigation Sidebar */}
          <div className="w-full md:w-72 border-b md:border-b-0 md:border-l border-slate-800/80 overflow-y-auto p-3 space-y-2 shrink-0 bg-slate-950/40">
            <div className="text-[11px] font-bold text-slate-400 px-2 py-1">
              قائمة التجارب ({CURRICULUM_EXPERIMENTS.length})
            </div>
            {CURRICULUM_EXPERIMENTS.map(exp => {
              const expDone = completedExpIds.includes(exp.id);
              const isSelected = selectedExp.id === exp.id;
              return (
                <button
                  key={exp.id}
                  onClick={() => {
                    setSelectedExp(exp);
                    setQuizAnswers({});
                    setQuizSubmitted(false);
                    setCheckedSteps({});
                  }}
                  className={`w-full text-right p-3 rounded-2xl transition-all flex items-start justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-sky-500/15 border border-sky-500/40 text-sky-300 shadow-md'
                      : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-sky-400">
                        #{exp.number}
                      </span>
                      <h4 className="text-xs font-bold truncate">{exp.title}</h4>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {exp.subtitle}
                    </p>
                  </div>
                  {expDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                      {exp.difficulty}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Experiment Workspace & Guide */}
          <div className="flex-1 flex flex-col overflow-y-auto p-5 sm:p-6 bg-slate-900/40">
            {/* Experiment Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs text-sky-400 mb-1">
                  <span>تجربة رقم {selectedExp.number}</span>
                  <span>•</span>
                  <span>{selectedExp.category}</span>
                  <span>•</span>
                  <span className="text-emerald-400">{selectedExp.difficulty}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{selectedExp.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedExp.subtitle}</p>
              </div>

              {/* Action Button: Load directly into workbench */}
              <button
                onClick={() => {
                  onLoadTemplate(selectedExp);
                  onClose();
                }}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 active:scale-95 transition-all shrink-0 min-h-[44px]"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>تحميل الدائرة في المختبر</span>
              </button>
            </div>

            {/* Tabs for Guide / Theory / Quiz */}
            <div className="flex items-center gap-2 border-b border-slate-800 my-4 shrink-0">
              <button
                onClick={() => setActiveTab('guide')}
                className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 ${
                  activeTab === 'guide'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                خطوات التوصيل والتحقق
              </button>
              <button
                onClick={() => setActiveTab('theory')}
                className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 ${
                  activeTab === 'theory'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                الأساس النظري والمعادلات
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 ${
                  activeTab === 'quiz'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                اختبار الفهم الذاتي ({selectedExp.quiz.length} أسئلة)
              </button>
            </div>

            {/* TAB 1: Guide */}
            {activeTab === 'guide' && (
              <div className="space-y-4">
                <div className="p-3 bg-sky-950/30 border border-sky-800/30 rounded-2xl flex items-center justify-between text-xs text-sky-200">
                  <span>المكونات المطلوبة للتجربة:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedExp.requiredComponents.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 bg-sky-900/50 rounded-lg text-[11px]">
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-200">خطوات العمل في المختبر:</h4>
                  {selectedExp.steps.map(step => {
                    const isChecked = !!checkedSteps[step.stepNumber];
                    return (
                      <div
                        key={step.stepNumber}
                        onClick={() => handleStepToggle(step.stepNumber)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isChecked
                            ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-300'
                            : 'bg-slate-950/60 border-slate-800 text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                            isChecked
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isChecked ? '✓' : step.stepNumber}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs leading-relaxed">{step.instruction}</p>
                          <p className="text-[11px] text-sky-400/80 mt-1">
                            💡 تلميح: {step.verificationTip}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Expected Results Table */}
                <div className="pt-3">
                  <h4 className="text-xs font-bold text-slate-200 mb-2">
                    النتائج والقراءات المتوقعة:
                  </h4>
                  <div className="overflow-x-auto border border-slate-800 rounded-2xl">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">المعلمة الكهربائية</th>
                          <th className="py-2.5 px-3">القانون الفيزيائي</th>
                          <th className="py-2.5 px-3">القيمة المحسوبة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {selectedExp.expectedResults.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-800/30">
                            <td className="py-2.5 px-3 font-semibold text-slate-200">
                              {r.parameter}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-400">{r.formula}</td>
                            <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">
                              {r.expectedValue}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Theory */}
            {activeTab === 'theory' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                  <h4 className="text-xs font-bold text-sky-400 mb-2">المقدمة النظرية:</h4>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedExp.theory}
                  </p>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                  <h4 className="text-xs font-bold text-amber-400 mb-2">القوانين والمعادلات:</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedExp.equations.map((eq, i) => (
                      <div
                        key={i}
                        className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl font-mono text-sm text-sky-300"
                      >
                        {eq}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Quiz */}
            {activeTab === 'quiz' && (
              <div className="space-y-4">
                {selectedExp.quiz.map((q, qIdx) => {
                  const selectedOption = quizAnswers[qIdx];
                  const isCorrect = selectedOption === q.correctIndex;
                  return (
                    <div
                      key={qIdx}
                      className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2.5"
                    >
                      <h4 className="text-xs font-bold text-slate-100">
                        {qIdx + 1}. {q.question}
                      </h4>
                      <div className="space-y-1.5">
                        {q.options.map((opt, oIdx) => {
                          const isOptionSelected = selectedOption === oIdx;
                          let btnStyle =
                            'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                          if (quizSubmitted) {
                            if (oIdx === q.correctIndex) {
                              btnStyle =
                                'bg-emerald-950/50 border-emerald-500 text-emerald-200 font-bold';
                            } else if (isOptionSelected) {
                              btnStyle = 'bg-rose-950/50 border-rose-500 text-rose-200';
                            }
                          } else if (isOptionSelected) {
                            btnStyle = 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold';
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleQuizSelect(qIdx, oIdx)}
                              className={`w-full text-right p-3 rounded-xl border text-xs transition-colors flex items-center justify-between min-h-[42px] ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && oIdx === q.correctIndex && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div
                          className={`p-2.5 rounded-xl text-xs ${
                            isCorrect
                              ? 'bg-emerald-950/30 text-emerald-300'
                              : 'bg-rose-950/30 text-rose-300'
                          }`}
                        >
                          <span className="font-bold">الشرح: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}

                {!quizSubmitted ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(quizAnswers).length < selectedExp.quiz.length}
                    className="w-full py-3 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors"
                  >
                    تصحيح الإجابات وتسجيل الدرجة
                  </button>
                ) : (
                  <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-center space-y-1">
                    <Award className="w-8 h-8 text-emerald-400 mx-auto" />
                    <h4 className="text-sm font-bold text-emerald-300">
                      تم تصحيح الاختبار وحفظ إنجازك في سجل الطالب!
                    </h4>
                    <p className="text-xs text-emerald-400/80">
                      تهانينا، يمكنك الآن متابعة التجربة التالية.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
