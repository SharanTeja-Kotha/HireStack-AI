#!/bin/sh
# Substitute BACKEND_URL at container start.
# Default for local development uses the local FastAPI server.
export BACKEND_URL=${BACKEND_URL:-http://localhost:8000}
export N8N_URL=${N8N_URL:-http://localhost:5678}

echo "🔧 Entrypoint: Substituting BACKEND_URL=$BACKEND_URL N8N_URL=$N8N_URL into nginx config..."
envsubst '$BACKEND_URL $N8N_URL' \
  < /etc/nginx/conf.d/default.conf.template \
  > /etc/nginx/conf.d/default.conf

# Generate runtime env.js so frontend can read API_URL at runtime (overrides build-time config)
export API_URL=${API_URL:-/api}
cat > /usr/share/nginx/html/env.js <<EOF
window.__env = {
  apiUrl: '${API_URL}'
};
EOF

echo "✅ Generated nginx config:"
cat /etc/nginx/conf.d/default.conf | grep -A 5 "location /api/"

echo "🚀 Starting nginx..."
exec nginx -g 'daemon off;'
