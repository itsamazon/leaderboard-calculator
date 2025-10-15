import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InternProfile, WeeklyMetrics, Role } from '../types';

interface UpdateMetricsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (metrics: Omit<WeeklyMetrics, 'internId'>, internId: string) => void;
    profiles: InternProfile[];
    currentWeek: string;
    weeklyStrategistIds: string[];
    existingWeekMetrics: WeeklyMetrics[];
    strategistAverageGrowth: number | null;
    existingMetric?: WeeklyMetrics;
}

export default function UpdateMetricsModal({
    isOpen,
    onClose,
    onUpdate,
    profiles,
    currentWeek,
    weeklyStrategistIds,
    existingWeekMetrics,
    strategistAverageGrowth,
    existingMetric
}: UpdateMetricsModalProps) {
    const [selectedInternId, setSelectedInternId] = useState('');

    // Use string for inputs to allow empty state
    const [igFollowers, setIgFollowers] = useState('');
    const [igViews, setIgViews] = useState('');
    const [igInteractions, setIgInteractions] = useState('');
    const [twitterFollowers, setTwitterFollowers] = useState('');
    const [twitterImpressions, setTwitterImpressions] = useState('');
    const [twitterEngagements, setTwitterEngagements] = useState('');

    const [creativity, setCreativity] = useState(0);
    const [proactivity, setProactivity] = useState(0);
    const [leadership, setLeadership] = useState(0);
    const [collaboration, setCollaboration] = useState(0);
    const [bonusFollowers, setBonusFollowers] = useState('');
    const [comments, setComments] = useState('');

    const selectedProfile = profiles.find(p => p.id === selectedInternId);
    const role: Role = weeklyStrategistIds.includes(selectedInternId) ? 'Strategist' : 'Support';

    // Check if all strategists are graded
    const strategistsGraded = useMemo(() => {
        const strategistMetrics = existingWeekMetrics.filter(m =>
            weeklyStrategistIds.includes(m.internId)
        );
        return strategistMetrics.length === weeklyStrategistIds.length;
    }, [existingWeekMetrics, weeklyStrategistIds]);

    // Filter available interns based on grading phase
    const availableInterns = useMemo(() => {
        const gradedInternIds = existingWeekMetrics.map(m => m.internId);

        if (!strategistsGraded) {
            // Phase 1: Show only UNGRADED strategists
            return profiles.filter(p =>
                weeklyStrategistIds.includes(p.id) && !gradedInternIds.includes(p.id)
            );
        } else {
            // Phase 2: Show only UNGRADED supports
            return profiles.filter(p =>
                !weeklyStrategistIds.includes(p.id) && !gradedInternIds.includes(p.id)
            );
        }
    }, [profiles, existingWeekMetrics, weeklyStrategistIds, strategistsGraded]);

    // Auto-fill social metrics from first graded strategist
    useEffect(() => {
        if (existingMetric) {
            // Editing existing metric
            setSelectedInternId(existingMetric.internId);
            setIgFollowers(String(existingMetric.socialMetrics.igFollowers));
            setIgViews(String(existingMetric.socialMetrics.igViews));
            setIgInteractions(String(existingMetric.socialMetrics.igInteractions));
            setTwitterFollowers(String(existingMetric.socialMetrics.twitterFollowers));
            setTwitterImpressions(String(existingMetric.socialMetrics.twitterImpressions));
            setTwitterEngagements(String(existingMetric.socialMetrics.twitterEngagements));
            setCreativity(existingMetric.manualScores.creativity);
            setProactivity(existingMetric.manualScores.proactivity);
            setLeadership(existingMetric.manualScores.leadership || 0);
            setCollaboration(existingMetric.manualScores.collaboration || 0);
            setBonusFollowers(String(existingMetric.bonusFollowers));
            setComments(existingMetric.comments || '');
        } else if (!strategistsGraded && existingWeekMetrics.length > 0) {
            // Auto-fill from first strategist's metrics when grading second strategist
            const firstStrategist = existingWeekMetrics.find(m =>
                weeklyStrategistIds.includes(m.internId)
            );

            if (firstStrategist) {
                setIgFollowers(String(firstStrategist.socialMetrics.igFollowers));
                setIgViews(String(firstStrategist.socialMetrics.igViews));
                setIgInteractions(String(firstStrategist.socialMetrics.igInteractions));
                setTwitterFollowers(String(firstStrategist.socialMetrics.twitterFollowers));
                setTwitterImpressions(String(firstStrategist.socialMetrics.twitterImpressions));
                setTwitterEngagements(String(firstStrategist.socialMetrics.twitterEngagements));
                // Don't auto-fill manual scores or bonus - those are individual
            }
        }
    }, [existingMetric, strategistsGraded, existingWeekMetrics, weeklyStrategistIds]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const metrics: Omit<WeeklyMetrics, 'internId'> = {
            week: currentWeek,
            role,
            socialMetrics: {
                igFollowers: Number(igFollowers) || 0,
                igViews: Number(igViews) || 0,
                igInteractions: Number(igInteractions) || 0,
                twitterFollowers: Number(twitterFollowers) || 0,
                twitterImpressions: Number(twitterImpressions) || 0,
                twitterEngagements: Number(twitterEngagements) || 0,
            },
            manualScores: {
                creativity,
                proactivity,
                ...(role === 'Strategist' ? { leadership } : { collaboration }),
            },
            bonusFollowers: Number(bonusFollowers) || 0,
            ...(role === 'Support' && strategistAverageGrowth !== null ? { basedOnStrategistGrowth: strategistAverageGrowth } : {}),
            comments: comments.trim() || undefined
        };

        onUpdate(metrics, selectedInternId);
        handleReset();
    };

    const handleReset = () => {
        setSelectedInternId('');
        setIgFollowers('');
        setIgViews('');
        setIgInteractions('');
        setTwitterFollowers('');
        setTwitterImpressions('');
        setTwitterEngagements('');
        setCreativity(0);
        setProactivity(0);
        setLeadership(0);
        setCollaboration(0);
        setBonusFollowers('');
        setComments('');
        onClose();
    };

    // Show phase info and completion message
    const phaseMessage = useMemo(() => {
        if (availableInterns.length === 0) {
            if (!strategistsGraded) {
                return { type: 'success', text: '✅ All strategists graded! Reopen to grade supports.' };
            } else {
                return { type: 'success', text: '✅ All interns graded for this week!' };
            }
        }

        if (!strategistsGraded) {
            return {
                type: 'info',
                text: `📊 Phase 1: Grade Strategists First (${existingWeekMetrics.filter(m => weeklyStrategistIds.includes(m.internId)).length}/${weeklyStrategistIds.length} done)`
            };
        } else {
            const totalSupports = profiles.length - weeklyStrategistIds.length;
            const gradedSupports = existingWeekMetrics.filter(m => !weeklyStrategistIds.includes(m.internId)).length;
            return {
                type: 'info',
                text: `📝 Phase 2: Grade Supports (${gradedSupports}/${totalSupports} done)`
            };
        }
    }, [availableInterns, strategistsGraded, existingWeekMetrics, weeklyStrategistIds, profiles]);

    // Show support growth info
    const showSupportGrowthInfo = role === 'Support' && strategistAverageGrowth !== null;

    // Close and show message if no interns available
    useEffect(() => {
        if (isOpen && availableInterns.length === 0 && !existingMetric) {
            // Auto-close after showing message
            const timer = setTimeout(() => {
                handleReset();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, availableInterns, existingMetric]);

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
                            <div className="sticky top-0 bg-studio-forest p-6 rounded-t-2xl z-10">
                                <h2 className="text-2xl font-bold text-white tracking-tighter-2">
                                    {existingMetric ? 'Edit' : 'Add'} Weekly Metrics
                                </h2>
                                <p className="text-studio-lime mt-1">Week: {currentWeek}</p>
                            </div>

                            {availableInterns.length === 0 && !existingMetric ? (
                                <div className="p-12 text-center">
                                    <div className={`text-6xl mb-4 ${phaseMessage.type === 'success' ? '🎉' : '⏳'}`}>
                                        {phaseMessage.type === 'success' ? '🎉' : '⏳'}
                                    </div>
                                    <p className="text-xl font-semibold text-studio-charcoal">
                                        {phaseMessage.text}
                                    </p>
                                    {!strategistsGraded && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            Close and reopen to grade supports
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                    {/* Phase Info Banner */}
                                    <div className={`p-4 rounded-lg border-2 ${phaseMessage.type === 'success'
                                        ? 'bg-green-50 border-green-500'
                                        : 'bg-studio-lime/10 border-studio-lime'
                                        }`}>
                                        <p className="text-sm font-semibold text-studio-charcoal">
                                            {phaseMessage.text}
                                        </p>
                                    </div>

                                    {/* Select Intern */}
                                    <div>
                                        <label className="block text-sm font-semibold text-studio-charcoal mb-2">
                                            {!strategistsGraded ? 'Select Strategist' : 'Select Support'}
                                        </label>
                                        <select
                                            value={selectedInternId}
                                            onChange={(e) => setSelectedInternId(e.target.value)}
                                            required
                                            disabled={!!existingMetric}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-studio-lime focus:outline-none transition-colors disabled:bg-gray-100"
                                        >
                                            <option value="">-- Choose an intern --</option>
                                            {availableInterns.map(profile => (
                                                <option key={profile.id} value={profile.id}>
                                                    {profile.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {selectedProfile && (
                                        <>
                                            {/* Role Display */}
                                            <div className="p-4 bg-studio-lime/10 border border-studio-lime rounded-lg">
                                                <p className="text-sm text-studio-charcoal">
                                                    <strong>{selectedProfile.name}</strong> is a <strong className="text-studio-forest">{role}</strong> for {currentWeek}
                                                </p>
                                            </div>

                                            {/* Support Growth Info */}
                                            {showSupportGrowthInfo && (
                                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <p className="text-sm text-blue-800">
                                                        ℹ️ <strong>Support Growth Auto-Calculated:</strong> Growth score will be based on strategist average ({strategistAverageGrowth.toFixed(2)} points)
                                                    </p>
                                                </div>
                                            )}

                                            {/* Only show social metrics for Strategists */}
                                            {role === 'Strategist' && (
                                                <>
                                                    {/* Auto-fill indicator */}
                                                    {!existingMetric && existingWeekMetrics.some(m => weeklyStrategistIds.includes(m.internId)) && (
                                                        <div className="p-3 bg-green-50 border border-green-500 rounded-lg">
                                                            <p className="text-sm text-green-800">
                                                                ✨ <strong>Social media metrics auto-filled</strong> from first strategist (same analytics used)
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Instagram Metrics */}
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-studio-forest mb-3">Instagram Metrics</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div>
                                                                <label className="block text-sm text-studio-charcoal mb-2">Followers</label>
                                                                <input
                                                                    type="number"
                                                                    value={igFollowers}
                                                                    onChange={(e) => setIgFollowers(e.target.value)}
                                                                    min="0"
                                                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-studio-lime focus:outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm text-studio-charcoal mb-2">Views</label>
                                                                <input
                                                                    type="number"
                                                                    value={igViews}
                                                                    onChange={(e) => setIgViews(e.target.value)}
                                                                    min="0"
                                                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-studio-lime focus:outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm text-studio-charcoal mb-2">Interactions</label>
                                                                <input
                                                                    type="number"
                                                                    value={igInteractions}
                                                                    onChange={(e) => setIgInteractions(e.target.value)}
                                                                    min="0"
                                                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-studio-lime focus:outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Twitter Metrics */}
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-studio-forest mb-3">Twitter Metrics</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div>
                                                                <label className="block text-sm text-studio-charcoal mb-2">Followers</label>
                                                                <input
                                                                    type="number"
                                                                    value={twitterFollowers}
                                                                    onChange={(e) => setTwitterFollowers(e.target.value)}
                                                                    min="0"
                                                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-studio-lime focus:outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm text-studio-charcoal mb-2">Impressions</label>
                                                                <input
                                                                    type="number"
                                                                    value={twitterImpressions}
                                                                    onChange={(e) => setTwitterImpressions(e.target.value)}
                                                                    min="0"
                                                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-studio-lime focus:outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm text-studio-charcoal mb-2">Engagements</label>
                                                                <input
                                                                    type="number"
                                                                    value={twitterEngagements}
                                                                    onChange={(e) => setTwitterEngagements(e.target.value)}
                                                                    min="0"
                                                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-studio-lime focus:outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Manual Evaluations */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-studio-forest mb-3">Manual Evaluations</h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm text-studio-charcoal mb-2">
                                                            Creativity (Max: {role === 'Strategist' ? '30' : '20'})
                                                        </label>
                                                        <input
                                                            type="range"
                                                            value={creativity}
                                                            onChange={(e) => setCreativity(Number(e.target.value))}
                                                            min="0"
                                                            max={role === 'Strategist' ? 30 : 20}
                                                            className="w-full accent-studio-lime"
                                                        />
                                                        <span className="text-sm font-semibold text-studio-lime">{creativity}</span>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm text-studio-charcoal mb-2">
                                                            Proactivity (Max: {role === 'Strategist' ? '20' : '10'})
                                                        </label>
                                                        <input
                                                            type="range"
                                                            value={proactivity}
                                                            onChange={(e) => setProactivity(Number(e.target.value))}
                                                            min="0"
                                                            max={role === 'Strategist' ? 20 : 10}
                                                            className="w-full accent-studio-lime"
                                                        />
                                                        <span className="text-sm font-semibold text-studio-lime">{proactivity}</span>
                                                    </div>

                                                    {role === 'Strategist' ? (
                                                        <div>
                                                            <label className="block text-sm text-studio-charcoal mb-2">Leadership (Max: 10)</label>
                                                            <input
                                                                type="range"
                                                                value={leadership}
                                                                onChange={(e) => setLeadership(Number(e.target.value))}
                                                                min="0"
                                                                max="10"
                                                                className="w-full accent-studio-lime"
                                                            />
                                                            <span className="text-sm font-semibold text-studio-lime">{leadership}</span>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <label className="block text-sm text-studio-charcoal mb-2">Collaboration (Max: 20)</label>
                                                            <input
                                                                type="range"
                                                                value={collaboration}
                                                                onChange={(e) => setCollaboration(Number(e.target.value))}
                                                                min="0"
                                                                max="20"
                                                                className="w-full accent-studio-lime"
                                                            />
                                                            <span className="text-sm font-semibold text-studio-lime">{collaboration}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Bonus */}
                                            <div>
                                                <label className="block text-sm font-semibold text-studio-charcoal mb-2">
                                                    Bonus Followers (Studio X Brands)
                                                </label>
                                                <p className="text-xs text-gray-600 mb-2">
                                                    +5 points per 10 followers contributed to @studioxhub, @genesystechhub, @_codeville, @drinkeightwater, @enuguairlines
                                                </p>
                                                <input
                                                    type="number"
                                                    value={bonusFollowers}
                                                    onChange={(e) => setBonusFollowers(e.target.value)}
                                                    min="0"
                                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-studio-lime focus:outline-none"
                                                />
                                            </div>

                                            {/* Comments */}
                                            <div>
                                                <label className="block text-sm font-semibold text-studio-charcoal mb-2">
                                                    Weekly Comments/Notes
                                                </label>
                                                <textarea
                                                    value={comments}
                                                    onChange={(e) => setComments(e.target.value)}
                                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-studio-lime focus:outline-none resize-none"
                                                    placeholder="Add notes about this intern's performance this week..."
                                                    rows={3}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Actions */}
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
                                            disabled={!selectedInternId}
                                            className="flex-1 px-6 py-3 bg-studio-lime text-studio-charcoal font-semibold rounded-lg hover:bg-studio-lime/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {existingMetric ? 'Update' : 'Save'} Metrics
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
