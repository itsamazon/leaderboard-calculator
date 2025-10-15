import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InternProfile, WeeklyMetrics } from '../types';

interface ManageInternsModalProps {
    isOpen: boolean;
    onClose: () => void;
    profiles: InternProfile[];
    weeklyMetrics: WeeklyMetrics[];
    onUpdateProfile: (id: string, updates: Partial<InternProfile>) => void;
    onDeleteProfile: (id: string) => void;
}

export default function ManageInternsModal({
    isOpen,
    onClose,
    profiles,
    weeklyMetrics,
    onUpdateProfile,
    onDeleteProfile
}: ManageInternsModalProps) {
    const [selectedProfile, setSelectedProfile] = useState<InternProfile | null>(null);
    const [editingProfile, setEditingProfile] = useState<InternProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editNotes, setEditNotes] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setSelectedProfile(null);
            setEditingProfile(null);
            setIsEditing(false);
            setEditName('');
            setEditNotes('');
        }
    }, [isOpen]);

    const handleProfileSelect = (profile: InternProfile) => {
        setSelectedProfile(profile);
        setEditingProfile(null);
        setIsEditing(false);
    };

    const handleEditStart = (profile: InternProfile) => {
        setEditingProfile(profile);
        setEditName(profile.name);
        setEditNotes(profile.notes || '');
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        if (editingProfile) {
            onUpdateProfile(editingProfile.id, {
                name: editName.trim(),
                notes: editNotes.trim() || undefined
            });
            setIsEditing(false);
            setEditingProfile(null);

            // Update selected profile with new data
            if (selectedProfile?.id === editingProfile.id) {
                setSelectedProfile({
                    ...selectedProfile,
                    name: editName.trim(),
                    notes: editNotes.trim() || undefined
                });
            }
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingProfile(null);
        setEditName('');
        setEditNotes('');
    };

    const handleDelete = (profile: InternProfile) => {
        if (window.confirm(`Are you sure you want to delete ${profile.name}? This will also remove all their weekly metrics and cannot be undone.`)) {
            onDeleteProfile(profile.id);

            // Clear selection if deleting the selected profile
            if (selectedProfile?.id === profile.id) {
                setSelectedProfile(null);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex h-full">
                        {/* Left Panel - Intern List */}
                        <div className="w-1/3 border-r border-gray-200 flex flex-col">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-studio-forest">Manage Interns</h2>
                                <p className="text-gray-600 mt-1">{profiles.length} intern{profiles.length !== 1 ? 's' : ''}</p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="space-y-2">
                                    {profiles.map((profile) => (
                                        <div
                                            key={profile.id}
                                            onClick={() => handleProfileSelect(profile)}
                                            className={`p-4 rounded-xl cursor-pointer transition-all ${selectedProfile?.id === profile.id
                                                ? 'bg-studio-lime/20 border-2 border-studio-lime'
                                                : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-studio-forest">{profile.name}</h3>
                                                    {profile.notes && (
                                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                            {profile.notes}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-1 ml-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditStart(profile);
                                                        }}
                                                        className="p-1 text-studio-forest hover:bg-studio-lime/20 rounded transition-colors"
                                                        title="Edit intern"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(profile);
                                                        }}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete intern"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Intern Details */}
                        <div className="flex-1 flex flex-col">
                            {selectedProfile ? (
                                <>
                                    <div className="p-6 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-bold text-studio-forest">
                                                {selectedProfile.name}
                                            </h3>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditStart(selectedProfile)}
                                                    className="px-4 py-2 bg-studio-lime text-studio-charcoal font-semibold rounded-lg hover:bg-studio-lime/90 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={onClose}
                                                    className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6">
                                        {isEditing && editingProfile?.id === selectedProfile.id ? (
                                            /* Edit Mode */
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-studio-lime focus:border-transparent"
                                                        placeholder="Enter intern name"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Notes
                                                    </label>
                                                    <textarea
                                                        value={editNotes}
                                                        onChange={(e) => setEditNotes(e.target.value)}
                                                        rows={8}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-studio-lime focus:border-transparent resize-none"
                                                        placeholder="Add notes about this intern (performance, strengths, areas for improvement, etc.)"
                                                    />
                                                </div>

                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={handleSaveEdit}
                                                        className="px-6 py-3 bg-studio-forest text-white font-semibold rounded-lg hover:bg-studio-forest/90 transition-colors"
                                                    >
                                                        Save Changes
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* View Mode */
                                            <div className="space-y-6">
                                                <div>
                                                    <h4 className="text-lg font-semibold text-studio-forest mb-3">Intern Information</h4>
                                                    <div className="bg-gray-50 rounded-xl p-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-sm text-gray-600">Name</p>
                                                                <p className="font-medium text-studio-forest">{selectedProfile.name}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-600">ID</p>
                                                                <p className="font-medium text-gray-700 font-mono text-sm">{selectedProfile.id}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-lg font-semibold text-studio-forest mb-3">General Notes</h4>
                                                    {selectedProfile.notes ? (
                                                        <div className="bg-studio-lime/10 border border-studio-lime/30 rounded-xl p-4">
                                                            <p className="text-studio-forest whitespace-pre-wrap">{selectedProfile.notes}</p>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                                                            <p className="text-gray-500">No general notes added yet</p>
                                                            <p className="text-sm text-gray-400 mt-1">Click "Edit" to add general notes about this intern</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Weekly Comments */}
                                                <div>
                                                    <h4 className="text-lg font-semibold text-studio-forest mb-3">📝 Weekly Comments History</h4>
                                                    {(() => {
                                                        const internMetrics = weeklyMetrics
                                                            .filter(m => m.internId === selectedProfile.id && m.comments)
                                                            .sort((a, b) => {
                                                                const aNum = parseInt(a.week.match(/\d+/)?.[0] || '0');
                                                                const bNum = parseInt(b.week.match(/\d+/)?.[0] || '0');
                                                                return bNum - aNum; // Most recent first
                                                            });

                                                        if (internMetrics.length === 0) {
                                                            return (
                                                                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                                                                    <p className="text-gray-500">No weekly comments yet</p>
                                                                    <p className="text-sm text-gray-400 mt-1">Comments will appear here when you grade this intern</p>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <div className="space-y-3">
                                                                {internMetrics.map(metric => (
                                                                    <div key={metric.id} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                                                        <div className="flex items-start justify-between mb-2">
                                                                            <span className="text-sm font-semibold text-blue-900">
                                                                                {metric.week}
                                                                            </span>
                                                                            <span className="text-xs text-gray-600">
                                                                                {metric.role === 'Strategist' ? '⭐ Strategist' : '🤝 Support'}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                                                            {metric.comments}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                /* No Selection */
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Select an Intern</h3>
                                        <p className="text-gray-500">Choose an intern from the list to view and manage their details</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
