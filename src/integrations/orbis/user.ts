import { BaseOrbisClient } from "./base-client";
import { ORBIS_CONFIG } from "./config";

export interface OrbisUser {
  id?: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  avatar?: string;
  controller?: string;
}

export class UserClient extends BaseOrbisClient {
  private convertToOrbisUser(doc: any): OrbisUser {
    return {
      id: doc.stream_id || doc.id,
      name: doc.name || '',
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      avatar: doc.avatar,
      controller: doc.controller
    };
  }

  async getOrbisUser(address: string): Promise<OrbisUser | null> {
    try {
      // Ensure the address is properly formatted for Orbis
      const normalizedAddress = address.toLowerCase();
      const walletDid = `did:pkh:eip155:1:${normalizedAddress}`;
      
      console.log('🔍 Fetching Orbis user for DID:', walletDid);
      
      const { rows } = await this.query(ORBIS_CONFIG.MODELS.USERS)
        .where({ controller: walletDid })
        .run();

      console.log('📝 Orbis user query result:', rows);
      
      return rows?.length ? this.convertToOrbisUser(rows[0]) : null;
    } catch (error) {
      console.error('❌ Error fetching Orbis user:', error);
      return null;
    }
  }

  async createOrbisUser(address: string): Promise<OrbisUser> {
    try {
      const result = await this.insert(ORBIS_CONFIG.MODELS.USERS, { 
        name: address,
        controller: `did:pkh:eip155:1:${address.toLowerCase()}`
      });
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