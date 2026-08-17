#!/bin/bash
# Claude Code PreToolUse hook: blocks Bash/Write/Edit calls that would
# introduce a hardcoded secret. Reads the tool-call event as JSON on
# stdin -- that's Claude Code's hook contract, there is no argv input.
set -euo pipefail

input="$(cat)"
tool_name="$(jq -r '.tool_name' <<<"$input")"

case "$tool_name" in
  Bash)  to_scan="$(jq -r '.tool_input.command // ""' <<<"$input")" ;;
  Write) to_scan="$(jq -r '.tool_input.content // ""' <<<"$input")" ;;
  Edit)  to_scan="$(jq -r '.tool_input.new_string // ""' <<<"$input")" ;;
  *)     exit 0 ;;  # no opinion on other tools
esac

# High-confidence: vendor-prefixed tokens. A false positive here is
# practically impossible, so we block outright.
high_confidence="AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36}|gho_[A-Za-z0-9]{36}|sk_live_[0-9a-zA-Z]{20,}|AIza[0-9A-Za-z_-]{35}|ntn_[0-9A-Za-z]{40,}|-----BEGIN (RSA|OPENSSH|EC|DSA)? ?PRIVATE KEY-----"

# Lower-confidence: shape-based patterns (generic key/secret/password
# assignment, JWTs, long bearer tokens). These *can* be false positives
# -- placeholders, env-var reads -- so we ask instead of denying outright.
low_confidence="eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}|[Bb]earer [A-Za-z0-9_.-]{30,}|(api[_-]?key|secret|password|token)[[:space:]]*[:=][[:space:]]*[\"'][^\"']{12,}[\"']"

# Common false-positive shapes for the low-confidence patterns: reading
# from an environment variable, or an obvious placeholder.
false_positive="process\.env|os\.environ|getenv|\{\{|YOUR_|<[A-Z_]+>"

deny_reason=""
ask_reason=""

if grep -qE "$high_confidence" <<<"$to_scan"; then
  deny_reason="Looks like a real credential (vendor-prefixed token or private key block) -- blocked before it could be written or executed."
elif grep -qEi "$low_confidence" <<<"$to_scan" && ! grep -qE "$false_positive" <<<"$to_scan"; then
  ask_reason="Could be a hardcoded secret (key/token/password assignment or bearer token). Double-check before proceeding."
fi

if [ -n "$deny_reason" ]; then
  jq -n --arg reason "$deny_reason" \
    '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: $reason}}'
elif [ -n "$ask_reason" ]; then
  jq -n --arg reason "$ask_reason" \
    '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "ask", permissionDecisionReason: $reason}}'
fi

exit 0
