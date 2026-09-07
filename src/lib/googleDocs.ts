import { ExamData, OptionNumberingStyle, QuestionNumberingStyle } from '../types';

export interface ExportDocOptions {
  optionStyle: OptionNumberingStyle;
  questionNumbering: QuestionNumberingStyle;
  includeAnswerKey: boolean;
}

export function generateExamPlainText(
  data: ExamData,
  options: ExportDocOptions = {
    optionStyle: 'numbers',
    questionNumbering: 'continuous',
    includeAnswerKey: false,
  }
): string {
  const lines: string[] = [];

  // Kop / Judul
  lines.push(data.header.title);
  lines.push(data.header.subject);
  lines.push(data.header.grade);
  lines.push('______________________________________________________________________');
  lines.push(`${data.header.studentNameLabel}            ${data.header.dateLabel}`);
  lines.push('______________________________________________________________________');
  lines.push('');

  // Bagian A
  const letterA = data.sectionA.letter.endsWith('.') ? data.sectionA.letter : `${data.sectionA.letter}.`;
  lines.push(`${letterA} ${data.sectionA.title}`);
  lines.push('');

  data.sectionA.questions.forEach((q, idx) => {
    const qNum = options.questionNumbering === 'continuous' ? idx + 1 : idx + 1;
    lines.push(`${qNum}. ${q.question}`);
    q.options.forEach((opt, optIdx) => {
      const optPrefix = `${String.fromCharCode(97 + optIdx)}.`;
      lines.push(`   ${optPrefix} ${opt}`);
    });
    lines.push('');
  });

  // Bagian B (Isian Singkat)
  const letterB = data.sectionB.letter.endsWith('.') ? data.sectionB.letter : `${data.sectionB.letter}.`;
  lines.push(`${letterB} ${data.sectionB.title}`);
  lines.push('');

  const bOffset = options.questionNumbering === 'continuous' 
    ? data.sectionA.questions.length 
    : 0;

  data.sectionB.questions.forEach((q, idx) => {
    const qNum = bOffset + idx + 1;
    lines.push(`${qNum}. ${q.question}`);
    lines.push('');
  });

  // Bagian C (Uraian)
  const letterC = data.sectionC.letter.endsWith('.') ? data.sectionC.letter : `${data.sectionC.letter}.`;
  lines.push(`${letterC} ${data.sectionC.title}`);
  lines.push('');

  const cOffset = options.questionNumbering === 'continuous'
    ? data.sectionA.questions.length + data.sectionB.questions.length
    : 0;

  data.sectionC.questions.forEach((q, idx) => {
    const qNum = cOffset + idx + 1;
    lines.push(`${qNum}. ${q.question}`);
    const answerLine = '…………………………………………………………………………………………………………';
    const linesCount = q.answerLinesCount || 2;
    for (let i = 0; i < linesCount; i++) {
      lines.push(answerLine);
    }
    lines.push('');
  });

  // Kunci Jawaban jika disertakan
  if (options.includeAnswerKey) {
    lines.push('');
    lines.push('======================================================================');
    lines.push('KUNCI JAWABAN & RUBRIK PENILAIAN');
    lines.push('======================================================================');
    lines.push('');
    lines.push('BAGIAN A (PILIHAN GANDA):');
    data.sectionA.questions.forEach((q, idx) => {
      const qNum = options.questionNumbering === 'continuous' ? idx + 1 : idx + 1;
      const ansIdx = q.correctAnswerIndex ?? 0;
      const optChar = options.optionStyle === 'numbers' ? `${ansIdx + 1}` : String.fromCharCode(97 + ansIdx);
      lines.push(`${qNum}. ${optChar} (${q.options[ansIdx]})`);
    });

    lines.push('');
    lines.push('BAGIAN B (ISIAN SINGKAT):');
    data.sectionB.questions.forEach((q, idx) => {
      const qNum = bOffset + idx + 1;
      lines.push(`${qNum}. ${q.answerKey || '-'}`);
    });

    lines.push('');
    lines.push('BAGIAN C (URAIAN):');
    data.sectionC.questions.forEach((q, idx) => {
      const qNum = cOffset + idx + 1;
      lines.push(`${qNum}. ${q.answerKey || '-'}`);
    });
  }

  return lines.join('\n');
}

export async function exportToGoogleDocs(
  accessToken: string,
  data: ExamData,
  options: ExportDocOptions
): Promise<{ documentId: string; url: string; title: string }> {
  const docTitle = `${data.header.title} - ${data.header.subject} ${data.header.grade}`;

  // 1. Create document
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: docTitle,
    }),
  });

  if (!createRes.ok) {
    const errJson = await createRes.json().catch(() => ({}));
    throw new Error(errJson.error?.message || `Gagal membuat dokumen Google Docs (${createRes.status})`);
  }

  const createdDoc = await createRes.json();
  const documentId = createdDoc.documentId;

  // 2. Insert text content
  const textContent = generateExamPlainText(data, options);

  const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: {
              index: 1,
            },
            text: textContent,
          },
        },
      ],
    }),
  });

  if (!updateRes.ok) {
    const errJson = await updateRes.json().catch(() => ({}));
    throw new Error(errJson.error?.message || `Gagal mengisi konten dokumen (${updateRes.status})`);
  }

  return {
    documentId,
    url: `https://docs.google.com/document/d/${documentId}/edit`,
    title: docTitle,
  };
}
