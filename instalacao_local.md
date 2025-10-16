# Instalação Local do Sistema PAPEM-35

Este guia explica como instalar e configurar o Sistema PAPEM-35 na sua máquina local.

## 1. Pré-requisitos

### Instalar Node.js
```bash
# Baixar e instalar Node.js 18 ou superior
# https://nodejs.org/en/download/

# Verificar instalação
node --version
npm --version
```

### Instalar PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Windows
# Baixar do site oficial: https://www.postgresql.org/download/windows/

# macOS
brew install postgresql
```

## 2. Configurar PostgreSQL

### Criar usuário e banco de dados
```bash
# Entrar no PostgreSQL
sudo -u postgres psql

# Criar usuário
CREATE USER papem35 WITH PASSWORD 'sua_senha_aqui';

# Criar banco de dados
CREATE DATABASE papem35_sistema OWNER papem35;

# Dar permissões
GRANT ALL PRIVILEGES ON DATABASE papem35_sistema TO papem35;

# Sair do PostgreSQL
\q
```

### Configurar conexão
```bash
# Testar conexão
psql -h localhost -U papem35 -d papem35_sistema
```

## 3. Baixar e Configurar o Sistema

### Clonar/Baixar o código
```bash
# Extrair o código do sistema para uma pasta
mkdir papem35-sistema
cd papem35-sistema
# (copiar todos os arquivos do sistema aqui)
```

### Instalar dependências
```bash
npm install
```

### Configurar variáveis de ambiente
```bash
# Criar arquivo .env na raiz do projeto
touch .env

# Adicionar ao arquivo .env:
DATABASE_URL=postgresql://papem35:sua_senha_aqui@localhost:5432/papem35_sistema
SESSION_SECRET=sua_chave_secreta_muito_longa_e_segura_aqui
NODE_ENV=development
```

## 4. Importar Dados do Banco

### Opção 1: Importar backup completo
```bash
# Importar estrutura e dados
psql -h localhost -U papem35 -d papem35_sistema -f papem35_backup_completo.sql
```

### Opção 2: Criar estrutura e importar dados
```bash
# 1. Aplicar estrutura do banco
npm run db:push

# 2. Importar apenas os dados
psql -h localhost -U papem35 -d papem35_sistema -f papem35_dados_apenas.sql
```

## 5. Iniciar o Sistema

### Modo desenvolvimento
```bash
npm run dev
```

### Modo produção
```bash
# Build do projeto
npm run build

# Iniciar servidor
npm start
```

## 6. Acessar o Sistema

### URL Local
```
http://localhost:5001
```

### Credenciais de Teste
- **Admin**: NIP `12.3456.78` / Senha `password`
- **Militar**: NIP `98.7654.32` / Senha `password`

## 7. Configurações Adicionais

### Criar pasta para uploads
```bash
mkdir -p uploads/videos
mkdir -p uploads/documents
```

### Configurar permissões (Linux/macOS)
```bash
chmod 755 uploads/
chmod 755 uploads/videos/
chmod 755 uploads/documents/
```

### Backup automático (opcional)
```bash
# Criar script de backup
cat > backup_papem35.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U papem35 papem35_sistema > "backup_papem35_$DATE.sql"
echo "Backup criado: backup_papem35_$DATE.sql"
EOF

chmod +x backup_papem35.sh
```

## 8. Estrutura Final

```
papem35-sistema/
├── client/                 # Frontend
├── server/                 # Backend
├── shared/                 # Código compartilhado
├── uploads/               # Arquivos enviados
│   ├── videos/
│   └── documents/
├── .env                   # Variáveis de ambiente
├── package.json
├── papem35_backup_completo.sql
├── papem35_dados_apenas.sql
└── backup_papem35.sh
```

## 9. Solução de Problemas

### Erro de conexão com banco
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Iniciar PostgreSQL se necessário
sudo systemctl start postgresql
```

### Porta já em uso
```bash
# Verificar processos na porta 5001
lsof -i :5001

# Matar processo se necessário
kill -9 [PID]
```

### Problemas com uploads
```bash
# Verificar permissões
ls -la uploads/

# Corrigir permissões
chmod -R 755 uploads/
```

## 10. Manutenção

### Backup regular
```bash
# Executar backup
./backup_papem35.sh

# Ou manualmente
pg_dump -h localhost -U papem35 papem35_sistema > backup_$(date +%Y%m%d).sql
```

### Atualização do sistema
```bash
# Atualizar dependências
npm update

# Aplicar mudanças no banco
npm run db:push
```

---

**Importante**: Este sistema é oficial da Marinha do Brasil - PAPEM-35. Mantenha as credenciais seguras e faça backups regulares.