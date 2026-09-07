import React, { useState } from 'react';
import { ExamData, MultipleChoiceQuestion, FillInQuestion, EssayQuestion } from '../types';
import { X, Plus, Trash2, Check, RotateCcw } from 'lucide-react';
import { initialExamData } from '../data/initialExam';

interface ExamEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  examData: ExamData;
  onSave: (newData: ExamData) => void;
}

export const ExamEditorModal: React.FC<ExamEditorModalProps> = ({
  isOpen,
  onClose,
  examData,
  onSave,
}) => {
  const [data, setData] = useState<ExamData>(() => JSON.parse(JSON.stringify(examData)));
  const [activeTab, setActiveTab] = useState<'A' | 'B' | 'C' | 'header'>('B');

  if (!isOpen) return null;

  const handleResetToDefault = () => {
    if (window.confirm('Kembalikan naskah soal ke susunan awal?')) {
      setData(JSON.parse(JSON.stringify(initialExamData)));
    }
  };

  const handleSave = () => {
    onSave(data);
    onClose();
  };

  // Header update
  const handleHeaderChange = (field: keyof ExamData['header'], value: string) => {
    setData((prev) => ({
      ...prev,
      header: { ...prev.header, [field]: value },
    }));
  };

  // Section titles
  const handleSectionTitleChange = (section: 'sectionA' | 'sectionB' | 'sectionC', title: string) => {
    setData((prev) => ({
      ...prev,
      [section]: { ...prev[section], title },
    }));
  };

  // Section A - Multiple Choice
  const handleUpdateQuestionA = (index: number, question: string) => {
    setData((prev) => {
      const copy = [...prev.sectionA.questions];
      copy[index] = { ...copy[index], question };
      return { ...prev, sectionA: { ...prev.sectionA, questions: copy } };
    });
  };

  const handleUpdateOptionA = (qIndex: number, optIndex: number, text: string) => {
    setData((prev) => {
      const copy = [...prev.sectionA.questions];
      const newOpts = [...copy[qIndex].options];
      newOpts[optIndex] = text;
      copy[qIndex] = { ...copy[qIndex], options: newOpts };
      return { ...prev, sectionA: { ...prev.sectionA, questions: copy } };
    });
  };

  // Section B - Fill in
  const handleUpdateQuestionB = (index: number, field: 'question' | 'answerKey', val: string) => {
    setData((prev) => {
      const copy = [...prev.sectionB.questions];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, sectionB: { ...prev.sectionB, questions: copy } };
    });
  };

  const handleAddQuestionB = () => {
    const newNum = data.sectionA.questions.length + data.sectionB.questions.length + 1;
    const newQ: FillInQuestion = {
      id: `b_${Date.now()}`,
      number: newNum,
      question: 'Isian baru: ….',
      answerKey: '',
    };
    setData((prev) => ({
      ...prev,
      sectionB: {
        ...prev.sectionB,
        questions: [...prev.sectionB.questions, newQ],
      },
    }));
  };

  const handleRemoveQuestionB = (index: number) => {
    setData((prev) => ({
      ...prev,
      sectionB: {
        ...prev.sectionB,
        questions: prev.sectionB.questions.filter((_, i) => i !== index),
      },
    }));
  };

  // Section C - Essay
  const handleUpdateQuestionC = (index: number, field: 'question' | 'answerKey', val: string) => {
    setData((prev) => {
      const copy = [...prev.sectionC.questions];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, sectionC: { ...prev.sectionC, questions: copy } };
    });
  };

  const handleAddQuestionC = () => {
    const newNum =
      data.sectionA.questions.length +
      data.sectionB.questions.length +
      data.sectionC.questions.length +
      1;
    const newQ: EssayQuestion = {
      id: `c_${Date.now()}`,
      number: newNum,
      question: 'Jelaskanlah …!',
      answerKey: '',
      answerLinesCount: 2,
    };
    setData((prev) => ({
      ...prev,
      sectionC: {
        ...prev.sectionC,
        questions: [...prev.sectionC.questions, newQ],
      },
    }));
  };

  const handleRemoveQuestionC = (index: number) => {
    setData((prev) => ({
      ...prev,
      sectionC: {
        ...prev.sectionC,
        questions: prev.sectionC.questions.filter((_, i) => i !== index),
      },
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900">Editor Naskah Soal</h3>
            <p className="text-xs text-stone-500">
              Sesuaikan teks, petunjuk soal, kunci jawaban, dan susunan naskah
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToDefault}
              className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-md transition-colors flex items-center gap-1"
              title="Kembalikan ke standar awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Standar
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2 bg-stone-100/70 border-b border-stone-200 flex items-center gap-2 overflow-x-auto text-sm">
          <button
            onClick={() => setActiveTab('B')}
            className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors flex items-center gap-1.5 ${
              activeTab === 'B'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            Bagian B (Isian Singkat)
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
              {data.sectionB.questions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('C')}
            className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors flex items-center gap-1.5 ${
              activeTab === 'C'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            Bagian C (Uraian)
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
              {data.sectionC.questions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('A')}
            className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors flex items-center gap-1.5 ${
              activeTab === 'A'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            Bagian A (Pilihan Ganda)
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
              {data.sectionA.questions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('header')}
            className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors ${
              activeTab === 'header'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            Kop & Identitas Ujian
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB: BAGIAN B (ISIAN SINGKAT) */}
          {activeTab === 'B' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
                <strong>Bagian B: Soal Isian Singkat.</strong> Nomor soal berlanjut dari nomor 11
                sampai {10 + data.sectionB.questions.length}. Format penulisan titik-titik jawaban
                seragam menggunakan font yang sama.
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Petunjuk Soal Bagian B:
                </label>
                <input
                  type="text"
                  value={data.sectionB.title}
                  onChange={(e) => handleSectionTitleChange('sectionB', e.target.value)}
                  className="w-full text-sm border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-3">
                {data.sectionB.questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-stone-700">
                        Soal Nomor {10 + idx + 1}
                      </span>
                      <button
                        onClick={() => handleRemoveQuestionB(idx)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                        title="Hapus Soal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={q.question}
                      onChange={(e) => handleUpdateQuestionB(idx, 'question', e.target.value)}
                      className="w-full text-sm border border-stone-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-emerald-800 shrink-0">
                        Kunci Jawaban:
                      </span>
                      <input
                        type="text"
                        value={q.answerKey || ''}
                        onChange={(e) => handleUpdateQuestionB(idx, 'answerKey', e.target.value)}
                        className="flex-1 text-xs border border-stone-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                        placeholder="Masukkan kunci jawaban isian..."
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddQuestionB}
                className="w-full py-2 border-2 border-dashed border-stone-300 hover:border-blue-500 hover:bg-blue-50/50 rounded-lg text-xs font-semibold text-stone-600 hover:text-blue-600 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Tambah Butir Soal Isian Singkat
              </button>
            </div>
          )}

          {/* TAB: BAGIAN C (URAIAN) */}
          {activeTab === 'C' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs text-purple-900">
                <strong>Bagian C: Soal Uraian.</strong> Nomor soal berlanjut dari akhir Bagian B.
                Dilengkapi dengan garis titik-titik jawaban lembar kerja siswa.
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Petunjuk Soal Bagian C:
                </label>
                <input
                  type="text"
                  value={data.sectionC.title}
                  onChange={(e) => handleSectionTitleChange('sectionC', e.target.value)}
                  className="w-full text-sm border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-3">
                {data.sectionC.questions.map((q, idx) => {
                  const num = 10 + data.sectionB.questions.length + idx + 1;
                  return (
                    <div
                      key={q.id || idx}
                      className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-stone-700">Soal Nomor {num}</span>
                        <button
                          onClick={() => handleRemoveQuestionC(idx)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                          title="Hapus Soal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={q.question}
                        onChange={(e) => handleUpdateQuestionC(idx, 'question', e.target.value)}
                        className="w-full text-sm border border-stone-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-emerald-800 shrink-0">
                          Rambu Jawaban:
                        </span>
                        <input
                          type="text"
                          value={q.answerKey || ''}
                          onChange={(e) => handleUpdateQuestionC(idx, 'answerKey', e.target.value)}
                          className="flex-1 text-xs border border-stone-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                          placeholder="Masukkan rambu jawaban uraian..."
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleAddQuestionC}
                className="w-full py-2 border-2 border-dashed border-stone-300 hover:border-blue-500 hover:bg-blue-50/50 rounded-lg text-xs font-semibold text-stone-600 hover:text-blue-600 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Tambah Butir Soal Uraian
              </button>
            </div>
          )}

          {/* TAB: BAGIAN A (PILIHAN GANDA) */}
          {activeTab === 'A' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Petunjuk Soal Bagian A:
                </label>
                <input
                  type="text"
                  value={data.sectionA.title}
                  onChange={(e) => handleSectionTitleChange('sectionA', e.target.value)}
                  className="w-full text-sm border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-4">
                {data.sectionA.questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-3.5 bg-stone-50 border border-stone-200 rounded-lg space-y-2.5"
                  >
                    <div className="font-bold text-xs text-stone-700">Soal Nomor {idx + 1}</div>
                    <textarea
                      rows={2}
                      value={q.question}
                      onChange={(e) => handleUpdateQuestionA(idx, e.target.value)}
                      className="w-full text-sm border border-stone-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-stone-500 w-4">
                            {optIdx + 1}.
                          </span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleUpdateOptionA(idx, optIdx, e.target.value)}
                            className="flex-1 text-xs border border-stone-300 rounded px-2 py-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: KOP & IDENTITAS */}
          {activeTab === 'header' && (
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Judul Ujian:
                </label>
                <input
                  type="text"
                  value={data.header.title}
                  onChange={(e) => handleHeaderChange('title', e.target.value)}
                  className="w-full text-sm border border-stone-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mata Pelajaran:
                </label>
                <input
                  type="text"
                  value={data.header.subject}
                  onChange={(e) => handleHeaderChange('subject', e.target.value)}
                  className="w-full text-sm border border-stone-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tingkat / Kelas:
                </label>
                <input
                  type="text"
                  value={data.header.grade}
                  onChange={(e) => handleHeaderChange('grade', e.target.value)}
                  className="w-full text-sm border border-stone-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Format Label Nama:
                </label>
                <input
                  type="text"
                  value={data.header.studentNameLabel}
                  onChange={(e) => handleHeaderChange('studentNameLabel', e.target.value)}
                  className="w-full text-sm border border-stone-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Format Label Tanggal:
                </label>
                <input
                  type="text"
                  value={data.header.dateLabel}
                  onChange={(e) => handleHeaderChange('dateLabel', e.target.value)}
                  className="w-full text-sm border border-stone-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-stone-600 hover:bg-stone-200 rounded-lg text-sm font-medium transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all shadow-xs flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};
