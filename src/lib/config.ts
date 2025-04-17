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

type Config = {
  baseUrl: string;
  dbUrl: string;

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
