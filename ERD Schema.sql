// Project Management API - Entity Relationship Diagram
// Copy this code to dbdiagram.io for visualization

Table users {
  id uuid [primary key, default: `gen_random_uuid()`]
  email varchar(255) [unique, not null]
  password_hash varchar(255) [not null]
  first_name varchar(100) [not null]
  last_name varchar(100) [not null]
  avatar_url varchar(500)
  phone varchar(20)
  timezone varchar(50) [default: 'UTC']
  language varchar(10) [default: 'en']
  is_active boolean [default: true]
  last_login_at timestamp
  email_verified_at timestamp
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  deleted_at timestamp

  indexes {
    email
    (deleted_at, is_active)
    created_at
  }
}

Table organizations {
  id uuid [primary key, default: `gen_random_uuid()`]
  name varchar(255) [not null]
  slug varchar(100) [unique, not null]
  description text
  logo_url varchar(500)
  website varchar(255)
  settings jsonb [default: '{}']
  subscription_tier varchar(50) [default: 'free']
  subscription_expires_at timestamp
  billing_email varchar(255)
  created_by uuid [ref: > users.id]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  deleted_at timestamp

  indexes {
    slug
    created_by
    subscription_tier
    deleted_at
  }
}

Table organization_members {
  id uuid [primary key, default: `gen_random_uuid()`]
  organization_id uuid [ref: > organizations.id, not null]
  user_id uuid [ref: > users.id, not null]
  role varchar(50) [not null, default: 'member'] // owner, admin, member, viewer
  permissions jsonb [default: '{}']
  invited_by uuid [ref: > users.id]
  invited_at timestamp
  joined_at timestamp
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]

  indexes {
    (organization_id, user_id) [unique]
    organization_id
    user_id
    role
  }
}

Table teams {
  id uuid [primary key, default: `gen_random_uuid()`]
  organization_id uuid [ref: > organizations.id, not null]
  name varchar(255) [not null]
  description text
  color varchar(7) [default: '#6366f1']
  avatar_url varchar(500)
  settings jsonb [default: '{}']
  created_by uuid [ref: > users.id]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  deleted_at timestamp

  indexes {
    organization_id
    created_by
    deleted_at
  }
}

Table team_members {
  id uuid [primary key, default: `gen_random_uuid()`]
  team_id uuid [ref: > teams.id, not null]
  user_id uuid [ref: > users.id, not null]
  role varchar(50) [not null, default: 'member'] // lead, member
  added_by uuid [ref: > users.id]
  added_at timestamp [default: `now()`]

  indexes {
    (team_id, user_id) [unique]
    team_id
    user_id
  }
}

Table projects {
  id uuid [primary key, default: `gen_random_uuid()`]
  organization_id uuid [ref: > organizations.id, not null]
  name varchar(255) [not null]
  description text
  slug varchar(100) [not null]
  status varchar(50) [not null, default: 'active'] // active, on_hold, completed, cancelled
  priority varchar(20) [default: 'medium'] // low, medium, high, critical
  visibility varchar(20) [default: 'private'] // private, team, organization
  color varchar(7) [default: '#6366f1']
  start_date date
  end_date date
  budget decimal(15,2)
  currency varchar(3) [default: 'USD']
  settings jsonb [default: '{}']
  custom_fields jsonb [default: '{}']
  progress_percentage integer [default: 0]
  created_by uuid [ref: > users.id]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  deleted_at timestamp

  indexes {
    organization_id
    (organization_id, slug) [unique]
    status
    priority
    created_by
    (start_date, end_date)
    deleted_at
  }
}

Table project_members {
  id uuid [primary key, default: `gen_random_uuid()`]
  project_id uuid [ref: > projects.id, not null]
  user_id uuid [ref: > users.id, not null]
  role varchar(50) [not null, default: 'member'] // admin, manager, member, viewer
  permissions jsonb [default: '{}']
  hourly_rate decimal(10,2)
  added_by uuid [ref: > users.id]
  added_at timestamp [default: `now()`]

  indexes {
    (project_id, user_id) [unique]
    project_id
    user_id
    role
  }
}

Table project_teams {
  id uuid [primary key, default: `gen_random_uuid()`]
  project_id uuid [ref: > projects.id, not null]
  team_id uuid [ref: > teams.id, not null]
  added_by uuid [ref: > users.id]
  added_at timestamp [default: `now()`]

  indexes {
    (project_id, team_id) [unique]
    project_id
    team_id
  }
}

Table tasks {
  id uuid [primary key, default: `gen_random_uuid()`]
  project_id uuid [ref: > projects.id, not null]
  parent_task_id uuid [ref: > tasks.id]
  title varchar(500) [not null]
  description text
  task_number varchar(50) [not null] // AUTO-GENERATED: PROJ-001, PROJ-002
  status varchar(50) [not null, default: 'todo'] // todo, in_progress, review, done, cancelled
  priority varchar(20) [default: 'medium'] // low, medium, high, critical
  type varchar(50) [default: 'task'] // task, bug, feature, epic
  tags text
  assigned_to uuid [ref: > users.id]
  reporter_id uuid [ref: > users.id]
  due_date timestamp
  start_date timestamp
  estimated_hours decimal(6,2)
  actual_hours decimal(6,2) [default: 0]
  story_points integer
  custom_fields jsonb [default: '{}']
  position integer [not null, default: 0] // for ordering within project
  created_by uuid [ref: > users.id]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  deleted_at timestamp

  indexes {
    project_id
    (project_id, task_number) [unique]
    parent_task_id
    assigned_to
    reporter_id
    status
    priority
    due_date
    created_by
    deleted_at
    (project_id, position)
  }
}

Table task_dependencies {
  id uuid [primary key, default: `gen_random_uuid()`]
  task_id uuid [ref: > tasks.id, not null]
  depends_on_task_id uuid [ref: > tasks.id, not null]
  dependency_type varchar(50) [default: 'blocks'] // blocks, relates_to
  created_by uuid [ref: > users.id]
  created_at timestamp [default: `now()`]

  indexes {
    (task_id, depends_on_task_id) [unique]
    task_id
    depends_on_task_id
  }
}

Table task_watchers {
  id uuid [primary key, default: `gen_random_uuid()`]
  task_id uuid [ref: > tasks.id, not null]
  user_id uuid [ref: > users.id, not null]
  created_at timestamp [default: `now()`]

  indexes {
    (task_id, user_id) [unique]
    task_id
    user_id
  }
}

Table comments {
  id uuid [primary key, default: `gen_random_uuid()`]
  task_id uuid [ref: > tasks.id, not null]
  user_id uuid [ref: > users.id, not null]
  parent_comment_id uuid [ref: > comments.id]
  content text [not null]
  content_type varchar(20) [default: 'text'] // text, markdown
  mentions text
  is_resolved boolean [default: false]
  resolved_by uuid [ref: > users.id]
  resolved_at timestamp
  edited_at timestamp
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  deleted_at timestamp

  indexes {
    task_id
    user_id
    parent_comment_id
    created_at
    is_resolved
    deleted_at
  }
}

Table files {
  id uuid [primary key, default: `gen_random_uuid()`]
  name varchar(255) [not null]
  original_name varchar(255) [not null]
  file_path varchar(1000) [not null]
  file_size bigint [not null]
  mime_type varchar(100) [not null]
  file_hash varchar(64) [unique]
  thumbnail_path varchar(1000)
  is_public boolean [default: false]
  download_count integer [default: 0]
  uploaded_by uuid [ref: > users.id, not null]
  organization_id uuid [ref: > organizations.id, not null]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  deleted_at timestamp

  indexes {
    uploaded_by
    organization_id
    file_hash
    mime_type
    created_at
    deleted_at
  }
}

Table file_attachments {
  id uuid [primary key, default: `gen_random_uuid()`]
  file_id uuid [ref: > files.id, not null]
  attachable_type varchar(50) [not null] // task, comment, project
  attachable_id uuid [not null]
  attached_by uuid [ref: > users.id]
  attached_at timestamp [default: `now()`]

  indexes {
    file_id
    (attachable_type, attachable_id)
    attached_by
  }
}

Table file_versions {
  id uuid [primary key, default: `gen_random_uuid()`]
  file_id uuid [ref: > files.id, not null]
  version_number integer [not null]
  file_path varchar(1000) [not null]
  file_size bigint [not null]
  change_summary text
  uploaded_by uuid [ref: > users.id, not null]
  created_at timestamp [default: `now()`]

  indexes {
    file_id
    (file_id, version_number) [unique]
    uploaded_by
    created_at
  }
}

Table time_entries {
  id uuid [primary key, default: `gen_random_uuid()`]
  user_id uuid [ref: > users.id, not null]
  task_id uuid [ref: > tasks.id]
  project_id uuid [ref: > projects.id, not null]
  description text
  start_time timestamp [not null]
  end_time timestamp
  duration_minutes integer // calculated field
  is_billable boolean [default: true]
  hourly_rate decimal(10,2)
  is_approved boolean [default: false]
  approved_by uuid [ref: > users.id]
  approved_at timestamp
  tags text
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  deleted_at timestamp

  indexes {
    user_id
    task_id
    project_id
    start_time
    is_billable
    is_approved
    approved_by
    deleted_at
    (user_id, start_time)
  }
}

Table active_timers {
  id uuid [primary key, default: `gen_random_uuid()`]
  user_id uuid [ref: > users.id, not null, unique]
  task_id uuid [ref: > tasks.id, not null]
  project_id uuid [ref: > projects.id, not null]
  description text
  started_at timestamp [not null, default: `now()`]
  last_ping_at timestamp [default: `now()`]

  indexes {
    user_id [unique]
    task_id
    project_id
    started_at
  }
}

Table notifications {
  id uuid [primary key, default: `gen_random_uuid()`]
  user_id uuid [ref: > users.id, not null]
  type varchar(50) [not null]
  title varchar(255) [not null]
  message text [not null]
  data jsonb [default: '{}']
  is_read boolean [default: false]
  read_at timestamp
  related_entity_type varchar(50) // task, project, comment, etc.
  related_entity_id uuid
  created_by uuid [ref: > users.id]
  created_at timestamp [default: `now()`]
  expires_at timestamp

  indexes {
    user_id
    type
    is_read
    created_at
    expires_at
    (related_entity_type, related_entity_id)
  }
}

Table notification_preferences {
  id uuid [primary key, default: `gen_random_uuid()`]
  user_id uuid [ref: > users.id, not null, unique]
  email_notifications boolean [default: true]
  push_notifications boolean [default: true]
  slack_notifications boolean [default: false]
  task_assignments boolean [default: true]
  task_updates boolean [default: true]
  comments boolean [default: true]
  mentions boolean [default: true]
  project_updates boolean [default: false]
  digest_frequency varchar(20) [default: 'daily'] // none, daily, weekly
  quiet_hours_start time [default: '22:00']
  quiet_hours_end time [default: '08:00']
  updated_at timestamp [default: `now()`]

  indexes {
    user_id [unique]
  }
}

Table webhooks {
  id uuid [primary key, default: `gen_random_uuid()`]
  organization_id uuid [ref: > organizations.id, not null]
  name varchar(255) [not null]
  url varchar(1000) [not null]
  secret varchar(255)
  events text
  is_active boolean [default: true]
  last_triggered_at timestamp
  failure_count integer [default: 0]
  created_by uuid [ref: > users.id]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]

  indexes {
    organization_id
    is_active
    created_by
    last_triggered_at
  }
}

Table webhook_deliveries {
  id uuid [primary key, default: `gen_random_uuid()`]
  webhook_id uuid [ref: > webhooks.id, not null]
  event_type varchar(100) [not null]
  payload jsonb [not null]
  response_status integer
  response_body text
  delivered_at timestamp
  failed_at timestamp
  retry_count integer [default: 0]
  created_at timestamp [default: `now()`]

  indexes {
    webhook_id
    event_type
    delivered_at
    failed_at
    created_at
  }
}

Table integrations {
  id uuid [primary key, default: `gen_random_uuid()`]
  organization_id uuid [ref: > organizations.id, not null]
  type varchar(50) [not null] // slack, teams, github, etc.
  name varchar(255) [not null]
  configuration jsonb [default: '{}']
  credentials jsonb [default: '{}'] // encrypted
  is_active boolean [default: true]
  last_sync_at timestamp
  sync_status varchar(50) [default: 'pending']
  error_message text
  created_by uuid [ref: > users.id]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]

  indexes {
    organization_id
    type
    is_active
    created_by
    last_sync_at
  }
}

Table api_keys {
  id uuid [primary key, default: `gen_random_uuid()`]
  organization_id uuid [ref: > organizations.id, not null]
  name varchar(255) [not null]
  key_hash varchar(255) [not null, unique]
  key_prefix varchar(20) [not null]
  permissions jsonb [default: '{}']
  is_active boolean [default: true]
  last_used_at timestamp
  expires_at timestamp
  usage_count integer [default: 0]
  rate_limit integer [default: 1000] // requests per hour
  created_by uuid [ref: > users.id]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]

  indexes {
    organization_id
    key_hash [unique]
    key_prefix
    is_active
    expires_at
    created_by
  }
}

Table audit_logs {
  id uuid [primary key, default: `gen_random_uuid()`]
  organization_id uuid [ref: > organizations.id, not null]
  user_id uuid [ref: > users.id]
  entity_type varchar(50) [not null]
  entity_id uuid [not null]
  action varchar(50) [not null] // create, update, delete, etc.
  old_values jsonb
  new_values jsonb
  ip_address inet
  user_agent text
  created_at timestamp [default: `now()`]

  indexes {
    organization_id
    user_id
    entity_type
    entity_id
    action
    created_at
    (entity_type, entity_id)
  }
}

// Password reset tokens
Table password_reset_tokens {
  id uuid [primary key, default: `gen_random_uuid()`]
  user_id uuid [ref: > users.id, not null]
  token_hash varchar(255) [not null, unique]
  expires_at timestamp [not null]
  used_at timestamp
  created_at timestamp [default: `now()`]

  indexes {
    user_id
    token_hash [unique]
    expires_at
    used_at
  }
}

// Email verification tokens
Table email_verification_tokens {
  id uuid [primary key, default: `gen_random_uuid()`]
  user_id uuid [ref: > users.id, not null]
  token_hash varchar(255) [not null, unique]
  expires_at timestamp [not null]
  verified_at timestamp
  created_at timestamp [default: `now()`]

  indexes {
    user_id
    token_hash [unique]
    expires_at
    verified_at
  }
}

// Session management (optional - if not using stateless JWT)
Table user_sessions {
  id uuid [primary key, default: `gen_random_uuid()`]
  user_id uuid [ref: > users.id, not null]
  session_token varchar(255) [not null, unique]
  refresh_token varchar(255) [unique]
  ip_address inet
  user_agent text
  expires_at timestamp [not null]
  last_accessed_at timestamp [default: `now()`]
  created_at timestamp [default: `now()`]

  indexes {
    user_id
    session_token [unique]
    refresh_token [unique]
    expires_at
    last_accessed_at
  }
}