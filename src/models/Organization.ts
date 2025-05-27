import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  settings: Record<string, any>;
  subscription_tier: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export class OrganizationModel {
  constructor(private pool: Pool) {}

  async create(orgData: Omit<Organization, 'id' | 'created_at' | 'updated_at' | 'slug'>): Promise<Organization> {
    const id = uuidv4();
    const slug = await this.generateUniqueSlug(orgData.name);

    const result = await this.pool.query(
      `INSERT INTO organizations (
        id, name, slug, description, settings, 
        subscription_tier
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        id,
        orgData.name,
        slug,
        orgData.description,
        orgData.settings,
        orgData.subscription_tier,
      ]
    );

    return result.rows[0];
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    let slug = slugify(name, { lower: true });
    let counter = 0;
    let uniqueSlug = slug;

    while (true) {
      const exists = await this.pool.query(
        'SELECT id FROM organizations WHERE slug = $1 AND deleted_at IS NULL',
        [uniqueSlug]
      );

      if (exists.rows.length === 0) break;

      counter++;
      uniqueSlug = `${slug}-${counter}`;
    }

    return uniqueSlug;
  }
}
