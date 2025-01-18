import { type } from "os";
import { normalizeClubName } from '@/lib/utils/club-mapping'

// Temporarily import and re-export the enhanced model
import { YardageModelEnhanced as YardageModelDS, 
         type ShotResult as ShotResultDS,
         type BallModel as BallModelDS,
         type ClubData as ClubDataDS,
         SkillLevel as SkillLevelDS } from './yardage_modelds';

// Re-export types from the new model
export type { ShotResultDS as ShotResult };
export type { BallModelDS as BallModel };
export type { ClubDataDS as ClubData };
export { SkillLevelDS as SkillLevel };

// Export the new model implementation temporarily
export { YardageModelDS as YardageModelEnhanced };

// Comment out the original implementation
/*
export class YardageModelEnhanced {
    // ... rest of the original implementation ...
}
*/
