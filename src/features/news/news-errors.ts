import type { ApiError } from '../../lib/api'

/** 423 LOG_POSE_REQUIRED: the team has not passed the in-person inspection (CP3) yet. */
export function isLogPoseLocked(error: ApiError): boolean {
  return error.status === 423 || error.code === 'LOG_POSE_REQUIRED'
}
