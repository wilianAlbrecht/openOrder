# Frontend Standalone — Sistema Open Source de Comandas

## Objetivo

Este projeto representa o frontend principal do sistema de comandas.

O frontend deve funcionar:
- standalone
- offline-first
- sem backend obrigatório
- sem banco de dados obrigatório
- responsivo
- mobile-first

O sistema será desenvolvido em:
- React
- Capacitor

Objetivo:
- funcionar como PWA
- funcionar como aplicativo Android via Capacitor
- funcionar em desktop via navegador

---

# Filosofia do Frontend

O frontend deve ser utilizável imediatamente após abrir o sistema.

Sem:
- servidor obrigatório
- configuração complexa
- login obrigatório
- dependência cloud

O usuário deve conseguir:
- cadastrar produtos
- criar comandas
- controlar pedidos
- usar fila de preparo

Mesmo sem qualquer backend conectado.

---

# Armazenamento Local

O frontend deve utilizar armazenamento local para persistência.

Persistência local deve armazenar:
- cardápio
- comandas
- pedidos
- configurações
- status dos pedidos

Dados de dashboard devem ser calculados localmente apenas quando a feature for implementada.

Toda persistência deve continuar funcionando:
- offline
- após reiniciar app
- após fechar navegador/app

---

# Privacidade e Segurança

O projeto deve ser orientado por privacidade e segurança desde o início.

Todas as modificações devem considerar:
- proteção dos dados locais do usuário
- minimização de dados armazenados
- ausência de envio automático de dados para terceiros
- funcionamento offline sem telemetria obrigatória
- cuidado com dados sensíveis em comandas, configurações e compartilhamentos
- validação de entradas do usuário
- isolamento entre funcionalidades locais e integrações futuras

O frontend NÃO deve:
- coletar dados desnecessários
- enviar dados para serviços externos sem ação clara do usuário
- depender de contas, login ou serviços cloud para funcionar
- expor informações sensíveis em logs, URLs ou mensagens compartilhadas

Integrações futuras devem ser opcionais, explícitas e desativadas por padrão.

---

# Estrutura Geral

## O frontend possui dois modos:

### 1. Standalone
Modo padrão.

Sem servidor.

Tudo funciona localmente.

---

### 2. Connected Mode
Modo opcional.

Quando um servidor local for configurado:
- sincronização
- impressão
- websocket
- múltiplas telas
- cozinha separada
- caixa
- whatsapp server-side

---

# Funcionalidades do Frontend Standalone

## 1. Comandas

O sistema deve permitir:

- criar comandas
- adicionar pedidos
- alterar quantidade
- remover itens
- fechar comandas

Cada comanda deve possuir:

- número
- data/hora
- status
- itens
- quantidade
- observações opcionais

---

# Status da Comanda

Possíveis status:

- aberta
- preparando
- pronta
- entregue
- finalizada

---

# 2. Fila de Pedidos

O sistema deve possuir uma aba de fila.

A fila deve exibir:
- todos os pedidos ativos
- status
- horário
- número da comanda

Ações:
- marcar como preparando
- marcar como pronto
- marcar como entregue

A atualização deve ser instantânea dentro da aplicação.

---

# 3. Cadastro de Cardápio

O sistema deve possuir cadastro básico de produtos.

Cada produto deve possuir:

- nome
- categoria
- preço
- descrição opcional
- imagem opcional
- disponível ou indisponível

Sem necessidade de backend.

---

# 4. TODO: Dashboard Simples

Feature futura. Não é prioridade neste momento.

O frontend deve prever dashboard básico, mas a primeira versão não deve depender dele para operação.

Indicadores:

- quantidade de vendas
- faturamento total
- pedidos do dia
- ticket médio simples

Os dados podem ser calculados localmente.

---

# 5. TODO: Impressão Térmica

Feature futura. Não é prioridade neste momento.

O frontend deve apenas prever integração futura com impressora térmica, sem implementar dependência obrigatória.

Objetivo:
- impressão de pedidos
- impressão de comprovantes

A implementação inicial deve prever:
- arquitetura desacoplada
- serviço separado de impressão
- compatibilidade futura com ESC/POS

Importante:
- o frontend NÃO deve depender da impressão para funcionar
- impressão deve ser opcional e desativada por padrão
- dados enviados para impressão devem respeitar privacidade e conter apenas o necessário

---

# 6. TODO: WhatsApp Business

Feature futura. Não é prioridade neste momento.

O frontend deve apenas prever integração futura com WhatsApp Business, sem automações obrigatórias.

Objetivos:
- compartilhar pedidos
- compartilhar comprovantes
- iniciar conversa com cliente

Na primeira versão:
- utilizar links do WhatsApp
- compartilhamento simples

Não implementar automações complexas inicialmente.

Importante:
- compartilhamentos devem acontecer apenas por ação explícita do usuário
- dados pessoais ou sensíveis não devem ser compartilhados automaticamente

---

# 7. Modo Offline

O frontend deve funcionar completamente offline.

Mesmo sem:
- internet
- backend
- servidor local

---

# 8. Responsividade

O sistema deve funcionar corretamente em:

- celular
- tablet
- desktop

Prioridade:
- uso touch
- operação rápida
- poucos cliques

---

# Diretrizes de UX

## A interface deve ser:

- rápida
- limpa
- operacional
- simples
- touch-friendly

Evitar:
- excesso de telas
- excesso de configuração
- fluxo complexo

---

# Arquitetura do Projeto

## Estrutura inicial

/apps
  /frontend

/packages
  /ui
  /shared
  /storage
  /domain

---

# Organização das Telas

## Telas iniciais

### Dashboard
TODO: feature futura, não prioritária neste momento.

- resumo vendas
- faturamento
- métricas simples

### Comandas
- lista de comandas
- criação
- edição

### Fila
- pedidos ativos
- status

### Cardápio
- produtos
- categorias

### Configurações
- TODO: impressão futura
- TODO: whatsapp futuro
- servidor local futuramente

---

# Fases do Projeto

## Fase 1 — Fundação do Projeto

Objetivo:
inicializar a base técnica do frontend standalone.

Tarefas:
- configurar React
- configurar TypeScript
- configurar Vite
- configurar ESLint
- configurar Prettier
- configurar aliases
- configurar estrutura de pastas
- preparar PWA

Resultado esperado:
base pronta para desenvolvimento do MVP.

---

## Fase 2 — Base Mobile

Objetivo:
habilitar execução web e Android com Capacitor.

Tarefas:
- configurar Capacitor
- validar build web
- preparar build Android
- validar execução mobile
- preparar ícone e splash futuramente

Resultado esperado:
aplicação pronta para rodar no navegador e evoluir para Android.

---

## Fase 3 — Arquitetura e Domínio

Objetivo:
padronizar a arquitetura do frontend.

Tarefas:
- definir organização de pastas
- definir padrão de componentes
- definir serviços
- definir models
- definir storage local
- definir entidades principais

Entidades principais:
- Product
- Order
- OrderItem
- QueueItem
- Settings

Resultado esperado:
estrutura consistente, desacoplada e fácil de manter.

---

## Fase 4 — Persistência Local

Objetivo:
garantir persistência offline confiável.

Tarefas:
- criar abstração de storage
- implementar IndexedDB
- criar helpers de persistência
- criar versionamento básico de schema
- criar persistência automática
- restaurar dados ao reiniciar o app

Dados persistidos:
- produtos
- comandas
- pedidos
- configurações
- status dos pedidos

Resultado esperado:
dados sobrevivem reload, reinício e uso offline.

---

## Fase 5 — Segurança e Privacidade

Objetivo:
garantir que o MVP nasça orientado por segurança e privacidade.

Tarefas:
- validar entradas do usuário
- minimizar dados persistidos
- evitar exposição de dados sensíveis em logs
- evitar compartilhamentos automáticos
- isolar integrações futuras da operação local
- revisar armazenamento local com foco em privacidade

Resultado esperado:
base funcional com proteção adequada para uso local e offline.

---

## Fase 6 — Layout Base

Objetivo:
criar a estrutura navegável principal.

Tarefas:
- criar sidebar ou menu principal
- criar header
- criar navegação mobile
- criar tabs quando necessário
- criar layout responsivo

Telas do MVP:
- Comandas
- Fila
- Cardápio
- Configurações

Tela futura:
- Dashboard

Resultado esperado:
navegação completa e operacional para o MVP.

---

## Fase 7 — Design System Simples

Objetivo:
padronizar a interface operacional.

Tarefas:
- botões
- inputs
- cards
- modais
- tabelas
- badges de status
- estados de loading
- toasts

Resultado esperado:
UI consistente, rápida e touch-friendly.

---

## Fase 8 — Cadastro de Cardápio

Objetivo:
gerenciar produtos localmente.

Tarefas:
- listar produtos
- criar produto
- editar produto
- remover produto
- organizar categorias
- controlar disponibilidade
- permitir imagem local opcional

Campos:
- nome
- preço
- categoria
- descrição opcional
- disponível

Resultado esperado:
cardápio funcional sem backend.

---

## Fase 9 — Sistema de Comandas

Objetivo:
controlar o fluxo principal da operação.

Tarefas:
- criar comanda
- listar comandas
- editar comanda
- definir status
- registrar data e hora
- gerar número automático
- adicionar produtos
- alterar quantidade
- remover item
- adicionar observações
- calcular total automaticamente
- salvar automaticamente

Resultado esperado:
comandas funcionando com persistência local.

---

## Fase 10 — Fila de Pedidos

Objetivo:
controlar pedidos ativos e fluxo de preparo.

Tarefas:
- listar pedidos ativos
- ordenar por horário
- exibir status visual
- marcar como preparando
- marcar como pronto
- marcar como entregue
- atualizar UI instantaneamente

Resultado esperado:
fila operacional e integrada ao fluxo de comandas.

---

## Fase 11 — Configurações

Objetivo:
preparar customização básica e expansão futura.

Tarefas:
- nome do estabelecimento
- logo
- moeda
- preferências locais
- preparar impressão futura
- preparar servidor local futuro
- preparar WhatsApp futuro

Resultado esperado:
base configurável sem dependências externas.

---

## Fase 12 — Ajustes Mobile

Objetivo:
garantir conforto de uso em operação real.

Tarefas:
- testar touch
- ajustar responsividade
- ajustar teclado virtual
- avaliar fullscreen
- revisar performance no Android

Resultado esperado:
uso confortável em celular e tablet.

---

## Fase 13 — Polimento do MVP

Objetivo:
deixar a experiência operacional estável.

Tarefas:
- loading states
- feedback visual
- animações leves
- atalhos rápidos
- confirmação de ações
- testes operacionais

Validar:
- abertura de comanda
- lançamento de pedido
- atualização de fila
- persistência
- funcionamento offline

Resultado esperado:
MVP estável para uso inicial.

---

## Fase 14 — Build Inicial

Objetivo:
gerar a primeira versão utilizável.

Tarefas:
- build web
- build PWA
- build Android
- APK de debug

Resultado esperado:
primeira versão utilizável em navegador e Android.

---

## Fase 15 — TODO Futuro

Itens que podem ser preparados na arquitetura, mas não são prioridade agora:
- dashboard simples
- integração básica com WhatsApp
- arquitetura de impressão
- sincronização local
- múltiplos usuários
- websocket
- cloud opcional

Resultado esperado:
expansão futura sem reescrever o frontend.

---

# Prioridade do MVP

A prioridade do MVP é validar:

1. fluxo operacional
2. UX
3. velocidade
4. offline-first
5. simplicidade
6. segurança e privacidade

---

# Resultado Esperado do MVP

Ao final do MVP o sistema deve:

- funcionar offline
- criar comandas
- controlar pedidos
- possuir fila operacional
- possuir cardápio funcional
- possuir persistência local
- funcionar no Android
- funcionar no navegador
- respeitar privacidade e segurança por padrão

Sem qualquer backend.

---

# Regras Importantes

## O frontend NÃO pode:

- depender de backend
- depender de websocket
- depender de internet

---

# O frontend DEVE:

- funcionar standalone
- possuir persistência local
- permitir expansão futura
- suportar conexão opcional com servidor local
- considerar segurança e privacidade em toda alteração
- manter integrações externas opcionais, explícitas e desativadas por padrão

---

# Escalabilidade Futura

A arquitetura deve permitir futuramente:

- sincronização em rede local
- múltiplos usuários
- websocket
- cozinha separada
- caixa separado
- impressão automática
- dashboard avançado
- cloud opcional

Sem necessidade de reescrever o frontend.

---

# Filosofia Técnica

Priorizar:
- simplicidade
- desacoplamento
- offline-first
- manutenção fácil
- experiência rápida

Evitar:
- overengineering
- dependência desnecessária
- arquitetura excessivamente complexa
