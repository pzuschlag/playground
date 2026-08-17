# docker-status-api

Ein einziger JSON-Endpoint über den Docker-Socket: `GET /containers` liefert Name, Status, Image
und veröffentlichte Ports aller Container. `server.py` ist ~60 Zeilen **reine Standardbibliothek**
— kein `docker` SDK, kein Flask, keine Abhängigkeiten zu installieren.

```bash
docker compose up
curl localhost:8765/containers
```

```json
{
  "containers": [
    {"name": "pihole", "state": "running", "status": "Up 3 days", "image": "pihole", "ports": "53:53"}
  ],
  "total": 12,
  "running": 11
}
```

## Woher das kommt

Extrahiert aus meinem privaten Homelab-Setup — dort füttert dieser Endpoint ein Monitoring-Dashboard,
das den Zustand aller NAS-Container auf einen Blick zeigt.

## Trade-off, den man kennen sollte

`docker-compose.yml` mountet `/var/run/docker.sock` in den Container. Das gibt dem Container
**faktisch Root-Rechte auf dem Host** — jeder mit Zugriff auf den Socket kann beliebige Container
starten, inklusive privilegierter. Für ein einzelnes Gerät im eigenen LAN ein akzeptabler
Trade-off gegen die Einfachheit von "keine Docker-API-Bibliothek nötig". In einer geteilten oder
von außen erreichbaren Umgebung wäre das nicht vertretbar — dort bräuchte es einen Proxy vor dem
Socket (z.B. `tecnativa/docker-socket-proxy`), der nur die `GET /containers`-Route erlaubt.
