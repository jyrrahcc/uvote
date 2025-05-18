
// Re-export all service functions for easy access
export * from './applicationReadService';
export * from './applicationStatusService';
export * from './applicationSubmissionService';
export * from './base/applicationBaseService';

// Re-export types with proper syntax for isolatedModules
export type { CandidateApplication } from './base/applicationBaseService';
export type { ApplicationStatusUpdateParams } from './applicationStatusService';
