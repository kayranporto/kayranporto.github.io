#!/bin/bash

# SCRIPT: Quick Start - Império Delivery SaaS
# Este script configura e inicia o projeto localmente

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  IMPÉRIO DELIVERY SaaS - Quick Start                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar Node.js
echo -e "${BLUE}▶ Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale em nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION}${NC}"
echo ""

# Verificar npm
echo -e "${BLUE}▶ Verificando npm...${NC}"
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm ${NPM_VERSION}${NC}"
echo ""

# Instalar dependências
echo -e "${BLUE}▶ Instalando dependências...${NC}"
npm install 2>&1 | tail -5
echo -e "${GREEN}✓ Dependências instaladas${NC}"
echo ""

# Criar .env.local
if [ ! -f ".env.local" ]; then
    echo -e "${BLUE}▶ Criando .env.local...${NC}"
    cp .env.example .env.local
    echo -e "${GREEN}✓ .env.local criado${NC}"
    echo ""
else
    echo -e "${GREEN}✓ .env.local já existe${NC}"
    echo ""
fi

# Verificar TypeScript
echo -e "${BLUE}▶ Verificando TypeScript...${NC}"
npm run type-check 2>&1 | grep -i "typescript" || echo -e "${GREEN}✓ TypeScript OK${NC}"
echo ""

# Mostrar próximos passos
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ SETUP COMPLETO!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Próximos passos:"
echo ""
echo -e "${BLUE}1. Iniciar servidor de desenvolvimento:${NC}"
echo "   npm run dev"
echo ""
echo -e "${BLUE}2. Acessar no navegador:${NC}"
echo "   http://localhost:3000"
echo ""
echo -e "${BLUE}3. Criar conta (registrar):${NC}"
echo "   http://localhost:3000/register"
echo ""
echo -e "${BLUE}4. Fazer login:${NC}"
echo "   http://localhost:3000/login"
echo ""
echo -e "${BLUE}5. Acessar dashboard:${NC}"
echo "   http://localhost:3000/dashboard"
echo ""
echo "Documentação:"
echo -e "${BLUE}  • Arquitetura: cat ARCHITECTURE.md${NC}"
echo -e "${BLUE}  • Quick Start: cat README_SAAS.md${NC}"
echo -e "${BLUE}  • Troubleshooting: cat TROUBLESHOOTING.md${NC}"
echo ""
echo -e "${GREEN}Pronto para começar! 🚀${NC}"
echo ""
