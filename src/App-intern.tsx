import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { InternProfile, WeeklyMetrics, InternWithScore, InternCumulativeScore, WeeklyStrategists } from './types';
import { calculateScore } from './utils/scoring';
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
    const [viewMode, setViewMode] = useState<'weekly' | 'cumulative'>('weekly');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
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
                    const weeks = strategistsData.map(ws => ws.week).sort((a, b) => {
                        const aNum = parseInt(a.match(/\d+/)?.[0] || '0');
                        const bNum = parseInt(b.match(/\d+/)?.[0] || '0');
                        return aNum - bNum;
                    });
                    setCurrentWeek(weeks[weeks.length - 1]);
                }
                setError(null);
            } catch (err) {
                console.error('Error loading data:', err);
                let errorMessage = err instanceof Error ? err.message : 'Failed to load data. Please check the console for details.';

                // Check for CORS errors specifically
                if (errorMessage.includes('CORS') || errorMessage.includes('Failed to fetch') || errorMessage.includes('Network Error')) {
                    errorMessage = 'CORS Error: Backend is not allowing requests from localhost:3000. Please update ALLOWED_ORIGINS in Vercel to include http://localhost:3000 and redeploy the backend. See UPDATE-VERCEL-CORS.md for instructions.';
                    console.error('🚨 CORS Error Detected!', errorMessage);
                }

                setError(errorMessage);
                console.error('Full error details:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Derive weeks from weeklyStrategists
    const weeks = useMemo(() => {
        return weeklyStrategists.map(ws => ws.week).sort((a, b) => {
            const aNum = parseInt(a.match(/\d+/)?.[0] || '0');
            const bNum = parseInt(b.match(/\d+/)?.[0] || '0');
            return aNum - bNum;
        });
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

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            const [profilesData, strategistsData, metricsData] = await Promise.all([
                getInternProfiles(),
                getWeeklyStrategists(),
                getWeeklyMetrics(),
            ]);
            setProfiles(profilesData);
            setWeeklyStrategists(strategistsData);
            setWeeklyMetrics(metricsData);
        } catch (err) {
            console.error('Error refreshing data:', err);
        } finally {
            setRefreshing(false);
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
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="bg-studio-forest rounded-2xl p-6 shadow-lg">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white rounded-xl p-2 flex items-center justify-center shadow-md">
                                    <img
                                        src="/logo.svg"
                                        alt="Studio X"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter-2 text-white">
                                        Studiox Interns Leaderboard
                                    </h1>
                                    <p className="text-studio-lime mt-1 tracking-tighter-1 font-medium">
                                        The Spot Where Growth Thrives
                                    </p>
                                </div>
                            </div>

                            {topIntern && (
                                <div className="bg-studio-lime px-4 py-2 rounded-lg shadow-md">
                                    <p className="text-xs text-studio-forest/70 font-medium">Overall Leader</p>
                                    <p className="text-lg font-bold text-studio-forest">{topIntern.profile.name}</p>
                                    <p className="text-sm text-studio-forest/80 font-medium">{topIntern.cumulativeTotal.toFixed(1)} pts</p>
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
                    <div className="inline-flex rounded-lg bg-white p-1 border border-gray-200 shadow-sm">
                        <button
                            onClick={() => setViewMode('weekly')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'weekly'
                                ? 'bg-studio-lime text-studio-forest shadow-md'
                                : 'text-gray-600 hover:text-studio-forest hover:bg-gray-50'
                                }`}
                        >
                            📅 Weekly View
                        </button>
                        <button
                            onClick={() => setViewMode('cumulative')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'cumulative'
                                ? 'bg-studio-lime text-studio-forest shadow-md'
                                : 'text-gray-600 hover:text-studio-forest hover:bg-gray-50'
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
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-studio-forest font-medium focus:outline-none focus:ring-2 focus:ring-studio-lime focus:border-studio-lime shadow-sm"
                                >
                                    {weeks.map(week => (
                                        <option key={week} value={week}>{week}</option>
                                    ))}
                                </select>
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

                {/* Floating Refresh Button */}
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="fixed bottom-8 right-8 bg-studio-forest text-studio-lime px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:bg-studio-forest/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-bold border-2 border-studio-lime"
                    title="Refresh data"
                >
                    <svg
                        className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>

                {/* Loading Overlay */}
                {refreshing && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40">
                        <div className="bg-white rounded-xl p-8 shadow-2xl text-center border-2 border-studio-lime">
                            <div className="w-16 h-16 border-4 border-studio-lime border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-studio-forest text-lg font-bold">Refreshing data...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
