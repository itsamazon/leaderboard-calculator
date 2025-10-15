import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InternProfile, WeeklyStrategists } from '../types';

interface ManageWeeksModalProps {
    isOpen: boolean;
    onClose: () => void;
    weeks: WeeklyStrategists[];
    profiles: InternProfile[];
    onEditStrategists: (week: string, strategistIds: string[]) => void;
    onDeleteWeek: (week: string) => void;
}

export default function ManageWeeksModal({
    isOpen,
    onClose,
    weeks,
    profiles,
    onEditStrategists,
    onDeleteWeek
}: ManageWeeksModalProps) {
    const [editingWeek, setEditingWeek] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [savedWeek, setSavedWeek] = useState<string | null>(null);

    const handleStartEdit = (week: string, currentStrategistIds: string[]) => {
        setEditingWeek(week);
        setSelectedIds(currentStrategistIds);
    };

    const handleToggle = (internId: string) => {
        if (selectedIds.includes(internId)) {
            setSelectedIds(selectedIds.filter(id => id !== internId));
        } else if (selectedIds.length < 2) {
            setSelectedIds([...selectedIds, internId]);
        }
    };

    const handleSaveEdit = () => {
        if (editingWeek && selectedIds.length === 2) {
            onEditStrategists(editingWeek, selectedIds);
            setSavedWeek(editingWeek);
            setEditingWeek(null);
            setSelectedIds([]);

            // Clear saved indicator after 3 seconds
            setTimeout(() => {
                setSavedWeek(null);
            }, 3000);
        }
    };

    // Reset selection when switching between editing different weeks
    const handleStartEditSafe = (week: string, currentStrategistIds: string[]) => {
        if (editingWeek && editingWeek !== week) {
            // If switching to a different week while editing, reset first
            setEditingWeek(null);
            setSelectedIds([]);
        }
        setTimeout(() => {
            handleStartEdit(week, currentStrategistIds);
        }, 0);
    };

    const handleCancelEdit = () => {
        setEditingWeek(null);
        setSelectedIds([]);
    };

    const handleDelete = (week: string) => {
        if (window.confirm(`Delete ${week} and all its data?`)) {
            onDeleteWeek(week);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-studio-charcoal/50 backdrop-blur-sm z-40"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={onClose}
                    >
                        <div
                            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sticky top-0 bg-studio-forest p-6 rounded-t-2xl">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white tracking-tighter-2">
                                            Manage Weeks
                                        </h2>
                                        <p className="text-studio-lime mt-1">
                                            Edit strategist assignments for any week
                                        </p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="text-white hover:text-studio-lime transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {weeks.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-600">No weeks created yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {weeks.map((weekData) => {
                                            const isEditing = editingWeek === weekData.week;
                                            const strategists = profiles.filter(p => weekData.strategistIds.includes(p.id));

                                            return (
                                                <div
                                                    key={weekData.week}
                                                    className="border-2 border-gray-200 rounded-xl p-4 hover:border-studio-lime transition-colors"
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="text-lg font-bold text-studio-forest">{weekData.week}</h3>
                                                        <div className="flex gap-2">
                                                            {!isEditing && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleStartEditSafe(weekData.week, weekData.strategistIds)}
                                                                        className="px-3 py-1 text-sm bg-studio-lime text-studio-charcoal font-semibold rounded-lg hover:bg-studio-lime/90 transition-colors"
                                                                    >
                                                                        Edit Strategists
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(weekData.week)}
                                                                        className="px-3 py-1 text-sm bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {savedWeek === weekData.week && !isEditing && (
                                                        <div className="mb-3 p-2 bg-green-50 border border-green-500 rounded-lg">
                                                            <p className="text-sm text-green-800">
                                                                ✅ Strategists updated successfully!
                                                            </p>
                                                        </div>
                                                    )}

                                                    {isEditing ? (
                                                        <div className="space-y-3">
                                                            <p className="text-sm text-gray-600">
                                                                Select exactly 2 strategists (Selected: {selectedIds.length}/2)
                                                            </p>
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                                {profiles.map(profile => {
                                                                    const isSelected = selectedIds.includes(profile.id);
                                                                    const canSelect = selectedIds.length < 2 || isSelected;

                                                                    return (
                                                                        <button
                                                                            key={profile.id}
                                                                            onClick={() => handleToggle(profile.id)}
                                                                            disabled={!canSelect}
                                                                            className={`p-2 rounded-lg border-2 transition-all text-sm ${isSelected
                                                                                ? 'border-studio-lime bg-studio-lime/10'
                                                                                : canSelect
                                                                                    ? 'border-gray-200 hover:border-studio-forest'
                                                                                    : 'border-gray-100 opacity-50 cursor-not-allowed'
                                                                                }`}
                                                                        >
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="font-medium">{profile.name}</span>
                                                                                {isSelected && <span className="text-studio-lime">✓</span>}
                                                                            </div>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={handleCancelEdit}
                                                                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-studio-charcoal font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={handleSaveEdit}
                                                                    disabled={selectedIds.length !== 2}
                                                                    className="flex-1 px-4 py-2 bg-studio-lime text-studio-charcoal font-semibold rounded-lg hover:bg-studio-lime/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    Save Changes
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-2">
                                                            <span className="text-sm text-gray-600">Strategists:</span>
                                                            {strategists.map(s => (
                                                                <span
                                                                    key={s.id}
                                                                    className="px-3 py-1 bg-studio-lime/20 text-studio-forest text-sm font-semibold rounded-full"
                                                                >
                                                                    {s.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

