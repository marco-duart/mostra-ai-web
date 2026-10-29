// Caminhos da API de Novidades. O servidor sobe tudo sob /api/v1 (setGlobalPrefix); sem o prefixo a chamada
// recebe 404 e a tela mostra "Nenhuma novidade por enquanto", como se o painel estivesse vazio.
export const NOVIDADES_PATHS = {
  list: "/api/v1/novidades",
  events: "/api/v1/novidades/events",
} as const;
