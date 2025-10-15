import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InternProfile } from '../types';

interface AddInternModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (profile: Omit<InternProfile, 'id'>) => void;
}

export default function AddInternModal({ isOpen, onClose, onAdd }: AddInternModalProps) {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({ name });
        handleReset();
    };

    const handleReset = () => {
        setName('');
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
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-studio-forest p-6 rounded-t-2xl">
                                <h2 className="text-2xl font-bold text-white tracking-tighter-2">Add New Intern</h2>
                                <p className="text-studio-lime mt-1">Add intern once, update role & metrics weekly</p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-studio-charcoal mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-studio-lime focus:outline-none transition-colors"
                                        placeholder="e.g., Chidera Okeke"
                                    />
                                </div>

                                <div className="bg-studio-lime/10 p-3 rounded-lg border border-studio-lime">
                                    <p className="text-sm text-studio-charcoal">
                                        💡 <strong>Note:</strong> You'll set their role and metrics each week using "Update Weekly Metrics". Roles can change weekly!
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-studio-charcoal font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-studio-lime text-studio-charcoal font-semibold rounded-lg hover:bg-studio-lime/90 transition-colors"
                                    >
                                        Add Intern
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
