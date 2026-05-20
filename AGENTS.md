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
