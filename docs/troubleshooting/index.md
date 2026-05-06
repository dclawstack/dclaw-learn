# Troubleshooting

Common issues and solutions for DClaw Learn.

## Quick Diagnostics

```bash
# Check app pods
kubectl get pods -n dclaw-learn

# Check logs
kubectl logs -n dclaw-learn deployment/dclaw-learn-backend

# Check database
kubectl get clusters -n dclaw-learn
```

## Sections

- [Common Issues](./common-issues)
- [FAQ](./faq)
