import { Pool } from 'pg';
import { UserModel } from '../models/User';
import { OrganizationModel } from '../models/Organization';
import { ProjectModel, ProjectStatus, ProjectPriority } from '../models/Project';
import { TaskModel, TaskStatus, TaskPriority } from '../models/Task';

export async function seedDatabase(pool: Pool): Promise<void> {
  const userModel = new UserModel(pool);
  const orgModel = new OrganizationModel(pool);
  const projectModel = new ProjectModel(pool);
  const taskModel = new TaskModel(pool);

  try {
    // Create test users
    const admin = await userModel.create({
      email: 'admin@example.com',
      password: 'Admin123!',
      first_name: 'Admin',
      last_name: 'User',
      is_active: true
    });

    const user1 = await userModel.create({
      email: 'user1@example.com',
      password: 'User123!',
      first_name: 'Test',
      last_name: 'User',
      is_active: true
    });

    // Create test organization
    const org = await orgModel.create({
      name: 'Test Organization',
      description: 'A test organization',
      settings: {},
      subscription_tier: 'free'
    });

    // Create test project
    const project = await projectModel.create({
      organization_id: org.id,
      name: 'Test Project',
      description: 'A test project',
      status: ProjectStatus.ACTIVE,
      priority: ProjectPriority.MEDIUM,
      settings: {},
      created_by: admin.id
    });

    // Add project members
    await projectModel.addMember(project.id, admin.id, 'admin');
    await projectModel.addMember(project.id, user1.id, 'member');

    // Create test tasks
    const parentTask = await taskModel.create({
      project_id: project.id,
      title: 'Parent Task',
      description: 'A parent task',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      assigned_to: user1.id,
      created_by: admin.id,
      estimated_hours: 8
    });

    await taskModel.create({
      project_id: project.id,
      title: 'Child Task 1',
      description: 'First child task',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      assigned_to: user1.id,
      created_by: admin.id,
      estimated_hours: 4,
      parent_task_id: parentTask.id
    });

    await taskModel.create({
      project_id: project.id,
      title: 'Child Task 2',
      description: 'Second child task',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      assigned_to: user1.id,
      created_by: admin.id,
      estimated_hours: 4,
      parent_task_id: parentTask.id
    });

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
