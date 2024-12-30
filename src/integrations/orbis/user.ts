import { BaseOrbisClient } from "./base-client";
import { ORBIS_CONFIG } from "./config";

export interface OrbisUser {
  id?: string;
  name: string;
  created_at?: string;
  updated_at?: string;
  avatar_url?: string;
  controller?: string;
}

export class UserClient extends BaseOrbisClient {
  private convertToOrbisUser(doc: any): OrbisUser {
    return {
      id: doc.stream_id || doc.id,
      name: doc.name || '',
      created_at: doc.created_at,
      updated_at: doc.updated_at,
      avatar_url: doc.avatar_url,
      controller: doc.controller
    };
  }

  async getOrbisUser(address: string): Promise<OrbisUser | null> {
    try {
      const { rows } = await this.query(ORBIS_CONFIG.MODELS.USERS)
        .where({ name: address })
        .run();

      return rows?.length ? this.convertToOrbisUser(rows[0]) : null;
    } catch (error) {
      console.error('❌ Error fetching Orbis user:', error);
      throw error;
    }
  }

  async createOrbisUser(address: string): Promise<OrbisUser> {
    try {
      const result = await this.insert(ORBIS_CONFIG.MODELS.USERS, { name: address });
      return this.convertToOrbisUser(result);
    } catch (error) {
      console.error('❌ Error creating Orbis user:', error);
      throw error;
    }
  }

  async connectOrbisUser(address: string): Promise<OrbisUser> {
    const existingUser = await this.getOrbisUser(address);
    return existingUser || this.createOrbisUser(address);
  }
}

export const userClient = new UserClient();