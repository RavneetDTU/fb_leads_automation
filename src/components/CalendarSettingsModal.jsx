import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, Settings, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';

export function CalendarSettingsModal({ isOpen, onClose, onSave, storeName, isSaving, initialOpenTime, initialCloseTime }) {
    const DEFAULT_OPEN  = '09:00';
    const DEFAULT_CLOSE = '18:00';

    const [openTime, setOpenTime] = useState(initialOpenTime || DEFAULT_OPEN);
    const [closeTime, setCloseTime] = useState(initialCloseTime || DEFAULT_CLOSE);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [mounted, setMounted] = useState(false);
    const autoCloseTimer = useRef(null);

    useEffect(() => {
        setMounted(true);
        return () => {
            setMounted(false);
            clearTimeout(autoCloseTimer.current);
        };
    }, []);

    // Every time the modal opens, reset fields to the latest saved values (or defaults)
    useEffect(() => {
        if (isOpen) {
            setOpenTime(initialOpenTime || DEFAULT_OPEN);
            setCloseTime(initialCloseTime || DEFAULT_CLOSE);
            setError('');
            setSuccess(false);
        }
    }, [isOpen, initialOpenTime, initialCloseTime]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!openTime) {
            setError('Open time is required.');
            return;
        }
        if (!closeTime) {
            setError('Close time is required.');
            return;
        }
        if (openTime >= closeTime) {
            setError('Open time must be earlier than close time.');
            return;
        }

        try {
            await onSave({ openTime, closeTime });
            // Show success message, then auto-close after 1.5s
            setSuccess(true);
            autoCloseTimer.current = setTimeout(() => {
                onClose();
                setSuccess(false);
            }, 1500);
        } catch {
            // Error is already handled in parent; keep modal open
        }
    };

    const handleClose = () => {
        clearTimeout(autoCloseTimer.current);
        setError('');
        setSuccess(false);
        onClose();
    };

    // Format time for display label (e.g. "09:00" → "9:00 AM")
    const formatTimeLabel = (time) => {
        if (!time) return '';
        const [h, m] = time.split(':').map(Number);
        const period = h >= 12 ? 'PM' : 'AM';
        const hour = h % 12 || 12;
        return `${hour}:${String(m).padStart(2, '0')} ${period}`;
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 z-40 backdrop-blur-[2px] transition-opacity"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg px-4">
                <div className="bg-white rounded-xl shadow-2xl border border-border overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-900 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                                <Settings className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-foreground leading-tight">Calendar Settings</h2>
                                {storeName && (
                                    <p className="text-xs text-muted-foreground mt-0.5">{storeName}</p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit}>
                        <div className="px-8 py-8 space-y-7">

                            {/* Info banner */}
                            <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3.5">
                                <Clock className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Set the store's operating hours. These times are used to determine available booking slots for this calendar.
                                </p>
                            </div>

                            {/* Open Time */}
                            <div className="space-y-2.5">
                                <label htmlFor="openTime" className="block text-sm font-medium text-foreground">
                                    Opening Time
                                </label>
                                <div className="relative">
                                    <input
                                        id="openTime"
                                        type="time"
                                        value={openTime}
                                        onChange={(e) => {
                                            setOpenTime(e.target.value);
                                            setError('');
                                        }}
                                        className="w-full h-11 px-4 pr-2 rounded-lg border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all cursor-pointer"
                                    />
                                </div>
                                {openTime && (
                                    <p className="text-xs text-muted-foreground">Store opens at <span className="font-medium text-foreground">{formatTimeLabel(openTime)}</span></p>
                                )}
                            </div>

                            {/* Close Time */}
                            <div className="space-y-2.5">
                                <label htmlFor="closeTime" className="block text-sm font-medium text-foreground">
                                    Closing Time
                                </label>
                                <div className="relative">
                                    <input
                                        id="closeTime"
                                        type="time"
                                        value={closeTime}
                                        onChange={(e) => {
                                            setCloseTime(e.target.value);
                                            setError('');
                                        }}
                                        className="w-full h-11 px-4 pr-2 rounded-lg border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all cursor-pointer"
                                    />
                                </div>
                                {closeTime && (
                                    <p className="text-xs text-muted-foreground">Store closes at <span className="font-medium text-foreground">{formatTimeLabel(closeTime)}</span></p>
                                )}
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            {/* Success message */}
                            {success && (
                                <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                                    <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                                    Store hours updated successfully.
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-border bg-muted/20">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={isSaving}
                                className="cursor-pointer px-5 h-10"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="cursor-pointer px-6 h-10"
                            >
                                {isSaving ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </div>
                                ) : (
                                    'Save Settings'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>,
        document.body
    );
}
