#!/bin/sh
set -e

# Replace NEXT_PUBLIC_* placeholders in the built JS and prerendered HTML
# files with actual runtime env vars. Lets a single image serve every env.

replace_placeholder() {
  placeholder="$1"
  value="$2"

  if [ -n "$value" ]; then
    find /app/.next -type f \( -name "*.js" -o -name "*.html" \) -exec sed -i "s|${placeholder}|${value}|g" {} +
    find /app -maxdepth 1 -name "server.js" -exec sed -i "s|${placeholder}|${value}|g" {} +
  fi
}

replace_placeholder "__NEXT_PUBLIC_ENVIRONMENT__" "$NEXT_PUBLIC_ENVIRONMENT"

echo "Runtime env injected successfully"

exec "$@"
