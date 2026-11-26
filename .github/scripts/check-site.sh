#!/usr/bin/env bash
# Preflight: fail fast, with a clear message, when a public demo site is down or
# rate-limiting, instead of letting every test time out with confusing errors.
#
# Usage: bash .github/scripts/check-site.sh "<Site name>" <url>
set -u

name="$1"
url="$2"
code="000"

for attempt in 1 2 3; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 -L "$url" || true)
  if [[ "$code" =~ ^[23][0-9][0-9]$ ]]; then
    echo "$name is reachable: $url -> HTTP $code"
    exit 0
  fi
  echo "Attempt $attempt/3: $name returned HTTP ${code:-000} for $url"
  [[ $attempt -lt 3 ]] && sleep 15
done

echo "::error title=${name} unavailable::${name} (${url}) returned HTTP ${code:-000} after 3 attempts. This is an outage or rate limit of the public demo site, not a test failure. Re-run the job later."
exit 1
