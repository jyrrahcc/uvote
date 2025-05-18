
// Re-export all candidate services
export * from './candidateService';
export * from './applicationReadService';
export * from './applicationStatusService';
export * from './applicationSubmissionService';
// Re-export the base service but exclude the duplicated processApplicationWithProfile
export { 
  DbCandidateApplication,
  ExtendedApplicationData,
  mapDbCandidateApplicationToCandidateApplication
} from './base/applicationBaseService';
