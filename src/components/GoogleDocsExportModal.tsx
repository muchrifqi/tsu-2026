import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  getAccessToken,
  logout,
} from '../lib/firebase';
import { exportToGoogleDocs } from '../lib/googleDocs';
import { ExamData, OptionNumberingStyle, QuestionNumberingStyle } from '../types';
import {
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface GoogleDocsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  examData: ExamData;
  optionStyle: OptionNumberingStyle;
  questionNumbering: QuestionNumberingStyle;
}

export const GoogleDocsExportModal: React.FC<GoogleDocsExportModalProps> = ({
  isOpen,
  onClose,
  examData,
  optionStyle,
  questionNumbering,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [includeAnswerKey, setIncludeAnswerKey] = useState(false);
  const [exportResult, setExportResult] = useState<{
    documentId: string;
    url: string;
    title: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfirmStep, setShowConfirmStep] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Check auth status
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
      },
      () => {
        // Not authenticated or token not in memory
        setUser(null);
        setToken(null);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Gagal masuk dengan akun Google.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      setExportResult(null);
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  const handleExportConfirm = async () => {
    setShowConfirmStep(false);
    setIsExporting(true);
    setErrorMsg(null);
    setExportResult(null);

    try {
      let activeToken = token;
      if (!activeToken) {
        activeToken = await getAccessToken();
      }

      if (!activeToken) {
        throw new Error('Sesi Google Auth Anda telah kedaluwarsa. Silakan masuk kembali.');
      }

      const result = await exportToGoogleDocs(activeToken, examData, {
        optionStyle,
        questionNumbering,
        includeAnswerKey,
      });

      setExportResult(result);
    } catch (err: any) {
      console.error('Export error:', err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat mengekspor ke Google Docs.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Ekspor ke Google Docs</h3>
              <p className="text-xs text-stone-500">
                Simpan naskah ujian langsung ke akun Google Drive Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {/* Success Card */}
          {exportResult ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-stone-900">
                  Dokumen Berhasil Dibuat!
                </h4>
                <p className="text-sm text-stone-600 mt-1 max-w-md mx-auto">
                  Naskah ujian <strong>{exportResult.title}</strong> telah tersimpan di Google Docs Anda dengan Bagian A, B, dan C yang rapi.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={exportResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-sm transition-all text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Buka di Google Docs
                </a>
                <button
                  onClick={() => setExportResult(null)}
                  className="w-full sm:w-auto px-4 py-2.5 text-stone-600 hover:bg-stone-100 rounded-lg text-sm font-medium transition-colors"
                >
                  Ekspor Dokumen Baru
                </button>
              </div>
            </div>
          ) : !user ? (
            /* Not logged in: Google Sign In */
            <div className="text-center py-3 space-y-4">
              <p className="text-sm text-stone-600 leading-relaxed">
                Untuk mengekspor naskah soal ini ke Google Docs pribadi Anda, silakan hubungkan akun Google dengan izin akses dokumen.
              </p>

              <div className="flex justify-center pt-2">
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="gsi-material-button disabled:opacity-50"
                >
                  <div className="gsi-material-button-state"></div>
                  <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon">
                      {isSigningIn ? (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      ) : (
                        <svg
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 48 48"
                          style={{ display: 'block' }}
                        >
                          <path
                            fill="#EA4335"
                            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                          />
                          <path
                            fill="#4285F4"
                            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                          />
                          <path
                            fill="#34A853"
                            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                          />
                          <path fill="none" d="M0 0h48v48H0z" />
                        </svg>
                      )}
                    </div>
                    <span className="gsi-material-button-contents">
                      {isSigningIn ? 'Menghubungkan...' : 'Sign in with Google'}
                    </span>
                  </div>
                </button>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs text-stone-600 text-left space-y-1">
                <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Fitur Ekspor Google Docs:
                </div>
                <ul className="list-disc list-inside space-y-0.5 pl-1">
                  <li>Format tersusun rapi siap cetak di Google Drive.</li>
                  <li>Memuat Bagian A (PG), Bagian B (Isian), dan Bagian C (Uraian).</li>
                  <li>Nomor soal berlanjut secara otomatis.</li>
                </ul>
              </div>
            </div>
          ) : showConfirmStep ? (
            /* User Confirmation Modal Dialog */
            <div className="space-y-4 py-2">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                  Konfirmasi Pembuatan Dokumen Baru
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Aplikasi akan membuat satu file dokumen Google Docs baru berjudul:{' '}
                  <strong>
                    {examData.header.title} - {examData.header.subject} {examData.header.grade}
                  </strong>{' '}
                  di dalam Google Drive akun <strong>{user.email}</strong>.
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmStep(false)}
                  className="flex-1 py-2.5 px-4 text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg font-medium text-sm transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExportConfirm}
                  disabled={isExporting}
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Mengekspor...
                    </>
                  ) : (
                    'Ya, Buat Dokumen'
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Logged in: Export configuration */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-lg p-3">
                <div className="flex items-center gap-2.5">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Google User'}
                      className="w-8 h-8 rounded-full border border-stone-300"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      {user.displayName?.[0] || 'U'}
                    </div>
                  )}
                  <div className="text-xs">
                    <p className="font-semibold text-stone-900">{user.displayName || 'Akun Google'}</p>
                    <p className="text-stone-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-stone-400 hover:text-stone-600 p-1.5 rounded hover:bg-stone-200"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Rincian Dokumen */}
              <div className="border border-stone-200 rounded-lg p-3.5 space-y-2.5 text-xs">
                <div className="font-semibold text-stone-800 text-sm">
                  Ringkasan Naskah yang akan Diekspor:
                </div>
                <div className="grid grid-cols-2 gap-2 text-stone-600">
                  <div>
                    <span className="text-stone-400">Judul:</span> {examData.header.title}
                  </div>
                  <div>
                    <span className="text-stone-400">Mapel:</span> {examData.header.subject} ({examData.header.grade})
                  </div>
                  <div>
                    <span className="text-stone-400">Bagian A:</span> {examData.sectionA.questions.length} Soal PG
                  </div>
                  <div>
                    <span className="text-stone-400">Bagian B:</span> {examData.sectionB.questions.length} Soal Isian
                  </div>
                  <div>
                    <span className="text-stone-400">Bagian C:</span> {examData.sectionC.questions.length} Soal Uraian
                  </div>
                  <div>
                    <span className="text-stone-400">Penomoran:</span>{' '}
                    {questionNumbering === 'continuous' ? 'Berlanjut (1 - 25)' : 'Per Bagian'}
                  </div>
                </div>

                {/* Option to include answer key */}
                <div className="pt-2 border-t border-stone-200">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-stone-700">
                    <input
                      type="checkbox"
                      checked={includeAnswerKey}
                      onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                      className="rounded border-stone-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Sertakan lampiran Kunci Jawaban & Rubrik di halaman belakang</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg text-sm font-medium transition-colors"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmStep(true)}
                  disabled={isExporting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all shadow-sm flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Mulai Ekspor ke Google Docs
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
