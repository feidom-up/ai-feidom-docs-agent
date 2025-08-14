
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { weatherWorkflow } from './workflows/weather-workflow';
import { weatherAgent } from './agents/weather-agent';
import { docsWorkflow } from './workflows/docs-workflow';
import { docsAgent } from './agents/docs-agent';
import { CloudflareDeployer } from "@mastra/deployer-cloudflare";
export const mastra = new Mastra({
  workflows: { weatherWorkflow, docsWorkflow },
  agents: { weatherAgent, docsAgent },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  deployer: new CloudflareDeployer({
    projectName: "ai-feidom-docs-agent",
    routes: [
      {
        pattern: "wf-bond.us/*",
        zone_name: "wf-bond.us",
        custom_domain: true,
      },
    ],
    workerNamespace: "ai-feidom-docs-agent",
  }),
});
