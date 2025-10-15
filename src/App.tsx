import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { InternProfile, WeeklyMetrics, InternWithScore, InternCumulativeScore, WeeklyStrategists } from './types';
import { calculateScore } from './utils/scoring';
import { saveProfiles, loadProfiles, saveWeeklyMetrics, loadWeeklyMetrics, saveWeeklyStrategists, loadWeeklyStrategists } from './utils/storage';
import { exportToCSV, exportToPDF } from './utils/export';
import { seedProfiles, seedWeeklyMetrics, seedWeeklyStrategists } from './data/seedData';
import AddInternModal from './components/AddInternModal';
import UpdateMetricsModal from './components/UpdateMetricsModal';
import SelectStrategistsModal from './components/SelectStrategistsModal';
import ManageWeeksModal from './components/ManageWeeksModal';
import ManageInternsModal from './components/ManageInternsModal';
import LeaderboardTable from './components/LeaderboardTable';
import CumulativeLeaderboard from './components/CumulativeLeaderboard';

type FilterType = 'All' | 'Strategist' | 'Support';
type ViewMode = 'weekly' | 'cumulative';

function App() {
    const [profiles, setProfiles] = useState<InternProfile[]>([]);
    const [weeklyMetrics, setWeeklyMetrics] = useState<WeeklyMetrics[]>([]);
    const [weeklyStrategists, setWeeklyStrategists] = useState<WeeklyStrategists[]>([]);
    const [isAddInternOpen, setIsAddInternOpen] = useState(false);
    const [isSelectStrategistsOpen, setIsSelectStrategistsOpen] = useState(false);
    const [isUpdateMetricsOpen, setIsUpdateMetricsOpen] = useState(false);
    const [isManageWeeksOpen, setIsManageWeeksOpen] = useState(false);
    const [isManageInternsOpen, setIsManageInternsOpen] = useState(false);
    const [pendingNewWeekName, setPendingNewWeekName] = useState('');
    const [editingMetric, setEditingMetric] = useState<WeeklyMetrics | undefined>();
    const [filter, setFilter] = useState<FilterType>('All');
    const [currentWeek, setCurrentWeek] = useState('Week 1');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [viewOnly, setViewOnly] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('weekly');


    // Load data on mount
    useEffect(() => {
        const loadedProfiles = loadProfiles();
        const loadedMetrics = loadWeeklyMetrics();
        const loadedStrategists = loadWeeklyStrategists();

        if (loadedProfiles.length === 0) {
            setProfiles(seedProfiles);
            saveProfiles(seedProfiles);
        } else {
            setProfiles(loadedProfiles);
        }

        if (loadedMetrics.length === 0) {
            setWeeklyMetrics(seedWeeklyMetrics);
            saveWeeklyMetrics(seedWeeklyMetrics);
        } else {
            setWeeklyMetrics(loadedMetrics);
        }

        if (loadedStrategists.length === 0) {
            setWeeklyStrategists(seedWeeklyStrategists);
            saveWeeklyStrategists(seedWeeklyStrategists);
        } else {
            setWeeklyStrategists(loadedStrategists);
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (profiles.length > 0) saveProfiles(profiles);
    }, [profiles]);

    useEffect(() => {
        if (weeklyMetrics.length > 0) saveWeeklyMetrics(weeklyMetrics);
    }, [weeklyMetrics]);

    useEffect(() => {
        if (weeklyStrategists.length > 0) saveWeeklyStrategists(weeklyStrategists);
    }, [weeklyStrategists]);

    const weeks = useMemo(() => {
        // Get all weeks from strategist assignments (the source of truth for created weeks)
        const strategistWeeks = weeklyStrategists.map(ws => ws.week);

        if (strategistWeeks.length === 0) return [];

        // Sort weeks numerically
        return strategistWeeks.sort((a, b) => {
            const aNum = parseInt(a.match(/\d+/)?.[0] || '0');
            const bNum = parseInt(b.match(/\d+/)?.[0] || '0');
            return aNum - bNum;
        });
    }, [weeklyStrategists]);

    useEffect(() => {
        if (weeks.length > 0 && !weeks.includes(currentWeek)) {
            setCurrentWeek(weeks[weeks.length - 1]);
        } else if (weeks.length > 0 && !currentWeek) {
            setCurrentWeek(weeks[0]);
        }
    }, [weeks, currentWeek]);

    // Get next week suggestion based on existing strategist assignments
    const suggestedNextWeek = useMemo(() => {
        if (weeklyStrategists.length === 0) return 'Week 1';

        const existingWeeks = weeklyStrategists.map(ws => ws.week);
        const weekNumbers = existingWeeks
            .map(w => {
                const match = w.match(/Week (\d+)/);
                return match ? parseInt(match[1]) : 0;
            })
            .filter(n => n > 0);

        if (weekNumbers.length > 0) {
            const maxWeek = Math.max(...weekNumbers);
            return `Week ${maxWeek + 1}`;
        }
        return `Week ${existingWeeks.length + 1}`;
    }, [weeklyStrategists]);

    // Get strategists for current week/selected week
    const getCurrentWeekStrategistIds = (week: string): string[] => {
        const weekData = weeklyStrategists.find(ws => ws.week === week);
        return weekData?.strategistIds || [];
    };

    // Calculate strategist average growth for a week
    const getStrategistAverageGrowth = (week: string): number | null => {
        const strategistIds = getCurrentWeekStrategistIds(week);
        const strategistMetrics = weeklyMetrics.filter(m =>
            m.week === week && strategistIds.includes(m.internId)
        );

        if (strategistMetrics.length === 0) return null;

        const growthScores = strategistMetrics.map(m => {
            const score = calculateScore(m.role, m.socialMetrics, m.manualScores, m.bonusFollowers);
            return score.growth;
        });

        const average = growthScores.reduce((sum, g) => sum + g, 0) / growthScores.length;
        return average;
    };

    // Calculate weekly scores
    const internsWithScores: InternWithScore[] = useMemo(() => {
        const currentWeekMetrics = weeklyMetrics.filter(m => m.week === currentWeek);

        const withScores = currentWeekMetrics
            .map(metrics => {
                const profile = profiles.find(p => p.id === metrics.internId);
                if (!profile) return null;

                if (filter !== 'All' && metrics.role !== filter) return null;

                const score = calculateScore(
                    metrics.role,
                    metrics.socialMetrics,
                    metrics.manualScores,
                    metrics.bonusFollowers,
                    metrics.basedOnStrategistGrowth
                );

                return {
                    profile,
                    weeklyMetrics: metrics,
                    score,
                    rank: 0,
                };
            })
            .filter(Boolean) as InternWithScore[];

        withScores.sort((a, b) => b.score.total - a.score.total);
        withScores.forEach((intern, index) => {
            intern.rank = index + 1;
        });

        return withScores;
    }, [profiles, weeklyMetrics, currentWeek, filter]);

    // Calculate cumulative scores
    const cumulativeScores: InternCumulativeScore[] = useMemo(() => {
        const internScores = new Map<string, InternCumulativeScore>();

        profiles.forEach(profile => {
            const internMetrics = weeklyMetrics.filter(m => m.internId === profile.id);

            const filteredMetrics = filter === 'All'
                ? internMetrics
                : internMetrics.filter(m => m.role === filter);

            if (filteredMetrics.length === 0) return;

            const weeklyScores = filteredMetrics.map(metrics => {
                const score = calculateScore(
                    metrics.role,
                    metrics.socialMetrics,
                    metrics.manualScores,
                    metrics.bonusFollowers,
                    metrics.basedOnStrategistGrowth
                );
                return {
                    week: metrics.week,
                    score: score.total,
                    role: metrics.role,
                };
            });

            const cumulativeTotal = weeklyScores.reduce((sum, ws) => sum + ws.score, 0);

            internScores.set(profile.id, {
                profile,
                weeklyScores,
                cumulativeTotal,
                rank: 0,
            });
        });

        const scores = Array.from(internScores.values());
        scores.sort((a, b) => b.cumulativeTotal - a.cumulativeTotal);
        scores.forEach((intern, index) => {
            intern.rank = index + 1;
        });

        return scores;
    }, [profiles, weeklyMetrics, filter]);


    const handleAddIntern = (newProfile: Omit<InternProfile, 'id'>) => {
        const profile: InternProfile = {
            ...newProfile,
            id: Date.now().toString(),
        };
        setProfiles(prev => [...prev, profile]);
        setIsAddInternOpen(false);
    };

    const handleSelectStrategists = (strategistIds: string[]) => {
        const weekToUse = pendingNewWeekName;

        const weekData: WeeklyStrategists = {
            week: weekToUse,
            strategistIds,
        };

        setWeeklyStrategists(prev => {
            const existing = prev.find(ws => ws.week === weekToUse);
            if (existing) {
                return prev.map(ws => ws.week === weekToUse ? weekData : ws);
            }
            return [...prev, weekData];
        });

        // Create a dummy metric to make the week appear in dropdown
        const dummyMetric: WeeklyMetrics = {
            internId: 'temp-' + Date.now(),
            week: weekToUse,
            role: 'Strategist',
            socialMetrics: {
                igFollowers: 0,
                igViews: 0,
                igInteractions: 0,
                twitterFollowers: 0,
                twitterImpressions: 0,
                twitterEngagements: 0,
            },
            manualScores: {
                creativity: 0,
                proactivity: 0,
                leadership: 0,
            },
            bonusFollowers: 0,
        };

        // Add dummy metric temporarily (will be replaced with real data)
        setWeeklyMetrics(prev => [...prev, dummyMetric]);

        // Switch to the new week and open grading
        setCurrentWeek(weekToUse);
        setIsSelectStrategistsOpen(false);
        setIsUpdateMetricsOpen(true);
        setPendingNewWeekName('');

        // Remove dummy metric after a short delay
        setTimeout(() => {
            setWeeklyMetrics(prev => prev.filter(m => !m.internId.startsWith('temp-')));
        }, 500);
    };

    const handleUpdateMetrics = (metrics: Omit<WeeklyMetrics, 'internId'>, internId: string) => {
        const existing = weeklyMetrics.find(
            m => m.internId === internId && m.week === metrics.week
        );

        if (existing) {
            setWeeklyMetrics(prev =>
                prev.map(m =>
                    m.internId === internId && m.week === metrics.week
                        ? { ...m, ...metrics }
                        : m
                )
            );
        } else {
            setWeeklyMetrics(prev => [...prev, { ...metrics, internId }]);
        }
        setEditingMetric(undefined);
        setIsUpdateMetricsOpen(false);
    };

    const handleDeleteIntern = (internId: string) => {
        setProfiles(prev => prev.filter(p => p.id !== internId));
        setWeeklyMetrics(prev => prev.filter(m => m.internId !== internId));
        // Also remove from weekly strategists if they were assigned
        setWeeklyStrategists(prev =>
            prev.map(ws => ({
                ...ws,
                strategistIds: ws.strategistIds.filter(id => id !== internId)
            })).filter(ws => ws.strategistIds.length > 0)
        );
    };

    const handleUpdateProfile = (internId: string, updates: Partial<InternProfile>) => {
        setProfiles(prev => prev.map(p => p.id === internId ? { ...p, ...updates } : p));
    };


    const handleEditWeekStrategists = (week: string, strategistIds: string[]) => {
        setWeeklyStrategists(prev =>
            prev.map(ws => ws.week === week ? { ...ws, strategistIds } : ws)
        );
    };

    const handleDeleteWeek = (week: string) => {
        setWeeklyStrategists(prev => prev.filter(ws => ws.week !== week));
        setWeeklyMetrics(prev => prev.filter(m => m.week !== week));

        // Switch to another week if current week was deleted
        if (currentWeek === week && weeks.length > 1) {
            const remainingWeeks = weeks.filter(w => w !== week);
            setCurrentWeek(remainingWeeks[remainingWeeks.length - 1]);
        }
    };

    const handleAddNewWeek = () => {
        const newWeekName = suggestedNextWeek;
        setPendingNewWeekName(newWeekName);
        setIsSelectStrategistsOpen(true);
    };

    const handleStartGrading = () => {
        // Check if current week has strategists selected
        const currentWeekStrategists = weeklyStrategists.find(ws => ws.week === currentWeek);

        if (!currentWeekStrategists) {
            // Need to select strategists first for current week
            setPendingNewWeekName(currentWeek);
            setIsSelectStrategistsOpen(true);
        } else {
            // Strategists already selected, go straight to grading
            setIsUpdateMetricsOpen(true);
        }
    };

    const handleEditMetric = (metric: WeeklyMetrics) => {
        setEditingMetric(metric);
        setIsUpdateMetricsOpen(true);
    };

    const handleExportCSV = () => {
        if (viewMode === 'weekly') {
            exportToCSV(internsWithScores, currentWeek);
        } else {
            const headers = ['Rank', 'Name', 'Total Score', 'Weeks Completed', 'Weekly Breakdown'];
            const rows = cumulativeScores.map(intern => [
                intern.rank,
                intern.profile.name,
                intern.cumulativeTotal,
                intern.weeklyScores.length,
                intern.weeklyScores.map(ws => `${ws.week}:${ws.score}`).join(' | ')
            ]);

            const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `studio-x-cumulative-leaderboard.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleExportPDF = () => {
        if (viewMode === 'weekly') {
            exportToPDF(internsWithScores, currentWeek);
        }
    };

    const currentWeekStrategistIds = getCurrentWeekStrategistIds(currentWeek);
    const currentWeekMetrics = weeklyMetrics.filter(m => m.week === currentWeek);
    const strategistAverageGrowth = getStrategistAverageGrowth(currentWeek);

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-studio-forest' : 'bg-gray-50'} transition-colors`}>
            {/* Header */}
            <header className={`${isDarkMode ? 'bg-studio-charcoal' : 'bg-studio-forest'} text-white`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex items-center justify-center">
                                <img
                                    src="/logo.svg"
                                    alt="Studio X"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter-2">
                                    Studio X Intern Leaderboard
                                </h1>
                                <p className="text-studio-lime mt-1 tracking-tighter-1">
                                    The Spot Where Growth Thrives
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setViewOnly(!viewOnly)}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${viewOnly
                                    ? 'bg-studio-lime text-studio-charcoal'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                {viewOnly ? '👁️ View Mode' : '⚙️ Admin Mode'}
                            </button>
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className="p-2 rounded-lg bg-studio-lime/10 hover:bg-studio-lime/20 transition-colors"
                            >
                                {isDarkMode ? '☀️' : '🌙'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Controls Bar */}
                <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
                            {/* View Mode */}
                            <div>
                                <label className="block text-sm font-semibold text-studio-charcoal mb-2">View Mode</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setViewMode('weekly')}
                                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${viewMode === 'weekly'
                                            ? 'bg-studio-lime text-studio-charcoal shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        📅 Weekly
                                    </button>
                                    <button
                                        onClick={() => setViewMode('cumulative')}
                                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${viewMode === 'cumulative'
                                            ? 'bg-studio-lime text-studio-charcoal shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        📊 Cumulative
                                    </button>
                                </div>
                            </div>

                            {viewMode === 'weekly' && (
                                <div>
                                    <label className="block text-sm font-semibold text-studio-charcoal mb-2">Select Week</label>
                                    <select
                                        value={currentWeek}
                                        onChange={(e) => setCurrentWeek(e.target.value)}
                                        className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-studio-lime focus:outline-none"
                                    >
                                        {weeks.map(week => (
                                            <option key={week} value={week}>{week}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-studio-charcoal mb-2">Filter by Role</label>
                                <div className="flex gap-2">
                                    {(['All', 'Strategist', 'Support'] as FilterType[]).map(filterType => (
                                        <button
                                            key={filterType}
                                            onClick={() => setFilter(filterType)}
                                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${filter === filterType
                                                ? 'bg-studio-lime text-studio-charcoal shadow-md'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {filterType}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>


                        {!viewOnly && (
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => setIsAddInternOpen(true)}
                                    className="px-6 py-3 bg-studio-lime text-studio-charcoal font-semibold rounded-lg hover:bg-studio-lime/90 transition-colors shadow-md"
                                >
                                    + Add Intern
                                </button>
                                <button
                                    onClick={handleAddNewWeek}
                                    className="px-6 py-3 bg-studio-forest text-white font-semibold rounded-lg hover:bg-studio-forest/90 transition-colors shadow-md"
                                >
                                    + New Week
                                </button>
                                <button
                                    onClick={() => setIsManageWeeksOpen(true)}
                                    className="px-6 py-3 bg-studio-forest/80 text-white font-semibold rounded-lg hover:bg-studio-forest transition-colors shadow-md"
                                >
                                    📋 Manage Weeks
                                </button>
                                <button
                                    onClick={() => setIsManageInternsOpen(true)}
                                    className="px-6 py-3 bg-studio-forest/80 text-white font-semibold rounded-lg hover:bg-studio-forest transition-colors shadow-md"
                                >
                                    👥 Manage Interns
                                </button>
                                <button
                                    onClick={handleStartGrading}
                                    className="px-6 py-3 bg-studio-lime text-studio-charcoal font-semibold rounded-lg hover:bg-studio-lime/90 transition-colors shadow-md"
                                >
                                    📊 Grade {currentWeek}
                                </button>
                                <button
                                    onClick={handleExportCSV}
                                    className="px-6 py-3 bg-white border-2 border-studio-forest text-studio-forest font-semibold rounded-lg hover:bg-studio-forest hover:text-white transition-colors"
                                >
                                    📥 CSV
                                </button>
                                {viewMode === 'weekly' && (
                                    <button
                                        onClick={handleExportPDF}
                                        className="px-6 py-3 bg-white border-2 border-studio-forest text-studio-forest font-semibold rounded-lg hover:bg-studio-forest hover:text-white transition-colors"
                                    >
                                        📄 PDF
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {viewOnly && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                👁️ <strong>View-Only Mode:</strong> You can see the leaderboard and scores, but cannot make changes.
                            </p>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Interns</p>
                                <p className="text-3xl font-bold text-studio-forest">{profiles.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-studio-lime/20 rounded-full flex items-center justify-center">
                                <span className="text-2xl">👥</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{viewMode === 'weekly' ? `${currentWeek} Leader` : 'Weekly Leader'}</p>
                                <p className="text-xl font-bold text-studio-forest">
                                    {viewMode === 'weekly'
                                        ? internsWithScores.length > 0 ? internsWithScores[0].profile.name : '—'
                                        : internsWithScores.length > 0 ? internsWithScores[0].profile.name : '—'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {viewMode === 'weekly'
                                        ? internsWithScores.length > 0 ? `${internsWithScores[0].score.total} pts` : ''
                                        : internsWithScores.length > 0 ? `${internsWithScores[0].score.total} pts` : ''}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-studio-lime/20 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🏆</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Cumulative Leader</p>
                                <p className="text-xl font-bold text-studio-forest">
                                    {cumulativeScores.length > 0 ? cumulativeScores[0].profile.name : '—'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {cumulativeScores.length > 0 ? `${cumulativeScores[0].cumulativeTotal} pts` : ''}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-studio-lime/20 rounded-full flex items-center justify-center">
                                <span className="text-2xl">👑</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Average Score</p>
                                <p className="text-3xl font-bold text-studio-forest">
                                    {viewMode === 'weekly'
                                        ? internsWithScores.length > 0
                                            ? Math.round(internsWithScores.reduce((sum, i) => sum + i.score.total, 0) / internsWithScores.length)
                                            : '—'
                                        : cumulativeScores.length > 0
                                            ? Math.round(cumulativeScores.reduce((sum, i) => sum + i.cumulativeTotal, 0) / cumulativeScores.length)
                                            : '—'}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-studio-lime/20 rounded-full flex items-center justify-center">
                                <span className="text-2xl">📈</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Leaderboard */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {viewMode === 'weekly' ? (
                        <LeaderboardTable
                            interns={internsWithScores}
                            onDelete={handleDeleteIntern}
                            onEdit={handleEditMetric}
                            viewOnly={viewOnly}
                        />
                    ) : (
                        <CumulativeLeaderboard
                            interns={cumulativeScores}
                            onDelete={handleDeleteIntern}
                            viewOnly={viewOnly}
                        />
                    )}
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 text-center">
                    <p className={`text-sm italic ${isDarkMode ? 'text-studio-lime' : 'text-gray-600'}`}>
                        "We grow together. Your impact deserves to shine. Every metric tells a story of growth."
                    </p>
                </motion.div>
            </main>

            {/* Modals */}
            <AddInternModal isOpen={isAddInternOpen} onClose={() => setIsAddInternOpen(false)} onAdd={handleAddIntern} />

            <SelectStrategistsModal
                isOpen={isSelectStrategistsOpen}
                onClose={() => {
                    setIsSelectStrategistsOpen(false);
                    setPendingNewWeekName('');
                }}
                onSelect={handleSelectStrategists}
                profiles={profiles}
                week={pendingNewWeekName}
            />

            <ManageWeeksModal
                isOpen={isManageWeeksOpen}
                onClose={() => setIsManageWeeksOpen(false)}
                weeks={weeklyStrategists}
                profiles={profiles}
                onEditStrategists={handleEditWeekStrategists}
                onDeleteWeek={handleDeleteWeek}
            />

            <ManageInternsModal
                isOpen={isManageInternsOpen}
                onClose={() => setIsManageInternsOpen(false)}
                profiles={profiles}
                weeklyMetrics={weeklyMetrics}
                onUpdateProfile={handleUpdateProfile}
                onDeleteProfile={handleDeleteIntern}
            />

            <UpdateMetricsModal
                isOpen={isUpdateMetricsOpen}
                onClose={() => {
                    setIsUpdateMetricsOpen(false);
                    setEditingMetric(undefined);
                }}
                onUpdate={handleUpdateMetrics}
                profiles={profiles}
                currentWeek={currentWeek}
                weeklyStrategistIds={currentWeekStrategistIds}
                existingWeekMetrics={currentWeekMetrics}
                strategistAverageGrowth={strategistAverageGrowth}
                existingMetric={editingMetric}
            />
        </div>
    );
}

export default App;
