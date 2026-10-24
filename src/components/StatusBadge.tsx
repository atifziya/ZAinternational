import type { PublishStatus } from '../types/content';

export function StatusBadge({ status }: { status: PublishStatus }) {
  return <span className={`status status-${status}`}>{status}</span>;
}
