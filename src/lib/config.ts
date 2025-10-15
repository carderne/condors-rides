function get(name: string): string {
  const noCheckEnvVars = process.env.NO_CHECK_ENV_VARS === "1";
  const variable = process.env[name];
  if (variable) {
    return variable;
  } else {
    if (noCheckEnvVars) {
      return "";
    }
    throw new Error(`Startup aborted: env var missing: ${name}`);
  }
}

function getEncryptionKeys(name: string): [string, ...string[]] {
  const raw = get(name);
  const arr = raw.split(",").map((k) => k.trim());
  const [first, ...rest] = arr;
  if (!first) {
    throw new Error(`Startup aborted: encryption keys missing: ${name}`);
  }
  return [first, ...rest];
}

type Config = {
  baseUrl: string;
  dbUrl: string;
  encryptionKeys: [string, ...string[]];
  emailAndPasswordEnabled: boolean;

  osKey: string;

  vapid: {
    public: string;
    private: string;
  };
  firebase: {
    projectId: string;
    serviceAccountB64: string;
  };

  posthog: {
    key: string;
  };
  strava: {
    clientId: string;
    clientSecret: string;
  };
  ridewithgps: {
    apiKey: string;
    authToken: string;
  };
  google: {
    clientId: string;
    clientSecret: string;
  };
  facebook: {
    clientId: string;
    clientSecret: string;
  };
  pirateWeather: {
    apiKey: string;
  };
};

function getDefaultConfig() {
  return {
    baseUrl: get("BASE_URL"),
    dbUrl: get("DATABASE_URL"),
    encryptionKeys: getEncryptionKeys("ENCRYPTION_KEYS"),

    osKey: get("OS_KEY"),

    vapid: {
      public: get("NEXT_PUBLIC_VAPID_PUBLIC_KEY"),
      private: get("VAPID_PRIVATE_KEY"),
    },
    firebase: {
      projectId: get("FIREBASE_PROJECT_ID"),
      serviceAccountB64: get("FIREBASE_SERVICE_ACCOUNT_B64"),
    },

    posthog: {
      key: get("POSTHOG_KEY"),
    },
    strava: {
      clientId: get("STRAVA_CLIENT_ID"),
      clientSecret: get("STRAVA_CLIENT_SECRET"),
    },
    ridewithgps: {
      apiKey: get("RIDEWITHGPS_API_KEY"),
      authToken: get("RIDEWITHGPS_AUTH_TOKEN"),
    },
    google: {
      clientId: get("GOOGLE_CLIENT_ID"),
      clientSecret: get("GOOGLE_CLIENT_SECRET"),
    },
    facebook: {
      clientId: get("FACEBOOK_CLIENT_ID"),
      clientSecret: get("FACEBOOK_CLIENT_SECRET"),
    },

    pirateWeather: {
      apiKey: get("PIRATEWEATHER_API_KEY"),
    },
  };
}

function getDevConfig(): Config {
  return {
    ...getDefaultConfig(),
    emailAndPasswordEnabled: true,
  };
}

function getTestConfig(): Config {
  return {
    ...getDefaultConfig(),
    emailAndPasswordEnabled: true,
  };
}

function getPrdConfig(): Config {
  return {
    ...getDefaultConfig(),
    emailAndPasswordEnabled: false,
  };
}

export function getConfig(): Config {
  if (process.env.NODE_ENV === "production") {
    return getPrdConfig();
  } else if (process.env.IN_TEST === "1") {
    return getTestConfig();
  } else {
    return getDevConfig();
  }
}
