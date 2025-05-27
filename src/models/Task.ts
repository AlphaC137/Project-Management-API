import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  BLOCKED = 'blocked',
  COMPLETED = 'completed'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to?: string;
  created_by: string;
  due_date?: Date;
  estimated_hours?: number;
  parent_task_id?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export class TaskModel {
  constructor(private pool: Pool) {}

  async create(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO tasks (
        id, project_id, title, description, status,
        priority, assigned_to, created_by, due_date,
        estimated_hours, parent_task_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        id,
        taskData.project_id,
        taskData.title,
        taskData.description,
        taskData.status,
        taskData.priority,
        taskData.assigned_to,
        taskData.created_by,
        taskData.due_date,
        taskData.estimated_hours,
        taskData.parent_task_id,
      ]
    );

    return result.rows[0];
  }

  async getTaskHierarchy(taskId: string): Promise<Task[]> {
    const result = await this.pool.query(
      `WITH RECURSIVE task_tree AS (
        SELECT * FROM tasks WHERE id = $1
        UNION ALL
        SELECT t.* FROM tasks t
        INNER JOIN task_tree tt ON t.parent_task_id = tt.id
      )
      SELECT * FROM task_tree`,
      [taskId]
    );
    
    return result.rows;
  }

  async addDependency(taskId: string, dependsOnTaskId: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO task_dependencies (
        task_id, depends_on_task_id
      ) VALUES ($1, $2)`,
      [taskId, dependsOnTaskId]
    );
  }
}
