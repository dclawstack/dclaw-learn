# Troubleshooting

- [Common Issues](./common-issues.md) — startup failures, database errors, auth problems, quiz and cert issues
- [FAQ](./faq.md) — frequently asked questions

## Quick Diagnostics (Docker Compose)

```bash
# Check all service status
docker compose ps

# Tail backend logs
docker compose logs -f backend

# Tail frontend logs
docker compose logs -f frontend

# Check backend health
curl http://localhost:8093/health

# Connect to the database directly
docker compose exec postgres psql -U learn -d dclaw_learn
```

## Quick Diagnostics (Kubernetes)

```bash
kubectl get pods -n dclaw-learn
kubectl logs -n dclaw-learn deployment/dclaw-learn-backend
kubectl get events -n dclaw-learn --sort-by='.lastTimestamp'
```
