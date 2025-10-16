# Dockerfile para modo desenvolvimento - Sistema PAPEM-35
FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache postgresql-client

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração do Node.js
COPY package*.json ./

# Instalar dependências (incluindo devDependencies)
RUN npm install

# Copiar código fonte
COPY . .

# Criar diretórios necessários
RUN mkdir -p uploads/videos uploads/documents backups

# Definir permissões
RUN chmod -R 755 uploads/ backups/

# Expor porta padrão
EXPOSE 5001

# Definir variáveis de ambiente para desenvolvimento
ENV NODE_ENV=development
ENV PORT=5001

# ✅ Rodar em modo desenvolvimento (sem build)
CMD ["npm", "run", "dev"]
