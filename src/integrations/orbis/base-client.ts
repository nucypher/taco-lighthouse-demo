import { OrbisDB } from "@useorbis/db-sdk";
import { ORBIS_CONFIG } from "./config";

export const orbisdb = new OrbisDB({
  ceramic: { gateway: ORBIS_CONFIG.CERAMIC_NODE_URL },
  nodes: [{ gateway: ORBIS_CONFIG.ORBIS_NODE_URL, env: ORBIS_CONFIG.ENVIRONMENT_ID }]
});

export class BaseOrbisClient {
  protected query<T>(modelId: string) {
    return orbisdb
      .select()
      .from(modelId)
      .context(ORBIS_CONFIG.CONTEXT_ID);
  }

  protected async insert<T>(modelId: string, data: T) {
    return orbisdb
      .insert(modelId)
      .value(data)
      .context(ORBIS_CONFIG.CONTEXT_ID)
      .run();
  }
}
