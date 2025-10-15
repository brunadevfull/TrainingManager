# Sistema de Adestramento PAPEM-35

## Overview

Sistema completo de treinamento militar desenvolvido para o setor PAPEM-35 da Marinha do Brasil. O sistema permite que militares assistam vídeos de treinamento, acessem documentos e recebam avisos importantes, enquanto administradores podem gerenciar conteúdo e monitorar progresso.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

✓ 2025-07-15: Migrated authentication from CPF to NIP format (11.1111.11)
✓ 2025-07-15: Updated system branding from "APAPEM 35" to "PAPEM-35"
✓ 2025-07-15: Applied new visual theme based on PAPEM website design
✓ 2025-07-15: Implemented institutional header with naval branding
✓ 2025-07-15: Updated navbar and sidebar with new color scheme
✓ 2025-07-15: Added official Navy military ranks/grades (MN/CB/3SG/2SG/1SG/SO/1T/2T/CT/CC/CF/CMG)
✓ 2025-07-15: Fixed all remaining CPF references to NIP in reports and admin dashboard
✓ 2025-07-15: Removed final APAPEM references from announcements page and session config
✓ 2025-07-15: Cleaned up all external platform references and updated documentation
✓ 2025-07-15: Modernized internal system design with gradients, glassmorphism, and animations
✓ 2025-07-15: Fixed React warnings about setState during render using useEffect for redirects
✓ 2025-07-15: Enhanced stats cards with decorative elements and hover effects
✓ 2025-07-15: Updated all major pages with modern card design and improved visual hierarchy
✓ 2025-07-15: Removed all external development platform references from the system
✓ 2025-07-15: Updated HTML meta tags and authorship to reflect PAPEM-35 ownership

## Resumo Executivo do Sistema

### Funcionalidades Principais
- **Gestão de Vídeos**: Upload, categorização e streaming de vídeos de treinamento
- **Biblioteca de Documentos**: Upload e download de PDFs, DOCs e imagens
- **Sistema de Avisos**: Comunicados com diferentes níveis de prioridade
- **Controle de Acesso**: Autenticação por NIP com roles (admin/militar)
- **Rastreamento de Progresso**: Monitoramento de visualizações apenas para militares
- **Relatórios**: Dashboard administrativo com estatísticas de uso

### Usuários do Sistema
- **Militares**: Assistem vídeos, baixam documentos, recebem avisos
- **Administradores**: Gerenciam conteúdo, usuários e monitoram progresso

### Credenciais de Teste
- **Admin**: NIP 12.3456.78 / Senha: password
- **Militar**: NIP 98.7654.32 / Senha: password

### Postos/Graduações Disponíveis
- **MN**: Marinheiro
- **CB**: Cabo
- **3SG**: 3º Sargento
- **2SG**: 2º Sargento
- **1SG**: 1º Sargento
- **SO**: Suboficial
- **1T**: 1º Tenente
- **2T**: 2º Tenente
- **CT**: Capitão-Tenente
- **CC**: Capitão de Corveta
- **CF**: Capitão de Fragata
- **CMG**: Capitão de Mar e Guerra

## Módulos do Sistema

### 1. Módulo de Autenticação
- **Método**: NIP (Número de Identificação Pessoal) no formato 11.1111.11
- **Roles**: Admin (administrador) e User (militar)
- **Segurança**: Senhas criptografadas com bcrypt
- **Sessões**: Gerenciamento seguro com express-session

### 2. Módulo de Vídeos
- **Upload**: Administradores fazem upload de vídeos (até 500MB)
- **Categorização**: Vídeos organizados por categorias
- **Streaming**: Reprodução com suporte a seek/pause/resume
- **Progresso**: Rastreamento de visualizações para militares
- **Certificados**: Geração automática ao completar vídeos

### 3. Módulo de Documentos
- **Tipos Suportados**: PDF, DOC, DOCX, TXT, JPG, PNG
- **Upload**: Administradores fazem upload (até 50MB)
- **Download**: Militares baixam com tracking automático
- **Categorização**: Mesmas categorias dos vídeos
- **Estatísticas**: Contagem de downloads e visualizações

### 4. Módulo de Avisos
- **Tipos de Prioridade**: 
  - Info (azul) - Informações gerais
  - Warning (amarelo) - Avisos importantes
  - Urgent (vermelho) - Comunicados urgentes
  - Success (verde) - Confirmações e sucessos
- **Público-alvo**: Direcionamento para grupos específicos (admin/militar)
- **Gestão**: Criação, edição e exclusão por administradores

### 5. Módulo de Usuários
- **Perfis**: Nome, NIP, posto militar, status ativo
- **Hierarquia**: Postos/graduações oficiais da Marinha
- **Gestão**: Criação, edição e exclusão por administradores
- **Estatísticas**: Progresso individual e tempo de uso

### 6. Módulo de Relatórios
- **Dashboard**: Estatísticas gerais do sistema
- **Progresso Individual**: Detalhes por usuário militar
- **Estatísticas de Uso**: Vídeos mais assistidos, downloads
- **Exportação**: Relatórios em CSV

## Arquitetura do Sistema

### Stack Tecnológico
- **Frontend**: React 18 com TypeScript
- **Backend**: Node.js com Express
- **Database**: PostgreSQL com Drizzle ORM
- **Build Tool**: Vite para desenvolvimento e produção
- **UI**: Shadcn/ui com Radix UI primitives
- **Styling**: Tailwind CSS com tema naval customizado
- **State Management**: TanStack Query para estado do servidor
- **Routing**: Wouter para roteamento client-side

### Estrutura de Arquivos
```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # Hooks customizados
│   │   ├── lib/           # Utilitários e configurações
│   │   └── App.tsx        # Componente principal
│   └── index.html         # Template HTML
├── server/                # Backend Express
│   ├── index.ts          # Servidor principal
│   ├── routes.ts         # Rotas da API
│   ├── storage.ts        # Camada de dados
│   └── db.ts             # Configuração do banco
├── shared/               # Código compartilhado
│   └── schema.ts         # Esquemas do banco de dados
└── uploads/              # Arquivos enviados
    ├── videos/
    └── documents/
```

### Banco de Dados - Esquema

#### Tabelas Principais
```sql
-- Usuários do sistema
users (id, name, nip, password, rank, role, active, created_at)

-- Categorias para organização
categories (id, name, description, created_at)

-- Vídeos de treinamento
videos (id, title, description, filename, duration, category_id, requires_certificate, uploaded_by, created_at, active)

-- Documentos
documents (id, title, description, filename, file_type, file_size, category_id, uploaded_by, created_at, active)

-- Avisos e comunicados
announcements (id, title, content, type, priority, created_by, created_at, expires_at, active, target_role)

-- Progresso dos usuários
video_completions (id, user_id, video_id, completed_at, certificate_issued)
video_views (id, user_id, video_id, watch_time, viewed_at)
document_views (id, user_id, document_id, viewed_at)
```

#### Relacionamentos
- Users → Videos (uploaded_by)
- Users → Documents (uploaded_by)
- Users → Announcements (created_by)
- Videos → Categories (category_id)
- Documents → Categories (category_id)
- VideoCompletions → Users, Videos
- VideoViews → Users, Videos
- DocumentViews → Users, Documents

### Funcionalidades Técnicas

#### Autenticação e Autorização
- **Login**: NIP e senha com validação
- **Sessões**: Cookies seguros com expiração
- **Middleware**: Verificação de autenticação e roles
- **Redirecionamento**: Automático baseado em permissões

#### Upload e Armazenamento
- **Multer**: Middleware para upload de arquivos
- **Validação**: Tipos de arquivo e tamanhos
- **Armazenamento**: Sistema de arquivos local
- **Organização**: Diretórios separados por tipo

#### Streaming e Download
- **Vídeos**: Streaming com range requests
- **Documentos**: Download direto com tracking
- **Segurança**: Verificação de permissões
- **Estatísticas**: Registro de visualizações

#### Interface do Usuário
- **Design**: Tema naval com cores institucionais
- **Responsividade**: Adaptação para diferentes telas
- **Acessibilidade**: Componentes do Radix UI
- **Navegação**: Sidebar e navbar contextuais

### Fluxos de Trabalho

#### Fluxo do Militar
1. **Login**: Acesso via NIP e senha
2. **Dashboard**: Visualização de estatísticas pessoais
3. **Vídeos**: Navegar, assistir e completar treinamentos
4. **Documentos**: Baixar materiais de apoio
5. **Avisos**: Receber comunicados importantes
6. **Progresso**: Acompanhar certificados e conclusões

#### Fluxo do Administrador
1. **Login**: Acesso via NIP e senha
2. **Dashboard Admin**: Visão geral do sistema
3. **Gestão de Usuários**: Criar, editar, excluir militares
4. **Gestão de Vídeos**: Upload, categorização, edição
5. **Gestão de Documentos**: Upload, organização
6. **Gestão de Avisos**: Criar comunicados direcionados
7. **Relatórios**: Exportar dados de progresso

### Segurança

#### Medidas Implementadas
- **Criptografia**: Senhas com bcrypt
- **Sessões**: Cookies httpOnly e secure
- **Validação**: Sanitização com Zod
- **Autorização**: Middleware de verificação de roles
- **Upload**: Validação de tipos e tamanhos de arquivo

#### Configurações de Produção
- **HTTPS**: Recomendado para produção
- **Variáveis de Ambiente**: DATABASE_URL, SESSION_SECRET
- **Cookies**: Configuração secure em produção
- **Logs**: Sistema de logging para auditoria

### Monitoramento e Relatórios

#### Métricas Coletadas
- **Usuários**: Total, ativos, por posto
- **Vídeos**: Visualizações, conclusões, tempo assistido
- **Documentos**: Downloads, visualizações
- **Certificados**: Emitidos, por usuário
- **Sistema**: Estatísticas gerais de uso

#### Relatórios Disponíveis
- **Progresso por Usuário**: CSV com detalhes individuais
- **Certificados**: Lista de certificados emitidos
- **Uso do Sistema**: Estatísticas de vídeos e documentos
- **Atividade**: Logs de ações dos usuários

### Desenvolvimento e Manutenção

#### Comandos Principais
```bash
npm run dev          # Iniciar desenvolvimento
npm run build        # Build para produção
npm run db:push      # Aplicar mudanças no banco
npm run db:generate  # Gerar migrações
```

#### Estrutura de Desenvolvimento
- **Hot Reload**: Vite para desenvolvimento rápido
- **TypeScript**: Tipagem estática em todo o projeto
- **ESLint**: Linting automático
- **Prettier**: Formatação de código

#### Padrões de Código
- **Componentes**: Funcionais com hooks
- **Estado**: TanStack Query para servidor, useState para local
- **Estilos**: Tailwind CSS com classes utilitárias
- **Validação**: Zod para schemas e validação

### Considerações de Implantação

#### Requisitos do Sistema
- **Node.js**: Versão 18 ou superior
- **PostgreSQL**: Banco de dados
- **Espaço**: Para uploads de vídeos e documentos
- **Memória**: Recomendado 2GB+ para produção

#### Configuração do Ambiente
```env
DATABASE_URL=postgresql://user:password@localhost:5432/papem35
SESSION_SECRET=your-secret-key-here
NODE_ENV=production
```

#### Backup e Recuperação
- **Banco de Dados**: Backup regular do PostgreSQL
- **Arquivos**: Backup do diretório uploads/
- **Configuração**: Backup das variáveis de ambiente

Este sistema é projetado para ser robusto, seguro e escalável, atendendo às necessidades específicas do treinamento militar da Marinha do Brasil.