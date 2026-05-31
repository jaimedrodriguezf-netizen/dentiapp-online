export type FeedbackType = 'bug' | 'feature' | 'feedback';
export type FeedbackStatus = 'pending' | 'diagnosed' | 'resolved';

export interface FeedbackContext {
  pathname: string;
  userAgent: string;
  userRole: string;
  viewportWidth: number;
  viewportHeight: number;
  timestamp: string;
}

export interface SupportFeedback {
  id: string;
  tenant_id: string;
  user_id: string | null;
  user_email: string;
  type: FeedbackType;
  message: string;
  context: FeedbackContext;
  screenshot_path: string | null;
  status: FeedbackStatus;
  ai_diagnosis: string | null;
  created_at: string;
  updated_at: string;
}
