import React from 'react';
import { ExamData, OptionNumberingStyle, QuestionNumberingStyle, FontChoice } from '../types';

interface ExamPaperViewProps {
  data: ExamData;
  optionStyle: OptionNumberingStyle;
  questionNumbering: QuestionNumberingStyle;
  fontChoice: FontChoice;
  showAnswerKey: boolean;
  onEditSection?: (section: 'header' | 'A' | 'B' | 'C') => void;
}

export const ExamPaperView: React.FC<ExamPaperViewProps> = ({
  data,
  optionStyle,
  questionNumbering,
  fontChoice,
  showAnswerKey,
}) => {
  const fontClass =
    fontChoice === 'arial'
      ? 'font-exam-arial'
      : fontChoice === 'times'
      ? 'font-exam-times'
      : fontChoice === 'georgia'
      ? 'font-exam-serif'
      : fontChoice === 'roboto'
      ? 'font-exam-roboto'
      : fontChoice === 'roboto-serif'
      ? 'font-exam-roboto-serif'
      : fontChoice === 'figtree'
      ? 'font-exam-figtree'
      : fontChoice === 'spectral'
      ? 'font-exam-spectral'
      : 'font-exam-sans';

  const bOffset = questionNumbering === 'continuous' ? data.sectionA.questions.length : 0;
  const cOffset =
    questionNumbering === 'continuous'
      ? data.sectionA.questions.length + data.sectionB.questions.length
      : 0;

  return (
    <div
      id="exam-document-paper"
      className={`exam-paper bg-white mx-auto text-black leading-relaxed shadow-lg print:shadow-none border border-stone-200 print:border-none p-10 sm:p-14 max-w-[850px] w-full min-h-[1100px] transition-all duration-200 rounded-sm print:rounded-none ${fontClass}`}
      style={{ fontSize: '15.5px' }}
    >
      {/* Header / Kop Soal */}
      <div className="text-center space-y-1 mb-3">
        <h1 className="font-exam-figtree text-[22px] font-bold tracking-wide uppercase leading-tight">{data.header.title}</h1>
        <h2 className="font-exam-spectral text-[30px] font-bold tracking-normal leading-tight">{data.header.subject}</h2>
        <h3 className="font-rubik text-[16px] italic font-normal text-stone-900 leading-snug">{data.header.grade}</h3>
      </div>

      <div className="text-center select-none text-stone-700 tracking-tighter overflow-hidden text-sm">
        ____________________________________________________________________________________________________
      </div>

      {/* Identitas Siswa */}
      <div className="py-2 flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm sm:text-base gap-2 font-medium">
        <div>{data.header.studentNameLabel}</div>
        <div>{data.header.dateLabel}</div>
      </div>

      <div className="text-center select-none text-stone-700 tracking-tighter overflow-hidden text-sm mb-6">
        ____________________________________________________________________________________________________
      </div>

      {/* ========================================================= */}
      {/* BAGIAN A: PILIHAN GANDA */}
      {/* ========================================================= */}
      <section className="mb-8 exam-question-item">
        <div className="mb-5 flex items-baseline justify-center gap-2.5 text-center font-roboto-serif">
          <div className="text-[26px] font-bold tracking-wide leading-none">
            {data.sectionA.letter.endsWith('.') ? data.sectionA.letter : `${data.sectionA.letter}.`}
          </div>
          <div className="text-[16px] font-bold not-italic text-stone-900">
            {data.sectionA.title}
          </div>
        </div>

        <div className="space-y-2.5">
          {data.sectionA.questions.map((q, qIndex) => {
            const displayNum = questionNumbering === 'continuous' ? qIndex + 1 : qIndex + 1;
            return (
              <div key={q.id || qIndex} className="exam-question-item pl-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-normal min-w-[24px] text-right text-stone-900">{displayNum}.</span>
                  <p className="flex-1 text-justify font-normal text-[15.5px] leading-relaxed">
                    {q.question}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5 pl-8 mt-1">
                  {q.options.map((opt, optIndex) => {
                    const optLabel = `${String.fromCharCode(97 + optIndex)}.`;
                    const isCorrect = showAnswerKey && q.correctAnswerIndex === optIndex;

                    return (
                      <div
                        key={optIndex}
                        className={`flex items-baseline gap-1.5 py-0 px-1 rounded transition-colors ${
                          isCorrect ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200 print:bg-transparent print:border-none' : ''
                        }`}
                      >
                        <span className="font-normal min-w-[18px] text-stone-800">{optLabel}</span>
                        <span className="flex-1 leading-snug">{opt}</span>
                        {isCorrect && (
                          <span className="text-xs bg-emerald-600 text-white px-1.5 py-0.2 rounded print:hidden ml-1">
                            Kunci
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* BAGIAN B: ISIAN SINGKAT (BAGIAN BARU DENGAN NOMOR BERLANJUT) */}
      {/* ========================================================= */}
      <section className="mb-8 pt-4 exam-question-item">
        <div className="mb-5 flex items-baseline justify-center gap-2.5 text-center font-roboto-serif">
          <div className="text-[26px] font-bold tracking-wide leading-none">
            {data.sectionB.letter.endsWith('.') ? data.sectionB.letter : `${data.sectionB.letter}.`}
          </div>
          <div className="text-[16px] font-bold not-italic text-stone-900">
            {data.sectionB.title}
          </div>
        </div>

        <div className="space-y-4">
          {data.sectionB.questions.map((q, qIndex) => {
            const displayNum = bOffset + qIndex + 1;
            return (
              <div key={q.id || qIndex} className="exam-question-item pl-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-normal min-w-[24px] text-right text-stone-900">{displayNum}.</span>
                  <p className="flex-1 text-justify font-normal text-[15.5px] leading-relaxed">
                    {q.question}
                  </p>
                </div>

                {showAnswerKey && q.answerKey && (
                  <div className="pl-8 mt-1 text-sm text-emerald-800 bg-emerald-50 py-1 px-2.5 rounded border border-emerald-200 inline-block print:hidden">
                    <span className="font-semibold">Kunci Jawaban:</span> {q.answerKey}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* BAGIAN C: URAIAN (NOMOR BERLANJUT DARI BAGIAN B) */}
      {/* ========================================================= */}
      <section className="mb-8 pt-4 exam-question-item">
        <div className="mb-5 flex items-baseline justify-center gap-2.5 text-center font-roboto-serif">
          <div className="text-[26px] font-bold tracking-wide leading-none">
            {data.sectionC.letter.endsWith('.') ? data.sectionC.letter : `${data.sectionC.letter}.`}
          </div>
          <div className="text-[16px] font-bold not-italic text-stone-900">
            {data.sectionC.title}
          </div>
        </div>

        <div className="space-y-6">
          {data.sectionC.questions.map((q, qIndex) => {
            const displayNum = cOffset + qIndex + 1;
            const lines = q.answerLinesCount || 2;

            return (
              <div key={q.id || qIndex} className="exam-question-item pl-1">
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="font-normal min-w-[24px] text-right text-stone-900">{displayNum}.</span>
                  <p className="flex-1 text-justify font-normal text-[15.5px] leading-relaxed">
                    {q.question}
                  </p>
                </div>

                {/* Garis titik-titik jawaban */}
                <div className="pl-8 space-y-1 text-stone-400 select-none overflow-hidden text-xs sm:text-sm tracking-widest">
                  {Array.from({ length: lines }).map((_, lIdx) => (
                    <div key={lIdx} className="w-full truncate text-stone-500">
                      ………………………………………………………………………………………………………………………………………………………………………………
                    </div>
                  ))}
                </div>

                {showAnswerKey && q.answerKey && (
                  <div className="pl-8 mt-2 text-sm text-emerald-800 bg-emerald-50 py-1.5 px-3 rounded border border-emerald-200 print:hidden">
                    <span className="font-semibold">Rambu Jawaban:</span> {q.answerKey}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer Dokumen Ujian */}
      <div className="mt-12 pt-4 border-t border-dashed border-stone-300 text-center text-xs text-stone-500 print:text-black">
        <p className="italic font-medium">-- Selamat Mengerjakan & Utamakan Kejujuran --</p>
      </div>
    </div>
  );
};
