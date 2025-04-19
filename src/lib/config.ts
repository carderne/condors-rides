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

  osKey: string;

  strava: {
    clientId: string;
    clientSecret: string;
  };
  google: {
    clientId: string;
    clientSecret: string;
  };
  facebook: {
    clientId: string;
    clientSecret: string;
  };
};

function getDefaultConfig() {
  return {
    baseUrl: get("BASE_URL"),
    dbUrl: get("DATABASE_URL"),
    encryptionKeys: getEncryptionKeys("ENCRYPTION_KEYS"),

    osKey: get("OS_KEY"),

    strava: {
      clientId: get("STRAVA_CLIENT_ID"),
      clientSecret: get("STRAVA_CLIENT_SECRET"),
    },
    google: {
      clientId: get("GOOGLE_CLIENT_ID"),
      clientSecret: get("GOOGLE_CLIENT_SECRET"),
    },
    facebook: {
      clientId: get("FACEBOOK_CLIENT_ID"),
      clientSecret: get("FACEBOOK_CLIENT_SECRET"),
    },
  };
}

function getDevConfig(): Config {
  return {
    ...getDefaultConfig(),
  };
}

function getTestConfig(): Config {
  return {
    ...getDefaultConfig(),
  };
}

function getPrdConfig(): Config {
  return {
    ...getDefaultConfig(),
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
