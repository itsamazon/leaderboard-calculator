import { motion } from 'framer-motion';
import { InternWithScore } from '../types';

interface BreakdownCardProps {
    intern: InternWithScore;
    onClose: () => void;
}

export default function BreakdownCard({ intern, onClose }: BreakdownCardProps) {
    const { profile, weeklyMetrics, score } = intern;
    const isStrategist = weeklyMetrics.role === 'Strategist';

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-studio-charcoal/30 backdrop-blur-sm z-40"
            />

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4"
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

                <div className="p-6 space-y-4">
                    <div className="text-center pb-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Total Score</p>
                        <p className="text-4xl font-bold text-studio-forest">{score.total}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            out of {isStrategist ? '100' : '70'} + bonus
                        </p>
                    </div>

                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-studio-charcoal">Score Breakdown</p>

                        {/* Growth */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-studio-charcoal">Growth</span>
                                <span className="text-sm font-bold text-studio-forest">
                                    {score.growth} / {isStrategist ? '40' : '20'}
                                </span>
                            </div>
                            {score.growthDetails && (
                                <div className="text-xs text-gray-600 space-y-1 ml-2">
                                    <p>• Followers: {score.growthDetails.followersScore.toFixed(2)}</p>
                                    <p>• Views: {score.growthDetails.viewsScore.toFixed(2)}</p>
                                    <p>• Interactions: {score.growthDetails.interactionsScore.toFixed(2)}</p>
                                </div>
                            )}
                        </div>

                        {/* Creativity */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-studio-charcoal">Creativity</span>
                                <span className="text-sm font-bold text-studio-forest">
                                    {score.creativity} / {isStrategist ? '30' : '20'}
                                </span>
                            </div>
                        </div>

                        {/* Proactivity */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-studio-charcoal">Proactivity</span>
                                <span className="text-sm font-bold text-studio-forest">
                                    {score.proactivity} / {isStrategist ? '20' : '10'}
                                </span>
                            </div>
                        </div>

                        {/* Leadership (Strategists) or Collaboration (Supports) */}
                        {isStrategist ? (
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-studio-charcoal">Leadership</span>
                                    <span className="text-sm font-bold text-studio-forest">
                                        {score.leadership} / 10
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-studio-charcoal">Collaboration</span>
                                    <span className="text-sm font-bold text-studio-forest">
                                        {score.collaboration} / 20
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Bonus */}
                        {score.bonus > 0 && (
                            <div className="bg-studio-lime/10 p-3 rounded-lg border border-studio-lime">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-studio-charcoal">Bonus Points</span>
                                    <span className="text-sm font-bold text-studio-forest">+{score.bonus}</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                    Studio X brand contributions
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Weekly Comments */}
                    {weeklyMetrics.comments && (
                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-sm font-semibold text-studio-charcoal mb-2">📝 Weekly Notes</p>
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{weeklyMetrics.comments}</p>
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
