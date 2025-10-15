import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { InternProfile, WeeklyMetrics, InternWithScore, InternCumulativeScore, WeeklyStrategists } from './types';
import { calculateScore } from './utils/scoring';
import { exportToCSV, exportToPDF } from './utils/export';
import {
    getInternProfiles,
    getWeeklyStrategists,
    getWeeklyMetrics,
} from './lib/database-api';
import BreakdownCard from './components/BreakdownCard';
import LeaderboardTable from './components/LeaderboardTable';
import CumulativeLeaderboard from './components/CumulativeLeaderboard';

function App() {
    const [profiles, setProfiles] = useState<InternProfile[]>([]);
    const [weeklyMetrics, setWeeklyMetrics] = useState<WeeklyMetrics[]>([]);
    const [weeklyStrategists, setWeeklyStrategists] = useState<WeeklyStrategists[]>([]);
    const [currentWeek, setCurrentWeek] = useState<string>('');
    const [selectedBreakdown, setSelectedBreakdown] = useState<InternWithScore | null>(null);
    const [viewMode, setViewMode] = useState<'weekly' | 'cumulative'>('cumulative');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load data from backend
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [profilesData, strategistsData, metricsData] = await Promise.all([
                    getInternProfiles(),
                    getWeeklyStrategists(),
                    getWeeklyMetrics(),
                ]);

                setProfiles(profilesData);
                setWeeklyStrategists(strategistsData);
                setWeeklyMetrics(metricsData);

                // Set current week to the latest week
                if (strategistsData.length > 0) {
                    const weeks = strategistsData.map(ws => ws.week).sort();
                    setCurrentWeek(weeks[weeks.length - 1]);
                }
                setError(null);
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load data. Please refresh the page.');
            } finally {
                setLoading(false);
            }
        };

        loadData();

        // Poll for updates every 10 seconds
        const interval = setInterval(loadData, 10000);

        return () => clearInterval(interval);
    }, []);

    // Derive weeks from weeklyStrategists
    const weeks = useMemo(() => {
        return weeklyStrategists.map(ws => ws.week).sort();
    }, [weeklyStrategists]);

    // Calculate weekly scores for current week
    const weeklyScores = useMemo(() => {
        if (!currentWeek) return [];

        const currentWeekMetrics = weeklyMetrics.filter(m => m.week === currentWeek);
        const currentWeekStrategists = weeklyStrategists.find(ws => ws.week === currentWeek);

        if (!currentWeekStrategists) return [];

        const scores = currentWeekMetrics
            .map(metrics => {
                const profile = profiles.find(p => p.id === metrics.internId);
                if (!profile) return null;

                const isStrategist = currentWeekStrategists.strategistIds.includes(metrics.internId);
                const role = isStrategist ? 'Strategist' : 'Support';

                const score = calculateScore(
                    role,
                    metrics.socialMetrics,
                    metrics.manualScores,
                    metrics.bonusFollowers,
                    metrics.basedOnStrategistGrowth
                );

                return {
                    profile: {
                        id: profile.id,
                        name: profile.name,
                        notes: profile.notes,
                    },
                    weeklyMetrics: metrics,
                    score,
                    rank: 0, // Will be calculated below
                };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);

        // Sort by total score and assign ranks
        scores.sort((a, b) => b.score.total - a.score.total);
        scores.forEach((item, index) => {
            item.rank = index + 1;
        });

        return scores;
    }, [profiles, weeklyMetrics, weeklyStrategists, currentWeek]);

    // Calculate cumulative scores
    const cumulativeScores = useMemo(() => {
        const internTotals = new Map<string, { profile: InternProfile; total: number; weeklyScores: { week: string; score: number; role: 'Strategist' | 'Support' }[] }>();

        weeklyMetrics.forEach(metrics => {
            const profile = profiles.find(p => p.id === metrics.internId);
            if (!profile) return;

            const currentWeekStrategists = weeklyStrategists.find(ws => ws.week === metrics.week);
            if (!currentWeekStrategists) return;

            const isStrategist = currentWeekStrategists.strategistIds.includes(metrics.internId);
            const role = isStrategist ? 'Strategist' : 'Support';

            const score = calculateScore(
                role,
                metrics.socialMetrics,
                metrics.manualScores,
                metrics.bonusFollowers,
                metrics.basedOnStrategistGrowth
            );

            if (!internTotals.has(metrics.internId)) {
                internTotals.set(metrics.internId, {
                    profile,
                    total: 0,
                    weeklyScores: []
                });
            }

            const internData = internTotals.get(metrics.internId)!;
            internData.total += score.total;
            internData.weeklyScores.push({
                week: metrics.week,
                score: score.total,
                role
            });
        });

        const result: InternCumulativeScore[] = Array.from(internTotals.values())
            .map(({ profile, total, weeklyScores }) => ({
                profile,
                cumulativeTotal: total,
                weeklyScores,
                rank: 0
            }))
            .sort((a, b) => b.cumulativeTotal - a.cumulativeTotal);

        result.forEach((item, index) => {
            item.rank = index + 1;
        });

        return result;
    }, [profiles, weeklyMetrics, weeklyStrategists]);

    // Get top intern from cumulative scores
    const topIntern = cumulativeScores[0] || null;

    const handleExportCSV = () => {
        if (viewMode === 'weekly') {
            exportToCSV(weeklyScores, currentWeek);
        }
    };

    const handleExportPDF = () => {
        if (viewMode === 'weekly') {
            exportToPDF(weeklyScores, currentWeek);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-studio-forest via-studio-forest-light to-studio-sage flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-studio-lime border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-xl">Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-studio-forest via-studio-forest-light to-studio-sage flex items-center justify-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-studio-forest via-studio-forest-light to-studio-sage">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white rounded-xl p-2 flex items-center justify-center">
                                    <img
                                        src="/logo.svg"
                                        alt="Studio X"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter-2 text-white">
                                        Studio X Intern Leaderboard
                                        <span className="ml-3 text-lg bg-blue-600 text-white px-3 py-1 rounded-full">
                                            👀 Intern View
                                        </span>
                                    </h1>
                                    <p className="text-studio-lime mt-1 tracking-tighter-1">
                                        The Spot Where Growth Thrives
                                    </p>
                                </div>
                            </div>

                            {topIntern && (
                                <div className="bg-studio-lime/20 px-4 py-2 rounded-lg border border-studio-lime/50">
                                    <p className="text-xs text-studio-lime/80">Overall Leader</p>
                                    <p className="text-lg font-bold text-studio-lime">{topIntern.profile.name}</p>
                                    <p className="text-sm text-studio-lime/90">{topIntern.cumulativeTotal.toFixed(1)} pts</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* View Toggle and Export */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                >
                    <div className="inline-flex rounded-lg bg-white/10 backdrop-blur-md p-1 border border-white/20">
                        <button
                            onClick={() => setViewMode('weekly')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'weekly'
                                ? 'bg-studio-lime text-studio-forest shadow-lg'
                                : 'text-white/70 hover:text-white'
                                }`}
                        >
                            📅 Weekly View
                        </button>
                        <button
                            onClick={() => setViewMode('cumulative')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'cumulative'
                                ? 'bg-studio-lime text-studio-forest shadow-lg'
                                : 'text-white/70 hover:text-white'
                                }`}
                        >
                            📊 Cumulative View
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        {viewMode === 'weekly' && (
                            <>
                                <select
                                    value={currentWeek}
                                    onChange={(e) => setCurrentWeek(e.target.value)}
                                    className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-studio-lime"
                                >
                                    {weeks.map(week => (
                                        <option key={week} value={week} className="bg-studio-forest">{week}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleExportCSV}
                                    className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                                >
                                    📥 CSV
                                </button>
                                <button
                                    onClick={handleExportPDF}
                                    className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                                >
                                    📄 PDF
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Leaderboard */}
                {viewMode === 'weekly' ? (
                    <LeaderboardTable
                        interns={weeklyScores}
                        viewOnly={true}
                    />
                ) : (
                    <CumulativeLeaderboard
                        interns={cumulativeScores}
                        viewOnly={true}
                    />
                )}

                {/* Breakdown Modal */}
                {selectedBreakdown && (
                    <BreakdownCard
                        intern={selectedBreakdown}
                        onClose={() => setSelectedBreakdown(null)}
                    />
                )}
            </div>
        </div>
    );
}

export default App;
