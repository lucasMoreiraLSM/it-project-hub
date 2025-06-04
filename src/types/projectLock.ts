
export interface ProjectLock {
  id: string;
  project_id: string;
  user_id: string;
  user_name: string;
  locked_at: string;
  expires_at: string;
}

export interface LockCheckResult {
  hasLock: boolean;
  lockInfo: ProjectLock | null;
}
