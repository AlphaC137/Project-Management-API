import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date?: Date;
  end_date?: Date;
  settings: Record<string, any>;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export class ProjectModel {
  constructor(private pool: Pool) {}

  async create(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO projects (
        id, organization_id, name, description, status,
        priority, start_date, end_date, settings, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        id,
        projectData.organization_id,
        projectData.name,
        projectData.description,
        projectData.status,
        projectData.priority,
        projectData.start_date,
        projectData.end_date,
        projectData.settings,
        projectData.created_by,
      ]
    );

    return result.rows[0];
  }

  async addMember(projectId: string, userId: string, role: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO project_members (
        project_id, user_id, role
      ) VALUES ($1, $2, $3)`,
      [projectId, userId, role]
    );
  }
}
