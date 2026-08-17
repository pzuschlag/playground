# playground

Kuratierte kleine Stücke — kein Monorepo, keine gemeinsame Abhängigkeit zwischen den Ordnern,
jeder Bereich ist für sich lesbar und eigenständig lauffähig.

- **[`claude-code-secret-guard/`](claude-code-secret-guard/)** — ein `PreToolUse`-Hook für Claude
  Code, der Bash-/Write-/Edit-Aufrufe vor der Ausführung auf hartkodierte Secrets prüft und je
  nach Sicherheit blockt oder nachfragt.
- **[`docker-status-api/`](docker-status-api/)** — ein 60-Zeilen-JSON-Endpoint (reine
  Standardbibliothek) über den Docker-Socket, extrahiert aus meinem privaten Homelab-Setup.
- **[`archive/`](archive/)** — zwei ältere Tutorial-Mitschriebe (2018), aufbewahrt statt gelöscht,
  aber klar getrennt vom Rest.

## Lizenz

MIT, siehe [LICENSE](LICENSE)
