#!/bin/bash

# Script para build e exportação do Sistema PAPEM-35
# Marinha do Brasil - Setor PAPEM-35

echo "🚀 Iniciando build do Sistema PAPEM-35..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker não encontrado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "Arquivo package.json não encontrado. Execute o script no diretório raiz do projeto."
    exit 1
fi

# Nome da imagem
IMAGE_NAME="papem35-sistema"
TAG="latest"
FULL_IMAGE_NAME="$IMAGE_NAME:$TAG"

log "Construindo imagem Docker..."

# Build da imagem
if docker build -t $FULL_IMAGE_NAME .; then
    success "Imagem construída com sucesso!"
else
    error "Falha ao construir a imagem Docker"
    exit 1
fi

# Criar diretório de distribuição
DIST_DIR="distribuicao"
mkdir -p $DIST_DIR

log "Exportando imagem para arquivo..."

# Exportar imagem como arquivo tar
TAR_FILE="$DIST_DIR/papem35-sistema.tar"
if docker save -o $TAR_FILE $FULL_IMAGE_NAME; then
    success "Imagem exportada para: $TAR_FILE"
else
    error "Falha ao exportar imagem"
    exit 1
fi

# Criar arquivo de instruções para instalação
cat > "$DIST_DIR/INSTALACAO.md" << 'EOF'
# Sistema PAPEM-35 - Instalação via Docker

## Pré-requisitos
- Docker instalado no sistema
- Porta 5001 disponível

## Instalação Rápida

### 1. Carregar a imagem
```bash
docker load -i papem35-sistema.tar
```

### 2. Executar o sistema
```bash
# Criar rede
docker network create papem35-network

# Executar PostgreSQL
docker run -d --name papem35-db \
  --network papem35-network \
  -e POSTGRES_DB=papem35 \
  -e POSTGRES_USER=papem35_user \
  -e POSTGRES_PASSWORD=papem35_password \
  -v papem35_data:/var/lib/postgresql/data \
  postgres:15-alpine

# Aguardar banco inicializar
sleep 10

# Executar aplicação
docker run -d --name papem35-app \
  --network papem35-network \
  -p 5001:5001 \
  -e DATABASE_URL=postgresql://papem35_user:papem35_password@papem35-db:5432/papem35 \
  -v ./uploads:/app/uploads \
  papem35-sistema:latest
```

### 3. Acessar o sistema
Abra o navegador em: http://localhost:5001

## Credenciais de Teste
| Tipo | NIP | Senha |
|------|-----|-------|
| Administrador | 12.3456.78 | password |
| Militar | 98.7654.32 | password |

## Comandos Úteis

### Verificar status
```bash
docker ps
```

### Ver logs
```bash
docker logs papem35-app
docker logs papem35-db
```

### Parar sistema
```bash
docker stop papem35-app papem35-db
```

### Reiniciar sistema
```bash
docker start papem35-db
sleep 5
docker start papem35-app
```

### Fazer backup do banco
```bash
docker exec papem35-db pg_dump -U papem35_user papem35 > backup_$(date +%Y%m%d).sql
```

---
**⚓ Sistema PAPEM-35 - Marinha do Brasil ⚓**
EOF

# Criar script de instalação automática
cat > "$DIST_DIR/instalar_docker.sh" << 'EOF'
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
  -p 5001:5001 \
  -e DATABASE_URL=postgresql://papem35_user:papem35_password@papem35-db:5432/papem35 \
  -v papem35_uploads:/app/uploads \
  -v papem35_backups:/app/backups \
  --restart unless-stopped \
  papem35-sistema:latest

echo "✅ Sistema PAPEM-35 instalado com sucesso!"
echo "🌐 Acesse: http://localhost:5001"
echo ""
echo "Credenciais de teste:"
echo "Admin: NIP 12.3456.78 / Senha: password"
echo "Militar: NIP 98.7654.32 / Senha: password"
EOF

# Tornar script executável
chmod +x "$DIST_DIR/instalar_docker.sh"

# Calcular tamanho do arquivo
SIZE=$(du -h $TAR_FILE | cut -f1)

success "Build concluído com sucesso!"
echo ""
echo "📦 Arquivos criados:"
echo "   • $TAR_FILE ($SIZE)"
echo "   • $DIST_DIR/INSTALACAO.md"
echo "   • $DIST_DIR/instalar_docker.sh"
echo ""
warning "Para distribuir, envie toda a pasta '$DIST_DIR'"
echo ""
echo "🚀 Para testar localmente:"
echo "   cd $DIST_DIR && ./instalar_docker.sh"
