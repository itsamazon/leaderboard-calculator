import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InternWithScore, WeeklyMetrics } from '../types';
import BreakdownCard from './BreakdownCard';

interface LeaderboardTableProps {
    interns: InternWithScore[];
    onDelete?: (metricId: string) => void;
    onEdit?: (metric: WeeklyMetrics) => void;
    viewOnly?: boolean;
}

export default function LeaderboardTable({ interns, onDelete, onEdit, viewOnly = false }: LeaderboardTableProps) {
    const [selectedIntern, setSelectedIntern] = useState<InternWithScore | null>(null);

    const getRankStyle = (rank: number) => {
        switch (rank) {
            case 1:
                return 'glow-lime bg-studio-lime/10 border-studio-lime';
            case 2:
                return 'glow-forest bg-studio-forest/5 border-studio-forest/30';
            case 3:
                return 'bg-gray-50 border-gray-300';
            default:
                return 'bg-white border-gray-200';
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return '🥇';
            case 2:
                return '🥈';
            case 3:
                return '🥉';
            default:
                return rank;
        }
    };

    const handleDelete = (e: React.MouseEvent, metricId: string | undefined, internName: string, week: string) => {
        e.stopPropagation();
        if (!metricId) {
            alert('Cannot delete: Metric ID not found');
            return;
        }
        if (window.confirm(`Are you sure you want to delete ${internName}'s ${week} metrics?`)) {
            onDelete?.(metricId);
        }
    };

    if (interns.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">✨</div>
                <h3 className="text-xl font-semibold text-studio-charcoal mb-2">
                    No data for this week yet
                </h3>
                <p className="text-gray-600">
                    {viewOnly
                        ? "Check back soon for updated scores!"
                        : "Add intern profiles, then update their weekly metrics to see the leaderboard."}
                </p>
            </div>
        );
    }

    return (
        <>
            {viewOnly && (
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900 font-medium">
                        💡 <span className="font-bold">Tip:</span> Click on any row to view detailed breakdown and weekly feedback from your mentor!
                    </p>
                </div>
            )}
            <div className="overflow-x-auto bg-white rounded-xl shadow-md">
                <table className="w-full">
                    <thead>
                        <tr className="bg-studio-forest text-white">
                            <th className="px-4 py-3 text-left text-sm font-semibold tracking-tighter-1">Rank</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold tracking-tighter-1">Name</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold tracking-tighter-1">Role</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold tracking-tighter-1">Growth</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold tracking-tighter-1">Creativity</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold tracking-tighter-1">Proactivity</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold tracking-tighter-1">Leadership/Collab</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold tracking-tighter-1">Bonus</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold tracking-tighter-1">Total</th>
                            {!viewOnly && <th className="px-4 py-3 text-left text-sm font-semibold tracking-tighter-1">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {interns.map((intern, index) => (
                            <motion.tr
                                key={`${intern.profile.id}-${intern.weeklyMetrics.week}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelectedIntern(intern)}
                                className={`border-b-2 transition-all cursor-pointer hover:shadow-md ${getRankStyle(intern.rank)}`}
                            >
                                <td className="px-4 py-4">
                                    <span className="text-lg font-bold">
                                        {getRankIcon(intern.rank)}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="font-semibold text-studio-charcoal">{intern.profile.name}</span>
                                </td>
                                <td className="px-4 py-4">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${intern.weeklyMetrics.role === 'Strategist'
                                        ? 'bg-studio-lime text-studio-charcoal'
                                        : 'bg-studio-forest text-white'
                                        }`}>
                                        {intern.weeklyMetrics.role}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[60px]">
                                            <div
                                                className="bg-studio-lime h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${(intern.score.growth / (intern.weeklyMetrics.role === 'Strategist' ? 40 : 20)) * 100}%`
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-studio-charcoal">
                                            {intern.score.growth}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[60px]">
                                            <div
                                                className="bg-studio-lime h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${(intern.score.creativity / (intern.weeklyMetrics.role === 'Strategist' ? 30 : 20)) * 100}%`
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-studio-charcoal">
                                            {intern.score.creativity}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[60px]">
                                            <div
                                                className="bg-studio-lime h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${(intern.score.proactivity / (intern.weeklyMetrics.role === 'Strategist' ? 20 : 10)) * 100}%`
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-studio-charcoal">
                                            {intern.score.proactivity}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[60px]">
                                            <div
                                                className="bg-studio-lime h-2 rounded-full transition-all"
                                                style={{
                                                    width: intern.weeklyMetrics.role === 'Strategist'
                                                        ? `${(intern.score.leadership! / 10) * 100}%`
                                                        : `${(intern.score.collaboration! / 20) * 100}%`
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-studio-charcoal">
                                            {intern.weeklyMetrics.role === 'Strategist' ? intern.score.leadership : intern.score.collaboration}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <span className={`text-sm font-semibold ${intern.score.bonus > 0 ? 'text-studio-lime' : 'text-gray-400'
                                        }`}>
                                        {intern.score.bonus > 0 ? `+${intern.score.bonus}` : '—'}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="text-lg font-bold text-studio-forest">
                                        {intern.score.total}
                                    </span>
                                </td>
                                {!viewOnly && (
                                    <td className="px-4 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit?.(intern.weeklyMetrics);
                                                }}
                                                className="p-2 text-studio-forest hover:bg-studio-lime/20 rounded-lg transition-colors"
                                                title="Edit scores"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(e, intern.weeklyMetrics.id, intern.profile.name, intern.weeklyMetrics.week)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete this week's metrics"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {selectedIntern && (
                    <BreakdownCard
                        intern={selectedIntern}
                        onClose={() => setSelectedIntern(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
