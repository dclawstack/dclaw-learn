FROM python:3.11-slim

WORKDIR /app

RUN pip install --no-cache-dir uvicorn[standard]

COPY pyproject.toml ./
RUN pip install --no-cache-dir -e .

COPY . .

RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8093

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8093/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8093"]
