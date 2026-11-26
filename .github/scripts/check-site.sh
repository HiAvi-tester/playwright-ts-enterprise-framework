#!/usr/bin/env bash
# Preflight: fail fast, with a clear message, when a public demo site is down,
# rate-limiting, or serving a bot-protection page to CI, instead of letting every
# test fail with confusing errors.
#
# Usage: bash .github/scripts/check-site.sh "<Site name>" <url> [<expected-body-regex>]
#   expected-body-regex  optional; when given, the response body must match it
#                        (e.g. '"responseCode"' for a JSON API). Catches sites that
#                        answer HTTP 200 with an HTML challenge page instead of data.
set -u

name="$1"
url="$2"
expect="${3:-}"
body="$(mktemp)"
trap 'rm -f "$body"' EXIT
code="000"
reason=""

for attempt in 1 2 3; do
  code=$(curl -s -o "$body" -w '%{http_code}' --max-time 20 -L "$url" || true)
  if [[ ! "$code" =~ ^[23][0-9][0-9]$ ]]; then
    reason="returned HTTP ${code:-000}"
  elif [[ -n "$expect" ]] && ! grep -Eq "$expect" "$body"; then
    reason="returned HTTP $code but not the expected content (got: $(head -c 120 "$body" | tr -s '[:space:]' ' '))"
  else
    echo "$name is reachable: $url -> HTTP $code${expect:+, body matches /$expect/}"
    exit 0
  fi
  echo "Attempt $attempt/3: $name $reason"
  [[ $attempt -lt 3 ]] && sleep 15
done

echo "::error title=${name} unavailable::${name} (${url}) ${reason} after 3 attempts. The public demo site is down, rate-limiting, or serving a bot-protection page to CI runners. This is not a test failure; the tests did not run."
exit 1
