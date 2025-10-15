import React from 'react';
import { motion } from 'framer-motion';
import { InternCumulativeScore } from '../types';

interface CumulativeLeaderboardProps {
    interns: InternCumulativeScore[];
    onDelete?: (internId: string) => void;
    viewOnly?: boolean;
}

export default function CumulativeLeaderboard({ interns, onDelete, viewOnly = false }: CumulativeLeaderboardProps) {
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

    const handleDelete = (e: React.MouseEvent, internId: string, internName: string) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete ${internName}? This will remove all their data.`)) {
            onDelete?.(internId);
        }
    };

    if (interns.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">✨</div>
                <h3 className="text-xl font-semibold text-studio-charcoal mb-2">
                    No data available yet
                </h3>
                <p className="text-gray-600">
                    {viewOnly
                        ? "Check back soon for updated scores!"
                        : "Add intern profiles and weekly metrics to see the cumulative leaderboard."}
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
            <table className="w-full">
                <thead>
                    <tr className="bg-studio-forest text-white">
                        <th className="px-4 py-3 text-left text-sm font-semibold tracking-tighter-1">Rank</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold tracking-tighter-1">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold tracking-tighter-1">Weekly Scores</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold tracking-tighter-1">Total Score</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold tracking-tighter-1">Weeks Completed</th>
                        {!viewOnly && <th className="px-4 py-3 text-left text-sm font-semibold tracking-tighter-1">Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {interns.map((intern, index) => (
                        <motion.tr
                            key={intern.profile.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`border-b-2 transition-all hover:shadow-md ${getRankStyle(intern.rank)}`}
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
                                <div className="flex flex-wrap gap-2">
                                    {intern.weeklyScores.map((ws) => (
                                        <div
                                            key={ws.week}
                                            className="flex items-center gap-1"
                                            title={`${ws.week}: ${ws.score} points as ${ws.role}`}
                                        >
                                            <span className="text-xs font-medium text-gray-600">{ws.week}:</span>
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${ws.role === 'Strategist'
                                                ? 'bg-studio-lime/20 text-studio-forest'
                                                : 'bg-studio-forest/20 text-studio-forest'
                                                }`}>
                                                {ws.score}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <span className="text-2xl font-bold text-studio-forest">
                                    {intern.cumulativeTotal}
                                </span>
                            </td>
                            <td className="px-4 py-4">
                                <span className="text-sm text-gray-600">
                                    {intern.weeklyScores.length} {intern.weeklyScores.length === 1 ? 'week' : 'weeks'}
                                </span>
                            </td>
                            {!viewOnly && (
                                <td className="px-4 py-4">
                                    <button
                                        onClick={(e) => handleDelete(e, intern.profile.id, intern.profile.name)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete intern"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </td>
                            )}
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

