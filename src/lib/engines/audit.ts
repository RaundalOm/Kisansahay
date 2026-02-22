import { AuditRecord } from "../../types";

export const createAuditLog = (
    action: string,
    actor: AuditRecord['actor'],
    details: string
): AuditRecord => {
    return {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        action,
        actor,
        details
    };
};
