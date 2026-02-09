import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function AddCalendarModal({ isOpen, onClose, onSubmit }) {
    const [storeName, setStoreName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if (!storeName.trim()) {
            setError('Store name is required');
            return;
        }

        // Submit
        onSubmit(storeName.trim());

        // Reset and close
        setStoreName('');
        setError('');
        onClose();
    };

    const handleClose = () => {
        setStoreName('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
                <div className="bg-white rounded-lg shadow-lg border border-border">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                        <h2 className="text-lg font-semibold text-foreground">Add New Calendar</h2>
                        <button
                            onClick={handleClose}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit}>
                        <div className="px-6 py-6">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="storeName" className="text-sm font-medium text-foreground">
                                    Store Name
                                </label>
                                <Input
                                    id="storeName"
                                    type="text"
                                    placeholder="e.g., Downtown Store"
                                    value={storeName}
                                    onChange={(e) => {
                                        setStoreName(e.target.value);
                                        setError('');
                                    }}
                                    className="w-full"
                                    autoFocus
                                />
                                {error && (
                                    <p className="text-sm text-red-500">{error}</p>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
                            <Button
                            className="cursor-pointer"
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                            <Button className="cursor-pointer" type="submit">
                                Create Calendar
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
