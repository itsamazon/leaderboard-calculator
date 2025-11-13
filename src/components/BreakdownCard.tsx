import { motion } from 'framer-motion';
import { InternWithScore } from '../types';
import { calculateStrategistGrowth } from '../utils/scoring';

interface BreakdownCardProps {
    intern: InternWithScore;
    onClose: () => void;
}

export default function BreakdownCard({ intern, onClose }: BreakdownCardProps) {
    const { profile, weeklyMetrics, score } = intern;
    const isStrategist = weeklyMetrics.role === 'Strategist';
    
    // Calculate what the support's growth would be if calculated from their own metrics
    const supportGrowthBreakdown = !isStrategist && weeklyMetrics.socialMetrics
        ? calculateStrategistGrowth(weeklyMetrics.socialMetrics)
        : null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-studio-charcoal/30 backdrop-blur-sm z-40"
            />

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-4 md:inset-8 lg:inset-12 z-50 bg-white rounded-2xl shadow-2xl flex flex-col"
            >
                <div className="bg-studio-forest p-6 rounded-t-2xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tighter-1">{profile.name}</h3>
                            <p className="text-studio-lime text-sm mt-1">{weeklyMetrics.role} • Rank #{intern.rank}</p>
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

                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    <div className="text-center pb-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Total Score</p>
                        <p className="text-4xl font-bold text-studio-forest">{score.total.toFixed(1)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {(() => {
                                const baseTotal = isStrategist
                                    ? (score.growth || 0) + (score.creativity || 0) + (score.proactivity || 0) + (score.leadership || 0)
                                    : (score.growth || 0) + (score.creativity || 0) + (score.proactivity || 0) + (score.collaboration || 0);
                                return `${baseTotal.toFixed(1)} base + ${score.bonus || 0} bonus = ${score.total.toFixed(1)} total`;
                            })()}
                        </p>
                    </div>

                    {/* Social Media Metrics */}
                    {weeklyMetrics.socialMetrics && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-sm font-bold text-studio-forest mb-3">📱 Social Media Performance</p>
                            <div className="space-y-3">
                                {/* Instagram */}
                                <div>
                                    <p className="text-xs font-semibold text-indigo-700 mb-2">Instagram</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-white p-2 rounded">
                                            <p className="text-xs text-gray-600">Followers</p>
                                            <p className="text-base font-bold text-studio-forest">{(weeklyMetrics.socialMetrics.igFollowers || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white p-2 rounded">
                                            <p className="text-xs text-gray-600">Views</p>
                                            <p className="text-base font-bold text-studio-forest">{(weeklyMetrics.socialMetrics.igViews || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white p-2 rounded">
                                            <p className="text-xs text-gray-600">Interactions</p>
                                            <p className="text-base font-bold text-studio-forest">{(weeklyMetrics.socialMetrics.igInteractions || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Twitter/X */}
                                <div>
                                    <p className="text-xs font-semibold text-blue-700 mb-2">Twitter/X</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-white p-2 rounded">
                                            <p className="text-xs text-gray-600">Followers</p>
                                            <p className="text-base font-bold text-studio-forest">{(weeklyMetrics.socialMetrics.twitterFollowers || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white p-2 rounded">
                                            <p className="text-xs text-gray-600">Impressions</p>
                                            <p className="text-base font-bold text-studio-forest">{(weeklyMetrics.socialMetrics.twitterImpressions || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white p-2 rounded">
                                            <p className="text-xs text-gray-600">Engagements</p>
                                            <p className="text-base font-bold text-studio-forest">{(weeklyMetrics.socialMetrics.twitterEngagements || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-studio-charcoal">📊 Score Breakdown</p>

                        {/* Growth */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-studio-charcoal">Growth Score</span>
                                <span className="text-sm font-bold text-studio-forest">
                                    {score.growth.toFixed(1)} / {isStrategist ? '40' : '20'} pts
                                </span>
                            </div>
                            {score.growthDetails && (
                                <div className="text-xs text-gray-600 space-y-1 ml-2">
                                    {score.growthDetails.basedOnStrategistAverage !== undefined ? (
                                        <>
                                            <p className="italic font-semibold mb-2 text-studio-forest">
                                                Your score: {score.growthDetails.basedOnStrategistAverage.toFixed(1)} pts (strategist average) ÷ 2 = {score.growth.toFixed(1)} pts
                                            </p>
                                            {supportGrowthBreakdown && (
                                                <div className="mt-2 pt-2 border-t border-gray-300">
                                                    <p className="font-semibold text-studio-charcoal mb-1">Your Actual Metrics Breakdown:</p>
                                                    <p>• Followers Growth: {supportGrowthBreakdown.details.followersScore.toFixed(1)} pts (IG + Twitter)</p>
                                                    <p>• Views/Impressions: {supportGrowthBreakdown.details.viewsScore.toFixed(1)} pts (IG + Twitter)</p>
                                                    <p>• Interactions/Engagements: {supportGrowthBreakdown.details.interactionsScore.toFixed(1)} pts (IG + Twitter)</p>
                                                    <p className="text-xs italic mt-1 text-gray-500">
                                                        Total if calculated from your metrics: {supportGrowthBreakdown.total.toFixed(1)} pts
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <p>• Followers Growth: {(score.growthDetails.followersScore || 0).toFixed(1)} pts (IG + Twitter)</p>
                                            <p>• Views/Impressions: {(score.growthDetails.viewsScore || 0).toFixed(1)} pts (IG + Twitter)</p>
                                            <p>• Interactions/Engagements: {(score.growthDetails.interactionsScore || 0).toFixed(1)} pts (IG + Twitter)</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Creativity */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-studio-charcoal">Creativity</span>
                                <span className="text-sm font-bold text-studio-forest">
                                    {score.creativity} / {isStrategist ? '30' : '20'} pts
                                </span>
                            </div>
                        </div>

                        {/* Proactivity */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-studio-charcoal">Proactivity</span>
                                <span className="text-sm font-bold text-studio-forest">
                                    {score.proactivity} / {isStrategist ? '20' : '10'} pts
                                </span>
                            </div>
                        </div>

                        {/* Leadership (Strategists only) */}
                        {isStrategist && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-studio-charcoal">Leadership</span>
                                    <span className="text-sm font-bold text-studio-forest">
                                        {score.leadership || 0} / 10 pts
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Collaboration (Supports only - 20 pts) */}
                        {!isStrategist && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-studio-charcoal">Collaboration</span>
                                    <span className="text-sm font-bold text-studio-forest">
                                        {score.collaboration || 0} / 20 pts
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Bonus - Always show, even if 0 */}
                        <div className={`p-3 rounded-lg border ${score.bonus > 0 ? 'bg-studio-lime/10 border-studio-lime' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-studio-charcoal">Bonus Points</span>
                                <span className={`text-sm font-bold ${score.bonus > 0 ? 'text-studio-forest' : 'text-gray-400'}`}>
                                    {score.bonus > 0 ? `+${score.bonus}` : '0'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                                Studio X brand contributions: {weeklyMetrics.bonusFollowers || 0} followers
                                {weeklyMetrics.bonusFollowers && weeklyMetrics.bonusFollowers > 0 && (
                                    <span className="ml-1">
                                        ({Math.floor((weeklyMetrics.bonusFollowers || 0) / 10)} × 10 = {Math.floor((weeklyMetrics.bonusFollowers || 0) / 10) * 10}, {Math.floor((weeklyMetrics.bonusFollowers || 0) / 10)} × 5 = {score.bonus} pts)
                                    </span>
                                )}
                            </p>
                            {weeklyMetrics.bonusFollowers && weeklyMetrics.bonusFollowers > 0 && score.bonus === 0 && (
                                <p className="text-xs text-yellow-600 mt-1 font-semibold">
                                    ⚠️ {weeklyMetrics.bonusFollowers} followers = 0 bonus points. Need at least 10 followers for 5 bonus points.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Weekly Comments - Prominent Section */}
                    {weeklyMetrics.comments && (
                        <div className="pt-4 border-t-2 border-studio-lime mt-4">
                            <div className="bg-gradient-to-r from-studio-lime/20 to-green-50 p-4 rounded-xl border-2 border-studio-lime">
                                <p className="text-base font-bold text-studio-forest mb-3 flex items-center gap-2">
                                    <span className="text-xl">💬</span> Weekly Feedback from Your Mentor
                                </p>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{weeklyMetrics.comments}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* No Feedback Message */}
                    {!weeklyMetrics.comments && (
                        <div className="pt-4 border-t border-gray-200">
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <p className="text-sm text-gray-500 italic">No feedback provided for this week yet.</p>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs text-center text-gray-500 italic">
                            "Your Growth Score is based on verified analytics from IG and Twitter. Let's see how your creativity shines this week!"
                        </p>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
