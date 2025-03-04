export const ENVIRONMENT = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
  LOCAL: 'local',
} as const;

export type Environment = (typeof ENVIRONMENT)[keyof typeof ENVIRONMENT];
