#!/bin/bash

# Script de Instalação Automatizada do Sistema PAPEM-35
# Marinha do Brasil - PAPEM-35

echo "==========================================="
echo "    INSTALAÇÃO DO SISTEMA PAPEM-35"
echo "    Marinha do Brasil"
echo "==========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCESSO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

# Verificar se está rodando como root
if [[ $EUID -eq 0 ]]; then
   log_error "Este script não deve ser executado como root!"
   exit 1
fi

# Verificar dependências
log_info "Verificando dependências..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js não encontrado. Instale o Node.js 18 ou superior."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
log_success "Node.js v$NODE_VERSION encontrado"

# Verificar PostgreSQL
if ! command -v psql &> /dev/null; then
    log_error "PostgreSQL não encontrado. Instale o PostgreSQL primeiro."
    exit 1
fi

POSTGRES_VERSION=$(psql --version | grep -o '[0-9]\+\.[0-9]\+' | head -1)
log_success "PostgreSQL v$POSTGRES_VERSION encontrado"

# Solicitar informações do banco
echo ""
log_info "Configuração do banco de dados PostgreSQL:"
read -p "Nome do banco (padrão: papem35_sistema): " DB_NAME
DB_NAME=${DB_NAME:-papem35_sistema}

read -p "Usuário do banco (padrão: papem35): " DB_USER
DB_USER=${DB_USER:-papem35}

read -s -p "Senha do banco: " DB_PASSWORD
echo ""

read -p "Host do banco (padrão: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Porta do banco (padrão: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

# Testar conexão com banco
log_info "Testando conexão com banco..."
export PGPASSWORD=$DB_PASSWORD
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" &> /dev/null; then
    log_success "Conexão com banco estabelecida com sucesso!"
else
    log_error "Falha na conexão com banco. Verifique as credenciais."
    exit 1
fi

# Instalar dependências do Node.js
log_info "Instalando dependências..."
npm install
if [ $? -ne 0 ]; then
    log_error "Falha ao instalar dependências"
    exit 1
fi
log_success "Dependências instaladas com sucesso!"

# Criar arquivo .env
log_info "Criando arquivo de configuração..."
cat > .env << EOF
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME
SESSION_SECRET=$(openssl rand -hex 32)
NODE_ENV=development
EOF
log_success "Arquivo .env criado!"

# Criar diretórios de upload
log_info "Criando diretórios de upload..."
mkdir -p uploads/videos
mkdir -p uploads/documents
chmod 755 uploads/
chmod 755 uploads/videos/
chmod 755 uploads/documents/
log_success "Diretórios criados!"

# Importar dados do banco
log_info "Importando dados do banco..."
if [ -f "papem35_backup_completo.sql" ]; then
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f papem35_backup_completo.sql &> /dev/null
    if [ $? -eq 0 ]; then
        log_success "Dados importados com sucesso!"
    else
        log_warning "Falha ao importar backup completo. Tentando estrutura + dados..."
        npm run db:push
        if [ -f "papem35_dados_apenas.sql" ]; then
            psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f papem35_dados_apenas.sql &> /dev/null
            log_success "Dados importados separadamente!"
        fi
    fi
else
    log_warning "Arquivo de backup não encontrado. Criando apenas estrutura..."
    npm run db:push
fi

# Criar script de backup
log_info "Criando script de backup..."
cat > backup_papem35.sh << 'EOF'
#!/bin/bash
source .env
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump "$DATABASE_URL" > "backup_papem35_$DATE.sql"
echo "Backup criado: backup_papem35_$DATE.sql"
EOF
chmod +x backup_papem35.sh
log_success "Script de backup criado!"

# Finalizar instalação
echo ""
log_success "==========================================="
log_success "    INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
log_success "==========================================="
echo ""
log_info "Para iniciar o sistema:"
echo "  npm run dev"
echo ""
log_info "Acesso ao sistema:"
echo "  URL: http://localhost:5000"
echo ""
log_info "Credenciais de teste:"
echo "  Admin: NIP 12.3456.78 / Senha: password"
echo "  Militar: NIP 98.7654.32 / Senha: password"
echo ""
log_info "Para fazer backup:"
echo "  ./backup_papem35.sh"
echo ""
log_warning "IMPORTANTE: Altere as senhas padrão em produção!"
echo ""