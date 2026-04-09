'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Loader2, CheckCircle, XCircle, Camera, AlertTriangle, RotateCcw } from 'lucide-react';
import { useFinova } from './FinovaContext';

interface ReceiptData {
  merchantName: string | null;
  totalAmount: number | null;
  date: string | null;
  category: string | null;
  items?: { name: string; price: number }[];
  taxAmount?: number;
  confidence?: number;
  currency?: string;
}

const SCAN_PHASES: Record<string, string> = {
  idle: '',
  uploading: '⬆️ Uploading image...',
  analyzing: '🤖 NVIDIA Nemotron analyzing receipt...',
  parsing: '📋 Extracting data...',
  done: '✅ Extracted!',
};

export function ReceiptScannerApp() {
  const { invalidateTransactions } = useFinova();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ReceiptData | null>(null);
  const [error, setError] = useState('');
  const [scanPhase, setScanPhase] = useState<keyof typeof SCAN_PHASES>('idle');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, WebP)');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('Image too large. Please use an image under 10MB.');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError('');
    setScanPhase('idle');
    setSavedSuccess(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  }, []);

  const scan = async () => {
    if (!file) return;
    setScanning(true);
    setError('');
    setScanPhase('uploading');

    try {
      const formData = new FormData();
      formData.append('image', file);

      setScanPhase('analyzing');
      const res = await fetch('/api/vision/extract-receipt', { method: 'POST', body: formData });

      setScanPhase('parsing');
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Extraction failed');
      setResult(data.receipt);
      setScanPhase('done');
    } catch (err: any) {
      setError(err.message || 'Scan failed. Try a clearer photo or add manually.');
      setScanPhase('idle');
    } finally {
      setScanning(false);
    }
  };

  const confirmAndSave = async () => {
    if (!result) return;
    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: result.totalAmount || 0,
          category: result.category || 'Other',
          description: result.merchantName ? `${result.merchantName} (receipt)` : 'Scanned receipt',
          date: result.date || new Date().toISOString().slice(0, 10),
          type: 'expense',
          mood: 'neutral',
          aiNote: `Scanned by FINOVA Vision — ${result.merchantName || 'receipt'}`,
        }),
      });
      setSavedSuccess(true);
      invalidateTransactions(); // Sync TRACK + SAVE
      setTimeout(reset, 3000);
    } catch {
      setError('Failed to save. Please try again.');
    }
  };

  const reset = () => {
    setResult(null);
    setFile(null);
    setPreview(null);
    setScanPhase('idle');
    setError('');
    setSavedSuccess(false);
  };

  return (
    <div className="receipt-root">
      <div className="receipt-header">
        <div>
          <h2 className="receipt-title">📷 Receipt Scanner</h2>
          <p className="receipt-sub">AI Vision extraction · NVIDIA Nemotron · Auto-fill to TRACK</p>
        </div>
      </div>

      <div className="receipt-main">
        {/* Main drop zone / preview */}
        <div className={`receipt-drop ${isDraggingOver ? 'receipt-drop--hover' : ''} ${preview ? 'receipt-drop--has-file' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
        >
          {preview ? (
            <div className="receipt-preview-container">
              {/* Full-size image preview */}
              <img src={preview} alt="Receipt preview" className="receipt-preview-img" />

              {/* Scan overlay with laser animation */}
              {scanning && (
                <div className="receipt-scan-overlay">
                  <div className="receipt-laser" />
                  <div className="receipt-scan-badge">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>{SCAN_PHASES[scanPhase]}</span>
                  </div>
                </div>
              )}

              {/* Done overlay */}
              {scanPhase === 'done' && !scanning && (
                <div className="receipt-done-overlay">
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
              )}

              {/* Remove button */}
              {!scanning && (
                <button onClick={reset} className="receipt-remove-btn" title="Remove">
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          ) : (
            <div className="receipt-drop-content">
              <div className="receipt-drop-icon-wrap">
                <Camera className="w-10 h-10 text-gray-600" />
              </div>
              <p className="text-gray-300 text-sm font-semibold mt-2">Drop your receipt here</p>
              <p className="text-gray-600 text-xs mt-1">or click to browse · JPEG, PNG, WebP · max 10MB</p>
              <div className="receipt-model-badge">
                <span>🤖</span>
                <span>Powered by NVIDIA Nemotron Vision</span>
              </div>
            </div>
          )}

          {/* Hidden file input — covers whole zone */}
          {!preview && (
            <input type="file" accept="image/jpeg,image/png,image/webp" className="receipt-file-input"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          )}
        </div>

        {/* Scan button */}
        {file && !result && (
          <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            onClick={scan} disabled={scanning} className="receipt-scan-btn">
            {scanning
              ? <><Loader2 className="w-4 h-4 animate-spin" /> {SCAN_PHASES[scanPhase] || 'Analyzing...'}</>
              : <><Camera className="w-4 h-4" /> Scan with AI Vision</>}
          </motion.button>
        )}

        {/* Error */}
        {error && (
          <div className="receipt-error">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto"><XCircle className="w-4 h-4 opacity-50" /></button>
          </div>
        )}

        {/* Success saved flash */}
        <AnimatePresence>
          {savedSuccess && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="receipt-saved-flash">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>Saved to TRACK! SAVE is updating...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Extracted result */}
        <AnimatePresence>
          {result && !savedSuccess && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="receipt-result">
              <div className="receipt-result-head">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold text-sm">Receipt Extracted</span>
                {result.confidence && (
                  <span className="ml-auto text-xs text-gray-500">
                    {Math.round(result.confidence * 100)}% confident
                  </span>
                )}
              </div>

              <div className="receipt-fields-grid">
                <div className="receipt-field">
                  <span className="receipt-field-label">Merchant</span>
                  <span className="receipt-field-value">{result.merchantName || '—'}</span>
                </div>
                <div className="receipt-field">
                  <span className="receipt-field-label">Total</span>
                  <span className="receipt-field-value receipt-total">
                    ₹{result.totalAmount?.toLocaleString('en-IN') || '—'}
                  </span>
                </div>
                <div className="receipt-field">
                  <span className="receipt-field-label">Date</span>
                  <span className="receipt-field-value">{result.date || 'Today'}</span>
                </div>
                <div className="receipt-field">
                  <span className="receipt-field-label">Category</span>
                  <span className="receipt-field-value">{result.category || 'Other'}</span>
                </div>
                {result.taxAmount && result.taxAmount > 0 && (
                  <div className="receipt-field">
                    <span className="receipt-field-label">Tax</span>
                    <span className="receipt-field-value text-gray-400">₹{result.taxAmount}</span>
                  </div>
                )}
              </div>

              {result.items && result.items.length > 0 && (
                <div className="receipt-items-list">
                  <p className="receipt-items-title">Line Items</p>
                  {result.items.map((item, i) => (
                    <div key={i} className="receipt-item-row">
                      <span className="text-xs text-gray-400 flex-1">{item.name}</span>
                      <span className="text-xs text-white font-semibold">₹{item.price}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="receipt-actions">
                <button onClick={confirmAndSave} className="receipt-confirm-btn">
                  ✓ Save to TRACK
                </button>
                <button onClick={reset} className="receipt-retry-btn">
                  <RotateCcw className="w-3.5 h-3.5" /> Scan Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
