#!/bin/bash

ENV_VARS=$(dotenvx run -- env)
DATABASE_URL=$(echo "$ENV_VARS" | grep "DATABASE_URL=" | cut -d'=' -f2-)

if [[ "$DATABASE_URL" != *"localhost"* ]]; then
  echo "DATABASE_URL does not contain 'localhost'. Aborting."
  exit 1
fi

exec dotenvx run -- "$@"
