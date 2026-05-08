import { envs } from "@/config/envs.js";
import helmet from "helmet";

export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      // Setup providers here
    },
    // drill mode, after test you app set to false
    reportOnly: envs.NODE_ENV === "production",
  },
  strictTransportSecurity: {
    maxAge: 365 * 24 * 60 * 60 * 1000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin",
  },
});
