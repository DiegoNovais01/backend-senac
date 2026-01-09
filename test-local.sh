#!/bin/bash

echo "════════════════════════════════════════════════════════════════"
echo "  🧪 TESTE LOCAL - Backend SENAC"
echo "════════════════════════════════════════════════════════════════"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se Node está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Instalando dependências...${NC}"
npm install

echo -e "\n${YELLOW}🔍 Verificando código...${NC}"
npm run lint --if-present || true

echo -e "\n${YELLOW}🧪 Rodando testes...${NC}"
npm test -- --coverage

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Todos os testes passaram!${NC}"
    echo -e "${GREEN}📊 Cobertura: coverage/index.html${NC}"
else
    echo -e "\n${RED}❌ Alguns testes falharam${NC}"
    exit 1
fi

echo -e "\n${YELLOW}🐳 Construindo imagem Docker...${NC}"
docker build -t backend-senac:test .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker build bem-sucedido!${NC}"
else
    echo -e "${RED}❌ Docker build falhou${NC}"
    exit 1
fi

echo -e "\n${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ Tudo pronto para produção! ${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
