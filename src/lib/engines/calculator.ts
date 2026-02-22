import { FarmerApplication, Category } from "../../types";

export const ELIGIBILITY_CONFIG = {
    MAX_INCOME: 200000,
    MAX_LAND_SIZE: 5,
};

export const CATEGORY_WEIGHTS: Record<Category, number> = {
    'SC': 1.5,
    'ST': 1.5,
    'General': 1.0,
};

export const checkEligibility = (income: number, landSize: number): { isEligible: boolean; reason?: string } => {
    if (income > ELIGIBILITY_CONFIG.MAX_INCOME) {
        return { isEligible: false, reason: `Income exceeds ₹${ELIGIBILITY_CONFIG.MAX_INCOME.toLocaleString()}` };
    }
    if (landSize > ELIGIBILITY_CONFIG.MAX_LAND_SIZE) {
        return { isEligible: false, reason: `Land size exceeds ${ELIGIBILITY_CONFIG.MAX_LAND_SIZE} acres` };
    }
    return { isEligible: true };
};

export const calculateImpactScore = (income: number, landSize: number, category: Category): number => {
    // Normalize values (assuming min income 0, min land 0)
    // Inverse relation: lower income/land = higher impact

    // Score from income (linear decrease from MAX_INCOME to 0)
    const incomeScore = (1 - income / ELIGIBILITY_CONFIG.MAX_INCOME) * 50;

    // Score from land size (linear decrease from MAX_LAND_SIZE to 0)
    const landScore = (1 - landSize / ELIGIBILITY_CONFIG.MAX_LAND_SIZE) * 50;

    const baseScore = incomeScore + landScore;
    const multiplier = CATEGORY_WEIGHTS[category];

    return parseFloat((baseScore * multiplier).toFixed(2));
};
