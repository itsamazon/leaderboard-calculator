import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InternProfile } from '../types';

interface SelectStrategistsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (strategistIds: string[]) => void;
    profiles: InternProfile[];
    week: string;
}

export default function SelectStrategistsModal({
    isOpen,
    onClose,
    onSelect,
    profiles,
    week
}: SelectStrategistsModalProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleToggle = (internId: string) => {
        if (selectedIds.includes(internId)) {
            setSelectedIds(selectedIds.filter(id => id !== internId));
        } else if (selectedIds.length < 2) {
            setSelectedIds([...selectedIds, internId]);
        }
    };

    const handleSubmit = () => {
        if (selectedIds.length === 2) {
            onSelect(selectedIds);
            setSelectedIds([]);
            onClose();
        }
    };

    const handleCancel = () => {
        setSelectedIds([]);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCancel}
                        className="fixed inset-0 bg-studio-charcoal/50 backdrop-blur-sm z-40"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={handleCancel}
                    >
                        <div
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-studio-forest p-6 rounded-t-2xl">
                                <h2 className="text-2xl font-bold text-white tracking-tighter-2">
                                    Create {week}
                                </h2>
                                <p className="text-studio-lime mt-1">
                                    Select 2 strategists for this week (others become Supports)
                                </p>
                            </div>

                            <div className="p-6">
                                <div className="mb-4 p-3 bg-studio-lime/10 border border-studio-lime rounded-lg">
                                    <p className="text-sm text-studio-charcoal">
                                        <strong>Selected: {selectedIds.length}/2</strong> - The rest will automatically be Supports
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                                    {profiles.map(profile => {
                                        const isSelected = selectedIds.includes(profile.id);
                                        const canSelect = selectedIds.length < 2 || isSelected;

                                        return (
                                            <button
                                                key={profile.id}
                                                onClick={() => handleToggle(profile.id)}
                                                disabled={!canSelect}
                                                className={`p-4 rounded-lg border-2 transition-all text-left ${isSelected
                                                    ? 'border-studio-lime bg-studio-lime/10'
                                                    : canSelect
                                                        ? 'border-gray-200 hover:border-studio-forest'
                                                        : 'border-gray-100 opacity-50 cursor-not-allowed'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-studio-charcoal">
                                                        {profile.name}
                                                    </span>
                                                    {isSelected && (
                                                        <span className="text-studio-lime">✓</span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-studio-charcoal font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={selectedIds.length !== 2}
                                        className="flex-1 px-6 py-3 bg-studio-lime text-studio-charcoal font-semibold rounded-lg hover:bg-studio-lime/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Confirm Strategists
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

