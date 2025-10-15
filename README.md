# Sistema PAPEM-35 - Marinha do Brasil

Sistema completo de treinamento militar desenvolvido para o setor PAPEM-35 da Marinha do Brasil. Permite gestão de vídeos de treinamento, biblioteca de documentos e sistema de avisos com controle de acesso baseado em roles.

## 🚀 Instalação Rápida

### Método 1: Script Automatizado (Recomendado)
```bash
# Tornar o script executável
chmod +x instalar_papem35.sh

# Executar instalação
./instalar_papem35.sh
```

### Método 2: Instalação Manual
Consulte o arquivo `instalacao_local.md` para instruções detalhadas.

## 📋 Pré-requisitos

- **Node.js** 18 ou superior
- **PostgreSQL** 12 ou superior
- **Sistema Operacional**: Linux, macOS ou Windows

## 🎯 Funcionalidades

### Para Militares
- ✅ Assistir vídeos de treinamento
- ✅ Baixar documentos técnicos
- ✅ Receber avisos importantes
- ✅ Acompanhar progresso pessoal
- ✅ Obter certificados de conclusão

### Para Administradores
- ✅ Gerenciar usuários e permissões
- ✅ Upload de vídeos e documentos
- ✅ Criar avisos e comunicados
- ✅ Monitorar estatísticas de uso
- ✅ Gerar relatórios de progresso

## 🔐 Credenciais de Teste

| Tipo | NIP | Senha |
|------|-----|-------|
| **Administrador** | 12.3456.78 | password |
| **Militar** | 98.7654.32 | password |

## 🛠️ Comandos Principais

```bash
# Iniciar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Aplicar mudanças no banco
npm run db:push

# Fazer backup do banco
./backup_papem35.sh
```

## 📊 Estrutura do Banco de Dados

- **users**: Usuários do sistema (militares e admins)
- **videos**: Vídeos de treinamento
- **documents**: Biblioteca de documentos
- **announcements**: Avisos e comunicados
- **categories**: Categorias de conteúdo
- **video_completions**: Progresso dos usuários
- **video_views**: Estatísticas de visualização
- **document_views**: Acessos a documentos

## 🏗️ Arquitetura Técnica

### Frontend
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** com tema naval
- **Shadcn/UI** para componentes
- **TanStack Query** para estado do servidor

### Backend
- **Node.js** com Express
- **PostgreSQL** com Drizzle ORM
- **Autenticação** por sessão
- **Upload** de arquivos com Multer

## 📁 Estrutura de Arquivos

```
papem35-sistema/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes UI
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # Hooks customizados
│   │   └── lib/           # Utilitários
├── server/                # Backend Express
│   ├── index.ts          # Servidor principal
│   ├── routes.ts         # Rotas da API
│   ├── storage.ts        # Camada de dados
│   └── db.ts             # Configuração do banco
├── shared/               # Código compartilhado
│   └── schema.ts         # Esquemas do banco
├── uploads/              # Arquivos enviados
│   ├── videos/
│   └── documents/
└── backups/              # Backups do banco
```

## 🔧 Arquivos de Backup

- **papem35_backup_completo.sql**: Backup completo (estrutura + dados)
- **papem35_dados_apenas.sql**: Apenas dados do banco
- **papem35_estrutura.sql**: Apenas estrutura do banco

## 🚀 Implantação

### Desenvolvimento
```bash
npm run dev
# Acesse: http://localhost:5000
```

### Produção
```bash
npm run build
npm start
# Configure variáveis de ambiente adequadas
```

## 📈 Monitoramento

### Estatísticas Disponíveis
- Total de usuários ativos
- Vídeos assistidos e completados
- Documentos baixados
- Certificados emitidos
- Tempo de uso do sistema

### Relatórios
- Progresso individual por militar
- Estatísticas gerais do sistema
- Exportação em CSV
- Logs de atividade

## 🔒 Segurança

- Autenticação por NIP (Número de Identificação Pessoal)
- Senhas criptografadas com bcrypt
- Sessões seguras com express-session
- Controle de acesso baseado em roles
- Validação de arquivos no upload

## 🆘 Suporte

### Problemas Comuns

#### Erro de conexão com banco
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Iniciar se necessário
sudo systemctl start postgresql
```

#### Porta ocupada
```bash
# Ver processos na porta 5000
lsof -i :5000

# Encerrar processo
kill -9 [PID]
```

#### Problemas com uploads
```bash
# Verificar permissões
ls -la uploads/

# Corrigir permissões
chmod -R 755 uploads/
```

## 📝 Manutenção

### Backup Regular
```bash
# Backup automático
./backup_papem35.sh

# Backup manual
pg_dump "$DATABASE_URL" > backup_$(date +%Y%m%d).sql
```

### Atualizações
```bash
# Atualizar dependências
npm update

# Aplicar mudanças no banco
npm run db:push
```

## 📞 Contato

**Sistema desenvolvido para:**
- Marinha do Brasil
- Setor PAPEM-35
- Treinamento e Capacitação Militar

---

**⚓ Sempre Alerta! ⚓**