# Sistema Multi-Delivery

Bem-vindo ao sistema de gerenciamento de múltiplas lojas de delivery! Este projeto permite que você mantenha várias lojas com suas próprias identidades visuais, logos, horários e contatos em um único site.

## Características Principais

- **Seletor de Lojas**: Interface intuitiva para escolher entre várias lojas
- **Branding Dinâmico**: Cada loja tem sua própria logo e cores
- **Persistência**: A loja selecionada é salva no navegador
- **URL Params**: Links diretos para lojas específicas (`?store=imperio`)
- **Responsivo**: Funciona perfeitamente em desktop e mobile
- **Sem Servidor**: Funciona em qualquer servidor estático (HTML/CSS/JS)

## Como Adicionar uma Nova Loja

### 1. Gerar Logo da Loja

Coloque a imagem do logo da sua loja em `logos/minhaloja-logo.png`.

### 2. Atualizar `stores.json`

Adicione um novo objeto na array `stores` em `stores.json`:

```json
{
  "id": "minhaloja",
  "name": "Minha Loja Delivery",
  "logo": "logos/minhaloja-logo.png",
  "whatsapp": "11999999999",
  "phone": "(11) 9999-9999",
  "horarios": {
    "segunda": "11:00 - 23:00",
    "terca": "11:00 - 23:00",
    "quarta": "11:00 - 23:00",
    "quinta": "11:00 - 23:00",
    "sexta": "11:00 - 23:00",
    "sabado": "10:00 - 00:00",
    "domingo": "10:00 - 23:00"
  },
  "cor_primaria": "#FF0000",
  "cor_secundaria": "#0000FF"
}
```

### Campos Obrigatórios

- **id**: Identificador único (sem espaços, em minúsculas)
- **name**: Nome da loja
- **logo**: Caminho da imagem do logo (use `logos/` como pasta)
- **whatsapp**: Número do WhatsApp (apenas números, sem +55)
- **phone**: Telefone formatado para exibição
- **horarios**: Horários de funcionamento para cada dia da semana
- **cor_primaria**: Cor primária da marca (formato hexadecimal)
- **cor_secundaria**: Cor secundária da marca (formato hexadecimal)

### Dias da Semana

Use as seguintes chaves no objeto `horarios`:

- `segunda` (Monday)
- `terca` (Tuesday)
- `quarta` (Wednesday)
- `quinta` (Thursday)
- `sexta` (Friday)
- `sabado` (Saturday)
- `domingo` (Sunday)

## Estrutura de Arquivos

```
/
├── index.html              # Página principal (contém modal de lojas)
├── style.css               # Estilos CSS
├── script.js               # Lógica principal do app
├── auth.js                 # Autenticação
├── stores.js               # Gerenciador de lojas
├── multi-delivery.js       # Integração multi-delivery
├── stores.json             # Dados das lojas
└── logos/
    ├── imperio-logo.png
    ├── gourmet-logo.png
    └── rapido-logo.png
```

## Como Funciona

### Fluxo de Inicialização

1. Página carrega
2. `stores.js` carrega dados de `stores.json`
3. `multi-delivery.js` verifica:
   - URL params (`?store=imperio`)
   - localStorage (`selectedStore`)
   - Se nenhuma loja encontrada, mostra modal de seleção
4. Interface é atualizada com dados da loja

### Atualização de Dados

Quando uma loja é selecionada, os seguintes elementos são atualizados:

- Logo e nome no header
- Título e descrição do hero
- Telefone e links de WhatsApp
- Cores do site (variáveis CSS)
- Horários de funcionamento
- Todas as referências de contato

## Links Diretos

Você pode compartilhar links diretos para lojas específicas:

```
http://seusite.com/?store=imperio
http://seusite.com/?store=gourmet
http://seusite.com/?store=rapido
```

Quando alguém acessa um link com um parâmetro `store`, a loja é carregada automaticamente e salva no navegador.

## Customização de Cores

As cores da loja são aplicadas como variáveis CSS (`--color-primary` e `--color-secondary`) e usadas em todo o site. Para mudar as cores de uma loja, simplesmente atualize os valores de `cor_primaria` e `cor_secundaria` em `stores.json`.

## Suporte Mobile

O sistema foi totalmente otimizado para mobile com:

- Modal responsivo
- Cards de seleção que se adaptam ao tamanho da tela
- Navegação hamburger no mobile
- Todos os elementos escaláveis

## Teste as Lojas

Desktop: Clique no ícone de localização no header para trocar de loja.

Mobile: Clique no ícone de localização (quando disponível) para abrir o seletor.

## Notas Técnicas

- Usa `localStorage` para persistência (com fallback gracioso)
- URLs são atualizadas com `window.history.replaceState()`
- Sem dependências externas (JavaScript vanilla)
- Compatível com navegadores modernos
- Cache-friendly (todos os dados em JSON estático)

## Troubleshooting

**Modal não aparece ao trocar de loja?**
- Verifique se `multi-delivery.js` está carregado após `stores.js`
- Abra o console para mensagens de erro

**Cores não estão mudando?**
- Confirme que `cor_primaria` e `cor_secundaria` estão em formato hexadecimal válido
- Teste com cores padrão primeiro (#FF0000)

**Logo não aparece?**
- Confirme o caminho da imagem em `stores.json`
- Verifique se a imagem existe em `logos/`
- Tente um URL absoluto se o caminho relativo não funcionar

