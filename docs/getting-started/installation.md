# Installation

## Local Development (Docker Compose)

This is the recommended way to run DClaw Learn locally. It starts PostgreSQL, the FastAPI backend, and the Next.js frontend in one command.

```bash
# Clone the repo
git clone https://github.com/dclawstack/dclaw-learn.git
cd dclaw-learn

# Copy environment files
cp .env.example .env
cp frontend/.env.example frontend/.env.local   # optional overrides

# Start all services
docker compose up -d
```

Services started:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3008 |
| Backend API | http://localhost:8093 |
| API docs (Swagger) | http://localhost:8093/docs |
| PostgreSQL | localhost:5432 |

The backend automatically runs migrations (`Base.metadata.create_all`) and seeds a sample course on first startup.

### Verify

```bash
docker compose ps            # all services should be "healthy"
curl http://localhost:8093/health   # {"status":"ok","version":"0.1.0"}
```

## Running Without Docker

### Backend only

```bash
cd backend

# Install dependencies
pip install -e ".[dev]"

# Set environment (or export individually)
export DATABASE_URL="postgresql+asyncpg://learn:learn@localhost:5432/dclaw_learn"

# Apply migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --host 0.0.0.0 --port 8093 --reload
```

### Frontend only

```bash
cd frontend

npm install

# Point at your running backend
echo "NEXT_PUBLIC_API_URL=http://localhost:8093" > .env.local

npm run dev   # starts on http://localhost:3008
```

## Kubernetes (Production)

Apply the Helm chart from the `helm/` directory:

```bash
helm upgrade --install dclaw-learn ./helm \
  --namespace dclaw-learn --create-namespace \
  --set backend.image.tag=1.2.0 \
  --set frontend.image.tag=1.2.0 \
  --set ingress.host=learn.yourdomain.com
```

Or use the DClawApp CRD if you are running the DClaw Operator:

```bash
kubectl apply -f - <<EOF
apiVersion: platform.dclaw.io/v1
kind: DClawApp
metadata:
  name: learn
spec:
  appId: learn
  version: 1.2.0
  frontend:
    image: ghcr.io/dclawstack/dclaw-learn-frontend:1.2.0
    replicas: 2
  backend:
    image: ghcr.io/dclawstack/dclaw-learn-backend:1.2.0
    replicas: 2
  database:
    enabled: true
    storage: 10Gi
  ingress:
    enabled: true
    host: learn.yourdomain.com
    tls: true
EOF
```

### Verify Kubernetes

```bash
kubectl get pods -n dclaw-learn
kubectl get ingress -n dclaw-learn
```
