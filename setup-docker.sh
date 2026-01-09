#!/bin/bash

echo "🐳 Iniciando ambiente Docker para testes..."

# Parar containers antigos
docker-compose down

# Build
echo "📦 Construindo imagem Docker..."
docker-compose build

# Start services
echo "🚀 Iniciando serviços..."
docker-compose up -d

# Wait for database
echo "⏳ Aguardando banco de dados ficar pronto..."
sleep 10

# Run migrations
echo "📊 Executando migrações do Prisma..."
docker-compose exec -T app npx prisma migrate deploy

# Run tests
echo "🧪 Rodando testes..."
docker-compose exec -T app npm test

echo "✅ Pronto! API está em http://localhost:3000"
