#!/bin/bash

echo "🚀 Instalando Sistema PAPEM-35..."

# Carregar imagem
echo "Carregando imagem Docker..."
docker load -i papem35-sistema.tar

# Criar rede
echo "Criando rede Docker..."
docker network create papem35-network 2>/dev/null || true

# Parar containers existentes
echo "Parando containers existentes..."
docker stop papem35-app papem35-db 2>/dev/null || true
docker rm papem35-app papem35-db 2>/dev/null || true

# Executar PostgreSQL
echo "Iniciando banco de dados..."
docker run -d --name papem35-db \
  --network papem35-network \
  -e POSTGRES_DB=papem35 \
  -e POSTGRES_USER=papem35_user \
  -e POSTGRES_PASSWORD=papem35_password \
  -v papem35_data:/var/lib/postgresql/data \
  --restart unless-stopped \
  postgres:15-alpine

# Aguardar banco inicializar
echo "Aguardando banco inicializar..."
sleep 15

# Executar aplicação
echo "Iniciando aplicação..."
docker run -d --name papem35-app \
  --network papem35-network \
  -p 5000:5000 \
  -e DATABASE_URL=postgresql://papem35_user:papem35_password@papem35-db:5432/papem35 \
  -v papem35_uploads:/app/uploads \
  -v papem35_backups:/app/backups \
  --restart unless-stopped \
  papem35-sistema:latest

echo "✅ Sistema PAPEM-35 instalado com sucesso!"
echo "🌐 Acesse: http://localhost:5000"
echo ""
echo "Credenciais de teste:"
echo "Admin: NIP 12.3456.78 / Senha: password"
echo "Militar: NIP 98.7654.32 / Senha: password"
