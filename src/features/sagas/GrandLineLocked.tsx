import { Link } from 'react-router'

/** 423 LOG_POSE_REQUIRED: the server blocks the Grand Line until the CP3 inspection is passed. */
export function GrandLineLocked() {
  return (
    <div role="status" className="rounded-lg border border-amber-800 bg-amber-950/30 p-6 text-sm">
      <p className="font-semibold text-amber-200">Grand Line bloqueado</p>
      <p className="mt-1 text-amber-100/80">
        Necesitan el Log Pose para ver las sagas. Aprueben la inspección del CP3 y vuelvan a intentarlo.
      </p>
      <Link to="/dashboard" className="mt-3 inline-block text-amber-300 underline">
        Ver estado del Log Pose
      </Link>
    </div>
  )
}
