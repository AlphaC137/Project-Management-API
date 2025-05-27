import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export class UserModel {
  constructor(private pool: Pool) {}

  async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'password_hash'> & { password: string }): Promise<User> {
    const password_hash = await bcrypt.hash(userData.password, 12);
    const id = uuidv4();

    const result = await this.pool.query(
      `INSERT INTO users (
        id, email, password_hash, first_name, last_name, 
        avatar_url, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        id,
        userData.email.toLowerCase(),
        password_hash,
        userData.first_name,
        userData.last_name,
        userData.avatar_url,
        userData.is_active ?? true,
      ]
    );

    return result.rows[0];
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email.toLowerCase()]
    );
    return result.rows[0] || null;
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }
}
