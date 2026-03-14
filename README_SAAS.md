# Império Delivery - SaaS Platform

Plataforma SaaS escalável e pronta para produção para gerenciar pedidos de delivery.

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- npm/yarn/pnpm

### Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local

# 3. Iniciar servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📖 Desenvolvimento

### Criar Conta
1. Acesse http://localhost:3000/register
2. Preencha formulário com:
   - Nome completo
   - Email
   - Empresa (será criada automaticamente)
   - Senha (8+ chars, 1 maiúscula, 1 número, 1 especial)

### Fazer Login
1. Acesse http://localhost:3000/login
2. Use suas credenciais

### Páginas Disponíveis

- **/** - Página inicial
- **/login** - Login
- **/register** - Registrar
- **/dashboard** - Dashboard principal
- **/products** - Gerenciar cardápio
- **/orders** - Listar pedidos
- **/pricing** - Ver planos

## 🏗️ Arquitetura

Veja [ARCHITECTURE.md](./ARCHITECTURE.md) para documentação completa sobre:
- Estrutura de pastas
- Padrões de design
- Sistema de planos
- Como escalar
- Exemplos de extensão

## 🔧 Scripts

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm start

# Verificar tipos
npm run type-check

# Formatar código
npm run format

# Linter
npm run lint
```

## 📦 Stack Tecnológico

- **Frontend**: React 19, Next.js 16, Tailwind CSS
- **Backend**: Next.js API Routes
- **Autenticação**: JWT, bcryptjs
- **Database**: Mock (pronto para integração com Prisma/Neon)
- **Tipagem**: TypeScript
- **Styling**: Tailwind CSS
- **Ferramentas**: ESLint, Prettier

## 🔐 Segurança

- Senhas hasheadas com bcryptjs
- JWT com expiração
- Cookies HTTP-only
- Validação de entrada
- Isolamento multi-tenant
- CORS configurado

## 📱 Responsivo

Interface totalmente responsiva para:
- Desktop
- Tablet
- Mobile

## 🎨 Design

- 5 cores principais (sistema de tema)
- Componentes reutilizáveis
- Design system consistente
- Acessibilidade (WCAG)

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# 1. Push para GitHub
git push origin main

# 2. Conectar Vercel
# Acesse vercel.com e importe o repositório

# 3. Configurar variáveis
# Adicione em Project Settings > Environment Variables

# 4. Deploy automático
# Cada push automáticamente faz deploy
```

### Outras Opções

- Railway
- Render
- AWS
- DigitalOcean

## 📈 Próximos Passos

- [ ] Integrar banco de dados real (Neon/Supabase)
- [ ] Adicionar pagamentos (Stripe)
- [ ] Sistema de email
- [ ] Upload de arquivos
- [ ] Relatórios e analytics
- [ ] Testes automatizados
- [ ] CI/CD pipeline
- [ ] Monitoring (Sentry)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Estrutura de Commit

```
feat: adicionar nova funcionalidade
fix: corrigir um bug
docs: atualizar documentação
style: formatar código
refactor: refatorar código
test: adicionar testes
chore: tarefas diversas
```

## 📞 Suporte

- 📧 Email: suporte@imperiodelivery.com
- 💬 Discord: [Link do servidor]
- 📖 Docs: [ARCHITECTURE.md](./ARCHITECTURE.md)

## 📄 Licença

MIT - veja o arquivo LICENSE

## 👨‍💻 Autor

Kayran Porto - [@kayranporto](https://github.com/kayranporto)

---

**Desenvolvido com ❤️ para ser escalável**
