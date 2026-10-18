# MostraAi Web

## Quem é você (outra instância Claude) e o que é este repo

Este é o frontend web do MostraAi: catálogo público das lojas, a página de mesa (onde o cliente
chama o garçom escaneando um QR), e o dashboard do Producer (dono do comércio). Não tem app
mobile equivalente pro catálogo público - é a única forma de um cliente final ver o cardápio sem
instalar nada.

### Ecossistema MostraAi (5 repos)

- `mostra-ai-server` - backend NestJS+Prisma, único dono dos dados. Este repo só consome a API
  pública/producer dele via axios.
- `mostra-ai-mobile` - app do Producer/dono do comércio.
- `mostra-ai-mobile-client` - app do cliente final (cadastro de conta).
- `mostra-ai-mobile-partner` - app do parceiro/funcionário. É quem gera o link/QR de mesa que cai
  aqui na rota `/:slug/mesa/:token`.
- **`mostra-ai-web` (este repo)**.

## Stack

- React + Vite + TypeScript
- `react-router-dom` (rotas em `src/App.tsx`)
- Estilização com **Stitches** (`@stitches/react`, `src/theme/stitches.config.ts`) - tema
  dark-first. Cores por loja (`theme_primary_color`/`theme_secondary_color`) são injetadas via
  CSS custom properties (`--store-primary`, `--store-secondary`, etc.) num `<div style={...}>`
  que envolve a página - ver `getStoreThemeVars` em `src/utils/format.ts`.
- Axios (`src/lib/api.ts`), `baseURL` vem de `VITE_API_BASE_URL`.

## Estrutura

```
src/
  App.tsx                     todas as rotas (react-router-dom)
  pages/
    app/customer/StorePage.tsx   catálogo público (/:slug) - hoje é só um wrapper fino de
                                  StoreCatalogView
    app/customer/TablePage.tsx   página de mesa (/:slug/mesa/:token)
    app/customer/ScheduleServicePage.tsx  fluxo de agendamento (/:slug/agendar) - ver seção
                                  "Agendamento de serviço" abaixo
    app/producer/*                dashboard do dono (login, produtos, categorias, locais, loja)
    NotFoundPage.tsx, PrivacyPage.tsx, CancellationPage.tsx
  components/
    store/StoreCatalogView.tsx    corpo do catálogo (header + cardápio + locais + contato) -
                                   COMPARTILHADO entre StorePage e TablePage. Se for mudar como o
                                   catálogo é exibido, mude aqui, não duplique em StorePage. Tem o
                                   botão "Agendar serviço" (só aparece se algum produto do menu
                                   for item_type=SERVICE) que leva pra ScheduleServicePage.
    store/CallWaiterButton.tsx    barra fixa da mesa: "Chamar garçom", "Pedir a conta" e a comanda (TableComanda); só usada por TablePage
    store/StoreHeader.tsx, MenuList.tsx, LocationsList.tsx, ContactForm.tsx
    producer/*                    shell/rotas protegidas do dashboard
    ui/Button.tsx, Card.tsx, Input.tsx, LogoSpinner.tsx
  services/       store.service.ts, table.service.ts, producer.service.ts, producer-auth.service.ts,
                  client-auth.service.ts, appointment.service.ts
  hooks/          useStoreCatalog.ts, useTableInfo.ts, useProducer*.ts, useAvailability.ts,
                  useClientAppointmentMutations.ts
  lib/            api.ts, queryClient.ts, clientAuth.ts (sessão do cliente final no navegador)
  types/domain.ts, types/producer.ts, types/client.ts
```

## Rotas (`src/App.tsx`)

- `/` → 404
- `/producer/login`, `/producer` (+ filhas `store`, `products`, `categories`, `locations`) →
  dashboard protegido (`ProducerProtectedRoute`)
- `/privacy`, `/cancel`
- `/:slug` → `StorePage` (catálogo público de uma loja)
- `/:slug/mesa/:token` → `TablePage` (catálogo + botão "Chamar garçom")
- `/:slug/agendar` → `ScheduleServicePage` (fluxo de agendamento de serviço)
- `*` → 404

## Agendamento de serviço (`/:slug/agendar`, mais recente)

Fluxo completo em `ScheduleServicePage.tsx` (um arquivo só, no mesmo estilo de
`ProducerLoginPage.tsx`/`ProducerStorePage.tsx` - página grande e autocontida, não fragmentada em
vários componentes pequenos): escolher serviço(s) → (se agendável) localização/data/horário
(`GET /public/store/:slug/availability`) → **cadastro inline** se a pessoa ainda não tem sessão de
cliente salva neste navegador → `POST /client/appointments`. Sempre nasce com status PENDING.

- **Cadastro inline reaproveita o `/auth/register` de verdade** (CPF/CNPJ + nome + e-mail/senha +
  aceite de termos e LGPD), o mesmo endpoint usado pelo app `mostra-ai-mobile-client`. Cria só a
  conta (não cria loja nenhuma) e já usa o `access_token` devolvido pra criar o agendamento na
  sequência. **Envie só os campos que `RegisterDto` aceita no servidor** (`email`, `password`,
  `name`, `document`, `document_type`, `accepted_app_terms`, `accepted_lgpd`) - a ValidationPipe
  global tem `forbidNonWhitelisted: true`, então qualquer campo extra derruba a requisição com 400.
  **Cuidado**: `services/producer-auth.service.ts` (fluxo de cadastro do PRODUTOR, não mexi nele)
  manda campos extras (`offering_type`, `is_consumption`, `whatsapp`, `accepted_account_terms`)
  que não existem mais no `RegisterDto` atual do servidor - parece ter ficado desatualizado depois
  da separação entre "criar conta" e "criar loja" (`mostra-ai-server`, tarefa antiga de outra
  sessão). Não copiei esse padrão pro cadastro do cliente por isso, mas vale investigar/corrigir
  esse arquivo numa sessão futura se o cadastro de produtor pelo site estiver quebrado.
- **Sessão do cliente fica em `localStorage`, chave própria** (`mostraai.webclient.*`, ver
  `lib/clientAuth.ts`) - separada da sessão do produtor (`mostraai.producer.*`,
  `contexts/producerAuth.tsx`). As duas podem coexistir no mesmo navegador sem colidir. Não existe
  tela de login pro cliente aqui (só cadastro) - se a pessoa já tem conta mas nunca logou nesse
  navegador, o registro falha (e-mail duplicado) e a tela mostra uma mensagem sugerindo abrir o
  app `mostra-ai-mobile-client` em vez disso. Login web pro cliente final não foi implementado
  (fora do escopo desta tarefa).
- **`StoreIdentity` no catálogo público agora tem `id`** (antes só tinha slug/nome/tema) -
  necessário porque `POST /client/appointments` exige `store_id`. Foi uma correção feita no
  servidor (`mostra-ai-server/src/public/store.service.ts`) junto com esta feature - se sumir de
  novo, o agendamento quebra ao montar o payload.
- **Duas mensagens fixas na tela**, exigidas explicitamente pelo dono do produto - não remova sem
  confirmar de novo: (1) aviso de que o agendamento depende de aprovação do produtor e por isso
  vale a pena agendar com antecedência; (2) aviso de que não há cancelamento por aqui - pra
  cancelar, a pessoa precisa falar direto com o produtor (por isso a tela de sucesso mostra
  WhatsApp/Instagram da loja).
- Serviços agendáveis (`is_schedulable=true`) e sob consulta (`is_schedulable=false/null`) não
  podem ser combinados no mesmo pedido (mesma regra do backend) - a tela só deixa marcar serviços
  de um grupo por vez.
- Datas usam uma lista simples dos próximos 21 dias (calendário local do navegador) em vez de um
  date picker de verdade - decisão pragmática pra não adicionar dependência nova, igual ao app
  Producer (`mostra-ai-mobile/src/app/(app)/agenda/`), que também optou por lista em vez de grid
  de calendário.
- **Convenção de horário UTC-como-parede**, igual ao resto do sistema: `starts_at`/`ends_at` e os
  horários de slot (`HH:mm`) são combinados como `${data}T${hora}:00.000Z` (sem conversão real de
  fuso - não existe timezone por Location ainda). Ver o mesmo comentário em
  `mostra-ai-server/src/public/store.service.ts`.

## Funcionalidade de mesa (mais recente)

`TablePage` valida o token via `GET /api/v1/public/tables/:token` (`useTableInfo` hook, mesmo
padrão de `useStoreCatalog`). Se 404 (token inválido OU mesa já fechada - o servidor apaga o
token ao fechar, então dá pra tratar os dois casos igual), mostra "Mesa indisponível" em vez do
catálogo. Se válido, renderiza `StoreCatalogView` (com o `store_slug` retornado pelo backend, não
o `:slug` da URL - eles deveriam bater, mas quem manda é o token) passando um `footer` com
`CallWaiterButton`, que faz `POST /api/v1/public/tables/:token/attendance` (`type`:
`CALL_WAITER` ou `REQUEST_BILL`). O estado dos botões vem do servidor: `useTableInfo` atualiza a
mesa a cada 10s e o `attendances` diz se há chamado pendente de cada tipo (pendente = botão
desabilitado; atendido = volta a funcionar). Com comanda aberta, `TableComanda` mostra os itens e
os totais (`comanda` no mesmo GET) e aparece o botão "Pedir a conta".

## Como rodar

`npm install`, depois `npm run dev`. Variável de ambiente: `VITE_API_BASE_URL` (ver como as
outras chamadas em `src/lib/api.ts` a usam). Não precisou de nenhuma variável nova pra rota de
mesa - reaproveita a mesma `VITE_API_BASE_URL`.
