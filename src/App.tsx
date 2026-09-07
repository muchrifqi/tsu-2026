import React, { useState } from "react";
import { initialExamData } from "./data/initialExam";
import {
  ExamData,
  OptionNumberingStyle,
  QuestionNumberingStyle,
  FontChoice,
} from "./types";
import { ExamPaperView } from "./components/ExamPaperView";
import { GoogleDocsExportModal } from "./components/GoogleDocsExportModal";
import { ExamEditorModal } from "./components/ExamEditorModal";
import { generateExamPlainText } from "./lib/googleDocs";
import {
  Copy,
  Edit3,
  Key,
  Check,
  Type,
  FileText,
  ListOrdered,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";

export default function App() {
  const [examData, setExamData] = useState<ExamData>(initialExamData);
  const [optionStyle, setOptionStyle] =
    useState<OptionNumberingStyle>("numbers");
  const [questionNumbering, setQuestionNumbering] =
    useState<QuestionNumberingStyle>("continuous");
  const [fontChoice, setFontChoice] = useState<FontChoice>("arial");
  const [showAnswerKey, setShowAnswerKey] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState<boolean>(false);
  const [copyToast, setCopyToast] = useState<boolean>(false);

  // Total counts
  const countA = examData.sectionA.questions.length;
  const countB = examData.sectionB.questions.length;
  const countC = examData.sectionC.questions.length;
  const totalCount = countA + countB + countC;

  const handleCopyText = async () => {
    const text = generateExamPlainText(examData, {
      optionStyle,
      questionNumbering,
      includeAnswerKey: showAnswerKey,
    });
    await navigator.clipboard.writeText(text);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2500);
  };

  return (
    <div className="min-h-screen bg-stone-100/80 text-stone-900 flex flex-col font-sans">
      {/* Top Application Bar (Hidden when printing) */}
      <header className="no-print sticky top-0 z-30 bg-white border-b border-stone-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
                  Aplikasi Tamplate Soal Ujian 2026
                </h1>
                <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                  {examData.header.grade}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                {examData.header.subject} • Format lengkap: Bagian A (PG),
                Bagian B (Isian), Bagian C (Uraian)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Google Docs Export */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs sm:text-sm shadow-xs transition-colors"
            >
              <FileText className="w-4 h-4" />
              Ekspor ke Google Docs
            </button>

            {/* Copy Text */}
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 rounded-lg font-medium text-xs sm:text-sm transition-colors shadow-2xs"
            >
              {copyToast ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">
                    Tersalin!
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-500" />
                  <span>Salin Naskah</span>
                </>
              )}
            </button>

            {/* Edit Questions */}
            <button
              onClick={() => setIsEditorModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-medium text-xs sm:text-sm transition-colors shadow-2xs"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Naskah</span>
            </button>
          </div>
        </div>

        {/* Secondary Sub-Bar / Customization Controls */}
        <div className="bg-stone-50/90 border-t border-stone-200 px-4 sm:px-6 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
            {/* Structure Badges */}
            <div className="flex items-center gap-2 text-stone-600">
              <span className="font-semibold text-stone-800 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-600" /> Susunan:
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-stone-200 font-medium">
                A. Pilihan Ganda: <strong>1 – {countA}</strong>
              </span>
              <span className="bg-blue-100/60 text-blue-900 px-2 py-0.5 rounded border border-blue-200 font-medium">
                B. Isian Singkat:{" "}
                <strong>
                  {countA + 1} – {countA + countB}
                </strong>
              </span>
              <span className="bg-purple-100/60 text-purple-900 px-2 py-0.5 rounded border border-purple-200 font-medium">
                C. Uraian:{" "}
                <strong>
                  {countA + countB + 1} – {totalCount}
                </strong>
              </span>
            </div>

            {/* View & Typography Options */}
            <div className="flex items-center gap-3">
              {/* Font Selector */}
              <div className="flex items-center gap-1 text-stone-600">
                <Type className="w-3.5 h-3.5" />
                <span className="text-stone-500">Font:</span>
                <select
                  value={fontChoice}
                  onChange={(e) => setFontChoice(e.target.value as FontChoice)}
                  className="bg-white border border-stone-300 rounded px-2 py-1 text-xs text-stone-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="arial">Arial (Standar Naskah)</option>
                  <option value="times">Times New Roman</option>
                  <option value="roboto">Roboto</option>
                  <option value="roboto-serif">Roboto Serif</option>
                  <option value="figtree">Figtree</option>
                  <option value="spectral">Spectral</option>
                  <option value="georgia">Lora / Serif Elegan</option>
                  <option value="sans">Plus Jakarta Sans</option>
                </select>
              </div>

              {/* Numbering Style */}
              <div className="flex items-center gap-1 text-stone-600">
                <ListOrdered className="w-3.5 h-3.5" />
                <span className="text-stone-500">Nomor:</span>
                <select
                  value={questionNumbering}
                  onChange={(e) =>
                    setQuestionNumbering(
                      e.target.value as QuestionNumberingStyle,
                    )
                  }
                  className="bg-white border border-stone-300 rounded px-2 py-1 text-xs text-stone-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="continuous">
                    Berlanjut (1 – {totalCount})
                  </option>
                  <option value="section">Per Bagian (1–10, 1–10, 1–5)</option>
                </select>
              </div>

              {/* Toggle Answer Key */}
              <button
                type="button"
                onClick={() => setShowAnswerKey(!showAnswerKey)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
                  showAnswerKey
                    ? "bg-emerald-600 text-white border-emerald-700"
                    : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                {showAnswerKey ? "Sembunyikan Kunci" : "Tampilkan Kunci"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 py-8 px-4 sm:px-6 exam-paper-container">
        {/* Helper Banner (Hidden on Print) */}
        <div className="no-print max-w-[850px] mx-auto mb-4 p-3.5 bg-blue-50/80 border border-blue-200 rounded-lg flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed shadow-2xs">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong>Penataan Naskah Sesuai Permintaan:</strong>
            <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-blue-800">
              <li>
                <strong>Bagian B</strong> telah ditambahkan sebagai soal isian
                singkat dengan materi Tauhid Kelas 3 (mengesakan Allah, ciptaan
                Allah, syahadat, shalat, sifat muslim).
              </li>
              <li>
                <strong>Bagian C</strong> menjadi soal uraian dengan nomor soal
                berlanjut dari nomor akhir Bagian B.
              </li>
              <li>
                Format penulisan, font, dan titik-titik jawaban lembar kerja
                siswa seragam dan konsisten.
              </li>
            </ul>
          </div>
        </div>

        {/* Paper Document Preview */}
        <ExamPaperView
          data={examData}
          optionStyle={optionStyle}
          questionNumbering={questionNumbering}
          fontChoice={fontChoice}
          showAnswerKey={showAnswerKey}
        />
      </main>

      {/* Floating Footer Note (Hidden on print) */}
      <footer className="no-print py-4 text-center text-xs text-stone-500 border-t border-stone-200 bg-white">
        <p>Naskah Soal Sumatif • SD Shahaba • Terintegrasi Google Docs</p>
      </footer>

      {/* Export to Google Docs Modal */}
      <GoogleDocsExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        examData={examData}
        optionStyle={optionStyle}
        questionNumbering={questionNumbering}
      />

      {/* Exam Editor Modal */}
      <ExamEditorModal
        isOpen={isEditorModalOpen}
        onClose={() => setIsEditorModalOpen(false)}
        examData={examData}
        onSave={(newData) => setExamData(newData)}
      />
    </div>
  );
}
