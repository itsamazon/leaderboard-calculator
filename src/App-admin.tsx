import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
// REST API backend database
import { InternProfile, WeeklyMetrics, WeeklyStrategists } from './types';
import {
    getInternProfiles,
    createInternProfile,
    updateInternProfile,
    deleteInternProfile,
    getWeeklyStrategists,
    createWeeklyStrategists,
    updateWeeklyStrategists,
    deleteWeeklyStrategists,
    getWeeklyMetrics,
    createWeeklyMetrics,
    updateWeeklyMetrics,
    deleteWeeklyMetrics,
    subscribeToInternProfiles,
    subscribeToWeeklyStrategists,
    subscribeToWeeklyMetrics
} from './lib/database-api';
import { calculateScore, calculateStrategistGrowth } from './utils/scoring';
import { exportToCSV, exportToPDF } from './utils/export';
import AddInternModal from './components/AddInternModal';
import UpdateMetricsModal from './components/UpdateMetricsModal';
import SelectStrategistsModal from './components/SelectStrategistsModal';
import ManageWeeksModal from './components/ManageWeeksModal';
import ManageInternsModal from './components/ManageInternsModal';
import LeaderboardTable from './components/LeaderboardTable';
import CumulativeLeaderboard from './components/CumulativeLeaderboard';

type FilterType = 'All' | 'Strategist' | 'Support';
type ViewMode = 'weekly' | 'cumulative';

function AppAdmin() {
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
    const [viewMode, setViewMode] = useState<ViewMode>('weekly');
    const [loading, setLoading] = useState(true);

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [profilesData, metricsData, strategistsData] = await Promise.all([
                    getInternProfiles(),
                    getWeeklyMetrics(),
                    getWeeklyStrategists()
                ]);

                setProfiles(profilesData);
                setWeeklyMetrics(metricsData);
                setWeeklyStrategists(strategistsData);

                // Set current week to the latest week
                if (strategistsData.length > 0) {
                    const latestWeek = strategistsData[strategistsData.length - 1].week;
                    setCurrentWeek(latestWeek);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Set up real-time subscriptions
    useEffect(() => {
        const unsubscribeProfiles = subscribeToInternProfiles(setProfiles);
        const unsubscribeStrategists = subscribeToWeeklyStrategists(setWeeklyStrategists);
        const unsubscribeMetrics = subscribeToWeeklyMetrics(setWeeklyMetrics);

        return () => {
            unsubscribeProfiles();
            unsubscribeStrategists();
            unsubscribeMetrics();
        };
    }, []);

    // Calculate weeks available
    const weeks = useMemo(() => {
        const strategistWeeks = weeklyStrategists.map(ws => ws.week);
        if (strategistWeeks.length === 0) return [];

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

    // Calculate interns with scores for current week
    const internsWithScores = useMemo(() => {
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
        scores.forEach((score, index) => {
            score.rank = index + 1;
        });

        // Filter by role if needed
        if (filter === 'Strategist') {
            return scores.filter(s => s.weeklyMetrics.role === 'Strategist');
        } else if (filter === 'Support') {
            return scores.filter(s => s.weeklyMetrics.role === 'Support');
        }

        return scores;
    }, [profiles, weeklyMetrics, weeklyStrategists, currentWeek, filter]);

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

        const scores = Array.from(internTotals.values())
            .map(item => ({
                profile: {
                    id: item.profile.id,
                    name: item.profile.name,
                    notes: item.profile.notes,
                },
                weeklyScores: item.weeklyScores,
                cumulativeTotal: item.total,
                rank: 0
            }));

        scores.sort((a, b) => b.cumulativeTotal - a.cumulativeTotal);
        scores.forEach((score, index) => {
            score.rank = index + 1;
        });

        return scores;
    }, [profiles, weeklyMetrics, weeklyStrategists]);

    // Calculate strategist average growth for current week
    const strategistAverageGrowth = useMemo(() => {
        const strategistIds = weeklyStrategists.find(ws => ws.week === currentWeek)?.strategistIds || [];
        const strategistMetrics = weeklyMetrics.filter(m =>
            m.week === currentWeek && strategistIds.includes(m.internId)
        );

        if (strategistMetrics.length === 0) return null;

        const totalGrowth = strategistMetrics.reduce((sum, m) => {
            const growth = calculateStrategistGrowth(m.socialMetrics);
            return sum + growth.total;
        }, 0);

        return totalGrowth / strategistMetrics.length;
    }, [weeklyMetrics, weeklyStrategists, currentWeek]);

    // Event handlers
    const handleAddIntern = async (newProfile: Omit<InternProfile, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            const created = await createInternProfile(newProfile);
            setProfiles(prev => [...prev, created]);
            toast.success(`✅ ${created.name} added successfully!`);
        } catch (error) {
            console.error('Error adding intern:', error);
            toast.error('❌ Failed to add intern. Please try again.');
        }
    };

    const handleUpdateProfile = async (internId: string, updates: Partial<InternProfile>) => {
        try {
            const updated = await updateInternProfile(internId, updates);
            setProfiles(prev => prev.map(p => p.id === internId ? updated : p));
            toast.success('✅ Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('❌ Failed to update profile. Please try again.');
        }
    };

    const handleDeleteIntern = async (internId: string) => {
        const intern = profiles.find(p => p.id === internId);
        if (!intern) return;

        try {
            await deleteInternProfile(internId);
            setProfiles(prev => prev.filter(p => p.id !== internId));
            setWeeklyMetrics(prev => prev.filter(m => m.internId !== internId));
            toast.success(`🗑️ ${intern.name} deleted successfully!`);
        } catch (error) {
            console.error('Error deleting intern:', error);
            toast.error('❌ Failed to delete intern. Please try again.');
        }
    };

    const handleDeleteMetric = async (metricId: string) => {
        const metric = weeklyMetrics.find(m => m.id === metricId);
        if (!metric) return;

        const intern = profiles.find(p => p.id === metric.internId);

        try {
            await deleteWeeklyMetrics(metricId);
            setWeeklyMetrics(prev => prev.filter(m => m.id !== metricId));
            toast.success(`🗑️ ${intern?.name}'s ${metric.week} metrics deleted!`);
        } catch (error) {
            console.error('Error deleting metric:', error);
            toast.error('❌ Failed to delete metric. Please try again.');
        }
    };

    const handleSelectStrategists = async (strategistIds: string[]) => {
        try {
            const created = await createWeeklyStrategists({
                week: pendingNewWeekName,
                strategistIds: strategistIds
            });
            setWeeklyStrategists(prev => [...prev, created]);
            setPendingNewWeekName('');
            setIsSelectStrategistsOpen(false);
            setCurrentWeek(created.week);
            toast.success(`✅ ${created.week} created successfully!`);
        } catch (error) {
            console.error('Error creating week:', error);
            toast.error('❌ Failed to create week. Please try again.');
        }
    };

    const handleEditWeekStrategists = async (week: string, strategistIds: string[]) => {
        try {
            const updated = await updateWeeklyStrategists(week, strategistIds);
            setWeeklyStrategists(prev => prev.map(ws => ws.week === week ? updated : ws));
            toast.success(`✅ ${week} strategists updated!`);
        } catch (error) {
            console.error('Error updating strategists:', error);
            toast.error('❌ Failed to update strategists. Please try again.');
        }
    };

    const handleDeleteWeek = async (week: string) => {
        try {
            await deleteWeeklyStrategists(week);
            setWeeklyStrategists(prev => prev.filter(ws => ws.week !== week));
            setWeeklyMetrics(prev => prev.filter(m => m.week !== week));
            toast.success(`🗑️ ${week} deleted successfully!`);
        } catch (error) {
            console.error('Error deleting week:', error);
            toast.error('❌ Failed to delete week. Please try again.');
        }
    };

    const handleUpdateMetrics = async (metrics: Omit<WeeklyMetrics, 'internId'>, internId: string) => {
        const intern = profiles.find(p => p.id === internId);
        try {
            if (editingMetric && editingMetric.id) {
                const updated = await updateWeeklyMetrics(editingMetric.id, { ...metrics, internId: internId });
                setWeeklyMetrics(prev => prev.map(m => m.id === editingMetric.id ? updated : m));
                toast.success(`✅ ${intern?.name}'s metrics updated!`);
            } else {
                const created = await createWeeklyMetrics({ ...metrics, internId: internId });
                setWeeklyMetrics(prev => [...prev, created]);
                toast.success(`✅ ${intern?.name} graded successfully!`);
            }
            setEditingMetric(undefined);
            setIsUpdateMetricsOpen(false);
        } catch (error) {
            console.error('Error updating metrics:', error);
            toast.error('❌ Failed to update metrics. Please try again.');
        }
    };

    const handleEditMetric = (metric: WeeklyMetrics) => {
        setEditingMetric(metric);
        setIsUpdateMetricsOpen(true);
    };

    const handleAddNewWeek = () => {
        const nextWeekNumber = weeks.length + 1;
        setPendingNewWeekName(`Week ${nextWeekNumber}`);
        setIsSelectStrategistsOpen(true);
    };

    const handleStartGrading = () => {
        setIsUpdateMetricsOpen(true);
    };

    const handleExportCSV = () => {
        const currentWeekMetrics = weeklyMetrics.filter(m => m.week === currentWeek);
        const currentWeekStrategists = weeklyStrategists.find(ws => ws.week === currentWeek);

        if (!currentWeekStrategists || currentWeekMetrics.length === 0) {
            alert('No data to export for this week.');
            return;
        }

        const scores = currentWeekMetrics.map(metrics => {
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
                profile: { id: profile.id, name: profile.name },
                weeklyMetrics: metrics,
                score,
                rank: 0,
            };
        }).filter((item): item is NonNullable<typeof item> => item !== null);

        scores.sort((a, b) => b.score.total - a.score.total);
        scores.forEach((score, index) => {
            score.rank = index + 1;
        });

        exportToCSV(scores, currentWeek);
    };

    const handleExportPDF = () => {
        exportToPDF(internsWithScores, currentWeek);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-studio-charcoal via-studio-forest to-studio-lime flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-studio-lime border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-xl">Loading Studio X Leaderboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-studio-charcoal' : 'bg-gradient-to-br from-studio-charcoal via-studio-forest to-studio-lime'}`}>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#153F2A',
                        color: '#fff',
                        border: '1px solid #C9E960',
                    },
                    success: {
                        iconTheme: {
                            primary: '#C9E960',
                            secondary: '#153F2A',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
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
                                    <span className="ml-3 text-lg bg-red-600 text-white px-3 py-1 rounded-full">
                                        🔧 Admin Panel
                                    </span>
                                </h1>
                                <p className="text-studio-lime mt-1 tracking-tighter-1">
                                    The Spot Where Growth Thrives
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className="p-3 bg-studio-charcoal/20 hover:bg-studio-charcoal/40 rounded-xl transition-colors"
                            >
                                {isDarkMode ? '☀️' : '🌙'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Interns</p>
                                <p className="text-2xl font-bold text-studio-forest">{profiles.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-studio-lime/20 rounded-full flex items-center justify-center">
                                <span className="text-2xl">👥</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Active Weeks</p>
                                <p className="text-2xl font-bold text-studio-forest">{weeks.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-studio-lime/20 rounded-full flex items-center justify-center">
                                <span className="text-2xl">📅</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Current Week</p>
                                <p className="text-xl font-bold text-studio-forest">{currentWeek}</p>
                            </div>
                            <div className="w-12 h-12 bg-studio-lime/20 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🎯</span>
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
                </div>

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

                            {/* Week Selection */}
                            {viewMode === 'weekly' && (
                                <div>
                                    <label className="block text-sm font-semibold text-studio-charcoal mb-2">Select Week</label>
                                    <select
                                        value={currentWeek}
                                        onChange={(e) => setCurrentWeek(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-studio-lime focus:border-transparent"
                                    >
                                        {weeks.map(week => (
                                            <option key={week} value={week}>{week}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Filter */}
                            <div>
                                <label className="block text-sm font-semibold text-studio-charcoal mb-2">Filter</label>
                                <div className="flex gap-2">
                                    {(['All', 'Strategist', 'Support'] as FilterType[]).map(filterType => (
                                        <button
                                            key={filterType}
                                            onClick={() => setFilter(filterType)}
                                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${filter === filterType
                                                ? 'bg-studio-forest text-white shadow-md'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {filterType}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

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
                                📄 Export CSV
                            </button>
                            <button
                                onClick={handleExportPDF}
                                className="px-6 py-3 bg-white border-2 border-studio-lime text-studio-lime font-semibold rounded-lg hover:bg-studio-lime hover:text-studio-charcoal transition-colors"
                            >
                                📑 Export PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* Leaderboard */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {viewMode === 'weekly' ? (
                        <LeaderboardTable
                            interns={internsWithScores}
                            onDelete={handleDeleteMetric}
                            onEdit={handleEditMetric}
                            viewOnly={false}
                        />
                    ) : (
                        <CumulativeLeaderboard
                            interns={cumulativeScores}
                            onDelete={handleDeleteIntern}
                            viewOnly={false}
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
            <AddInternModal
                isOpen={isAddInternOpen}
                onClose={() => setIsAddInternOpen(false)}
                onAdd={handleAddIntern}
            />

            <SelectStrategistsModal
                isOpen={isSelectStrategistsOpen}
                onClose={() => setIsSelectStrategistsOpen(false)}
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
                weeklyStrategistIds={weeklyStrategists.find(ws => ws.week === currentWeek)?.strategistIds || []}
                existingWeekMetrics={weeklyMetrics.filter(m => m.week === currentWeek)}
                strategistAverageGrowth={strategistAverageGrowth}
                existingMetric={editingMetric}
            />
        </div>
    );
}

export default AppAdmin;
