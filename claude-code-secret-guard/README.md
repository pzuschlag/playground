# claude-code-secret-guard

Ein `PreToolUse`-Hook für [Claude Code](https://claude.com/claude-code), der jeden `Bash`-,
`Write`- und `Edit`-Aufruf **vor** der Ausführung auf hartkodierte Secrets prüft. Findet er einen
eindeutigen, präfixierten Token (AWS-Key, GitHub-Token, Google-API-Key, Private-Key-Block), wird
der Aufruf geblockt. Findet er ein generisches Muster (`api_key = "…"`, langes Bearer-Token, JWT),
fragt er stattdessen nach — statt es einfach durchzulassen oder pauschal zu blocken.

## Warum zwei Vertrauensstufen statt einer

- **`deny`** für Muster wie `AKIA…`, `ghp_…`, `sk_live_…`, `AIza…` oder einen
  `-----BEGIN PRIVATE KEY-----`-Block. Diese Präfixe sind vendor-spezifisch — ein False Positive
  ist praktisch ausgeschlossen. Hier lohnt sich harter Block.
- **`ask`** für alles, das nur der *Form* nach nach einem Secret aussieht: eine Variable namens
  `apiKey`/`secret`/`password`/`token`, der ein langer String zugewiesen wird, oder ein
  Bearer-Token. Das kann ein echtes Secret sein — oder ein Platzhalter, ein Test-Fixture, oder
  einfach `apiKey: process.env.API_KEY`. Ein Tool, das hier hart blockt, produziert genug False
  Positives, dass man es nach einer Woche wieder abschaltet. Also: nachfragen statt entscheiden.

Klarer erkannte Fälle wie `process.env`-Reads, `os.environ`, `{{PLACEHOLDER}}` oder `<YOUR_KEY>`
werden von der `ask`-Stufe explizit ausgenommen.

## Installation

```bash
mkdir -p .claude/hooks
cp claude-code-secret-guard/hooks/detect-secrets.sh .claude/hooks/
chmod +x .claude/hooks/detect-secrets.sh
```

Dann `settings.example.json` in `.claude/settings.json` (oder `settings.local.json`) übernehmen
bzw. den `hooks.PreToolUse`-Block dort ergänzen.

## Der Hook-Vertrag, den dieses Beispiel nutzt

Claude Code schickt das Tool-Call-Event als JSON auf **stdin** (nicht als Argumente) und erwartet
die Entscheidung als JSON auf **stdout**:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "…wird dem Menschen angezeigt…"
  }
}
```

- Keine Ausgabe + Exit 0 = neutral, normaler Permission-Flow greift.
- Exit 2 würde immer blocken, unabhängig von der JSON-Ausgabe — für dieses Beispiel bewusst nicht
  genutzt, weil es die `ask`-Stufe unmöglich macht.
- Ein Timeout (Default ~5 s) blockt **nicht** — er fällt still durch. Das Script hier braucht
  Millisekunden, ist also kein Risiko.

## Selbst testen, ohne Claude Code laufen zu lassen

```bash
for f in fixtures/*.json; do
  echo "== $f =="
  jq -c . "$f" | hooks/detect-secrets.sh
done
```

| Fixture | Erwartung |
|---|---|
| `bash-with-aws-key.json` | `deny` (AWS-Key-Präfix) |
| `write-with-generic-secret.json` | `ask` (generische `apiKey = "…"`-Zuweisung) |
| `write-with-env-reference.json` | keine Ausgabe, Exit 0 (`process.env` erkannt) |
| `bash-harmless.json` | keine Ausgabe, Exit 0 (`git status`) |

## Abhängigkeiten

`bash` + `jq`. Nichts zu installieren, kein npm, kein Python.

## Kein Ersatz für echtes Secret-Scanning

Das hier ist ein Guardrail für den Moment, in dem Claude selbst gerade etwas schreiben will — kein
Ersatz für [gitleaks](https://github.com/gitleaks/gitleaks), pre-commit-Hooks oder Repo-weites
Scanning. Die Regex-Muster decken die üblichen Verdächtigen ab, nicht jedes denkbare Secret-Format.
