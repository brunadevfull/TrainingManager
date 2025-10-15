# Sistema PAPEM-35 - Instalação via Docker

## Pré-requisitos
- Docker instalado no sistema
- Porta 5000 disponível

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
  -p 5000:5000 \
  -e DATABASE_URL=postgresql://papem35_user:papem35_password@papem35-db:5432/papem35 \
  -v ./uploads:/app/uploads \
  papem35-sistema:latest
```

### 3. Acessar o sistema
Abra o navegador em: http://localhost:5000

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
