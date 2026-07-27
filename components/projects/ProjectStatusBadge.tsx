import type { ProjectStatus } from '../../types/project';

export const ProjectStatusBadge = ({ status }: { status: ProjectStatus }) => <span className="status-badge">{status}</span>;
