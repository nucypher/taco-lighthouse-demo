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
      console.log('Fetching Orbis user for address:', address);
      const { rows } = await this.query(ORBIS_CONFIG.MODELS.USERS)
        .where('controller', 'did:pkh:eip155:1:' + address.toLowerCase())
        .run();

      console.log('Orbis user query result:', rows);
      return rows?.length ? this.convertToOrbisUser(rows[0]) : null;
    } catch (error) {
      console.error('❌ Error fetching Orbis user:', error);
      throw error;
    }
  }

  async createOrbisUser(address: string): Promise<OrbisUser> {
    try {
      console.log('Creating new Orbis user for address:', address);
      const userData = {
        name: address,
        controller: 'did:pkh:eip155:1:' + address.toLowerCase()
      };
      
      const result = await this.insert(ORBIS_CONFIG.MODELS.USERS, userData);
      console.log('Created Orbis user:', result);
      return this.convertToOrbisUser(result);
    } catch (error) {
      console.error('❌ Error creating Orbis user:', error);
      throw error;
    }
  }

  async connectOrbisUser(address: string): Promise<OrbisUser> {
    console.log('Connecting Orbis user for address:', address);
    const existingUser = await this.getOrbisUser(address);
    if (existingUser) {
      console.log('Found existing Orbis user:', existingUser);
      return existingUser;
    }
    console.log('No existing user found, creating new one...');
    return this.createOrbisUser(address);
  }
}

export const userClient = new UserClient();