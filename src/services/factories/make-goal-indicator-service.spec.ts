import { describe, expect, it } from "vitest";
import { makeGoalIndicatorService } from "./make-goal-indicator-service";
import { GoalIndicatorService } from "../goal-indicator-service";

describe('Goal Indicator Factory Tests', () => {

    it('should create goal indicator service', async () => {
        const service = await makeGoalIndicatorService();
        expect(service).instanceof(GoalIndicatorService);
    });

});