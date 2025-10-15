import { SocialMetrics, ManualScores, ScoreBreakdown, Role } from '../types';

/**
 * Calculate growth score for Strategists
 * Benchmarks:
 * - Followers: 100/week per platform (20 pts total: 10 pts per platform)
 * - Views/Impressions: 50,000/week per platform (10 pts total: 5 pts per platform)
 * - Interactions: 1,000/week per platform (10 pts total: 5 pts per platform)
 * Maximum base: 40 points (but can exceed with over-performance)
 */
export function calculateStrategistGrowth(metrics: SocialMetrics): { total: number; details: any } {
    // Followers: 10 pts max per platform (20 pts total weight)
    const igFollowersScore = (metrics.igFollowers / 100) * 10;
    const twitterFollowersScore = (metrics.twitterFollowers / 100) * 10;
    const followersScore = igFollowersScore + twitterFollowersScore;

    // Views/Impressions: 5 pts max per platform (10 pts total weight)
    const igViewsScore = (metrics.igViews / 50000) * 5;
    const twitterImpressionsScore = (metrics.twitterImpressions / 50000) * 5;
    const viewsScore = igViewsScore + twitterImpressionsScore;

    // Interactions: 5 pts max per platform (10 pts total weight)
    const igInteractionsScore = (metrics.igInteractions / 1000) * 5;
    const twitterEngagementsScore = (metrics.twitterEngagements / 1000) * 5;
    const interactionsScore = igInteractionsScore + twitterEngagementsScore;

    // Allow exceeding 40 points if performance exceeds benchmarks
    const total = followersScore + viewsScore + interactionsScore;

    return {
        total: Math.round(total * 100) / 100,
        details: {
            followersScore: Math.round(followersScore * 100) / 100,
            viewsScore: Math.round(viewsScore * 100) / 100,
            interactionsScore: Math.round(interactionsScore * 100) / 100,
            breakdown: {
                ig: {
                    followers: Math.round(igFollowersScore * 100) / 100,
                    views: Math.round(igViewsScore * 100) / 100,
                    interactions: Math.round(igInteractionsScore * 100) / 100,
                },
                twitter: {
                    followers: Math.round(twitterFollowersScore * 100) / 100,
                    impressions: Math.round(twitterImpressionsScore * 100) / 100,
                    engagements: Math.round(twitterEngagementsScore * 100) / 100,
                }
            }
        }
    };
}

/**
 * Calculate growth score for Supports based on strategist average (half of strategist growth)
 * Max 20 points
 */
export function calculateSupportGrowth(strategistAverageGrowth: number): { total: number; details: any } {
    const total = Math.min(20, strategistAverageGrowth / 2);

    return {
        total,
        details: {
            followersScore: 0,
            viewsScore: 0,
            interactionsScore: 0,
            basedOnStrategistAverage: strategistAverageGrowth,
        }
    };
}

/**
 * Calculate bonus points: +5 points per 10 followers contributed to Studio X brands
 */
export function calculateBonus(bonusFollowers: number): number {
    return Math.floor(bonusFollowers / 10) * 5;
}

/**
 * Calculate complete score
 */
export function calculateScore(
    role: Role,
    socialMetrics: SocialMetrics,
    manualScores: ManualScores,
    bonusFollowers: number,
    basedOnStrategistGrowth?: number
): ScoreBreakdown {
    if (role === 'Strategist') {
        // Strategist scoring
        // Growth: 40 pts max (calculated from social metrics)
        // Creativity: 30 pts max
        // Proactivity: 20 pts max
        // Leadership: 10 pts max
        const growth = calculateStrategistGrowth(socialMetrics);
        const creativity = Math.min(30, manualScores.creativity);
        const proactivity = Math.min(20, manualScores.proactivity);
        const leadership = Math.min(10, manualScores.leadership || 0);
        const bonus = calculateBonus(bonusFollowers);

        const total = growth.total + creativity + proactivity + leadership + bonus;

        return {
            growth: Math.round(growth.total * 100) / 100,
            creativity: Math.round(creativity * 100) / 100,
            proactivity: Math.round(proactivity * 100) / 100,
            leadership: Math.round(leadership * 100) / 100,
            bonus,
            total: Math.round(total * 100) / 100,
            growthDetails: growth.details,
        };
    } else {
        // Support scoring
        // Collaboration: 20 pts max
        // Growth: 20 pts max (half of strategist average)
        // Creativity: 20 pts max
        // Proactivity: 10 pts max
        const growth = basedOnStrategistGrowth !== undefined
            ? calculateSupportGrowth(basedOnStrategistGrowth)
            : { total: 0, details: { followersScore: 0, viewsScore: 0, interactionsScore: 0 } };

        const collaboration = Math.min(20, manualScores.collaboration || 0);
        const creativity = Math.min(20, manualScores.creativity);
        const proactivity = Math.min(10, manualScores.proactivity);
        const bonus = calculateBonus(bonusFollowers);

        const total = collaboration + growth.total + creativity + proactivity + bonus;

        return {
            collaboration: Math.round(collaboration * 100) / 100,
            growth: Math.round(growth.total * 100) / 100,
            creativity: Math.round(creativity * 100) / 100,
            proactivity: Math.round(proactivity * 100) / 100,
            bonus,
            total: Math.round(total * 100) / 100,
            growthDetails: growth.details,
        };
    }
}
