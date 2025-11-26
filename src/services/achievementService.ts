import { supabase } from '@/integrations/supabase/client';

export interface AchievementCheckResult {
    shouldUnlock: boolean;
    progress?: Record<string, any>;
}

/**
 * Service to check and unlock user achievements
 */
class AchievementService {
    /**
     * Check if user should unlock "first_visit" achievement
     */
    async checkFirstVisit(userId: string): Promise<AchievementCheckResult> {
        const { data: progress } = await supabase
            .from('user_progress')
            .select('problem_id')
            .eq('user_id', userId);

        return {
            shouldUnlock: (progress?.length || 0) >= 1,
            progress: { problems_visited: progress?.length || 0 },
        };
    }

    /**
     * Check if user should unlock "explorer" achievement (visited all 7 problems)
     */
    async checkExplorer(userId: string): Promise<AchievementCheckResult> {
        const { data: progress } = await supabase
            .from('user_progress')
            .select('problem_id')
            .eq('user_id', userId);

        const uniqueProblems = new Set(progress?.map(p => p.problem_id) || []);

        return {
            shouldUnlock: uniqueProblems.size >= 7,
            progress: { unique_problems: uniqueProblems.size },
        };
    }

    /**
     * Check if user should unlock "bookworm" achievement (5 bookmarks)
     */
    async checkBookworm(userId: string): Promise<AchievementCheckResult> {
        const { data: progress } = await supabase
            .from('user_progress')
            .select('problem_id')
            .eq('user_id', userId)
            .eq('bookmarked', true);

        return {
            shouldUnlock: (progress?.length || 0) >= 5,
            progress: { bookmarks_count: progress?.length || 0 },
        };
    }

    /**
     * Check if user should unlock "scholar" achievement (1 hour total time)
     */
    async checkScholar(userId: string): Promise<AchievementCheckResult> {
        const { data: stats } = await supabase
            .from('user_statistics')
            .select('total_time_seconds')
            .eq('user_id', userId)
            .maybeSingle();

        const totalSeconds = stats?.total_time_seconds || 0;

        return {
            shouldUnlock: totalSeconds >= 3600, // 1 hour
            progress: { total_time_seconds: totalSeconds },
        };
    }

    /**
     * Check if user should unlock "advanced_learner" achievement
     */
    async checkAdvancedLearner(userId: string): Promise<AchievementCheckResult> {
        const { data: progress } = await supabase
            .from('user_progress')
            .select('problem_id')
            .eq('user_id', userId)
            .eq('current_level', 'advanced');

        const uniqueAdvanced = new Set(progress?.map(p => p.problem_id) || []);

        return {
            shouldUnlock: uniqueAdvanced.size >= 3,
            progress: { advanced_problems: uniqueAdvanced.size },
        };
    }

    /**
     * Unlock an achievement for a user
     */
    async unlockAchievement(userId: string, achievementSlug: string): Promise<boolean> {
        try {
            // Get achievement ID
            const { data: achievement } = await supabase
                .from('achievements')
                .select('id')
                .eq('slug', achievementSlug)
                .single();

            if (!achievement) {
                console.error(`Achievement ${achievementSlug} not found`);
                return false;
            }

            // Check if already unlocked
            const { data: existing } = await supabase
                .from('user_achievements')
                .select('id')
                .eq('user_id', userId)
                .eq('achievement_id', achievement.id)
                .maybeSingle();

            if (existing) {
                return false; // Already unlocked
            }

            // Insert new achievement
            const { error } = await supabase
                .from('user_achievements')
                .insert({
                    user_id: userId,
                    achievement_id: achievement.id,
                });

            if (error) {
                console.error('Error unlocking achievement:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in unlockAchievement:', error);
            return false;
        }
    }

    /**
     * Check all achievements for a user and unlock if criteria met
     */
    async checkAllAchievements(userId: string): Promise<string[]> {
        const unlockedAchievements: string[] = [];

        const checks = [
            { slug: 'first_visit', check: () => this.checkFirstVisit(userId) },
            { slug: 'explorer', check: () => this.checkExplorer(userId) },
            { slug: 'bookworm', check: () => this.checkBookworm(userId) },
            { slug: 'scholar', check: () => this.checkScholar(userId) },
            { slug: 'advanced_learner', check: () => this.checkAdvancedLearner(userId) },
        ];

        for (const { slug, check } of checks) {
            const result = await check();
            if (result.shouldUnlock) {
                const unlocked = await this.unlockAchievement(userId, slug);
                if (unlocked) {
                    unlockedAchievements.push(slug);
                }
            }
        }

        return unlockedAchievements;
    }
}

export const achievementService = new AchievementService();
