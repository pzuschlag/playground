from http.server import HTTPServer, BaseHTTPRequestHandler
import json, http.client, socket


class UnixHTTP(http.client.HTTPConnection):
    def __init__(self, sock_path):
        super().__init__("localhost")
        self.sock_path = sock_path

    def connect(self):
        self.sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        self.sock.connect(self.sock_path)


def docker_containers():
    conn = UnixHTTP("/var/run/docker.sock")
    conn.request("GET", "/containers/json?all=true")
    resp = conn.getresponse()
    raw = json.loads(resp.read())
    containers = []
    for c in raw:
        name = c["Names"][0].lstrip("/") if c.get("Names") else "unknown"
        state = c.get("State", "unknown")
        status = c.get("Status", "")
        image = c.get("Image", "").split(":")[0].split("/")[-1]
        ports = ", ".join(
            f"{p.get('PublicPort','')}:{p.get('PrivatePort','')}"
            for p in c.get("Ports", [])
            if p.get("PublicPort")
        )
        containers.append({"name": name, "state": state, "status": status, "image": image, "ports": ports})
    return containers


class Handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def do_GET(self):
        if self.path != "/containers":
            self.send_response(404)
            self.end_headers()
            return
        try:
            containers = docker_containers()
            running = sum(1 for c in containers if c["state"] == "running")
            body = json.dumps({"containers": containers, "total": len(containers), "running": running}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(body)
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode())


if __name__ == "__main__":
    print("docker-status listening on :8765")
    HTTPServer(("", 8765), Handler).serve_forever()
