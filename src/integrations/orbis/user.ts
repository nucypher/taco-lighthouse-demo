import { orbisdb } from "./client";

const USER_MODEL_ID = "kjzl6hvfrbw6c7j8otyyccaetle63o1m27zafs06csb24bljk1imyns9klda994";
const ORBIS_CONTEXT_ID = "kjzl6kcym7w8y99fn4i5nup6v978x6wcpox2dem4pmqz9dk1ex1ts0v41tfypea";

export interface OrbisUser {
  id?: string;
  name: string;
  created_at?: string;
}

export async function getOrbisUser(address: string): Promise<OrbisUser | null> {
  console.log('🔍 Fetching Orbis user profile for address:', address);
  try {
    const { rows } = await orbisdb
      .select()
      .from(USER_MODEL_ID)
      .where({ name: address })
      .context(ORBIS_CONTEXT_ID)
      .run();

    if (rows && rows.length > 0) {
      console.log('✅ Found Orbis user:', rows[0]);
      return rows[0] as OrbisUser;
    }
    return null;
  } catch (error) {
    console.error('❌ Error fetching Orbis user:', error);
    throw error;
  }
}

export async function createOrbisUser(address: string): Promise<OrbisUser> {
  console.log('📝 Creating new Orbis user profile for address:', address);
  try {
    const result = await orbisdb
      .insert(USER_MODEL_ID)
      .value({ name: address })
      .context(ORBIS_CONTEXT_ID)
      .run();
      
    console.log('✅ Created Orbis user:', result);
    return result as OrbisUser;
  } catch (error) {
    console.error('❌ Error creating Orbis user:', error);
    throw error;
  }
}

export async function connectOrbisUser(address: string): Promise<OrbisUser> {
  try {
    const existingUser = await getOrbisUser(address);
    if (existingUser) {
      return existingUser;
    }
    return await createOrbisUser(address);
  } catch (error) {
    console.error('❌ Error connecting Orbis user:', error);
    throw error;
  }
}