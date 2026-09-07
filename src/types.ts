export interface MultipleChoiceQuestion {
  id: string;
  number: number;
  question: string;
  options: string[];
  correctAnswerIndex?: number; // 0-indexed
}

export interface FillInQuestion {
  id: string;
  number: number;
  question: string;
  answerKey?: string;
}

export interface EssayQuestion {
  id: string;
  number: number;
  question: string;
  answerKey?: string;
  answerLinesCount?: number;
}

export interface ExamHeader {
  title: string;
  subject: string;
  grade: string;
  studentNameLabel: string;
  dateLabel: string;
}

export interface ExamData {
  header: ExamHeader;
  sectionA: {
    letter: string;
    title: string;
    questions: MultipleChoiceQuestion[];
  };
  sectionB: {
    letter: string;
    title: string;
    questions: FillInQuestion[];
  };
  sectionC: {
    letter: string;
    title: string;
    questions: EssayQuestion[];
  };
}

export type OptionNumberingStyle = 'numbers' | 'letters';
export type QuestionNumberingStyle = 'continuous' | 'section';
export type FontChoice = 'arial' | 'times' | 'georgia' | 'sans' | 'roboto' | 'roboto-serif' | 'figtree' | 'spectral';
