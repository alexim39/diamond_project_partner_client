export const APP_PERMISSIONS = {
  PROLIFIC_WOMAN_LEADS_VIEW: 'prolificwoman.leads.view',
} as const;

export type AppPermission = (typeof APP_PERMISSIONS)[keyof typeof APP_PERMISSIONS];
