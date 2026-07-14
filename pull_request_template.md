# 🚀 Descrição da Mudança

<!-- Explique o que este PR faz. Qual é o problema que ele resolve ou a feature que ele adiciona? -->
**Contexto:** 
[Escreva aqui o contexto da sua mudança...]

**O que foi feito:**
- [ ] Implementação de...
- [ ] Correção de...
- [ ] Refatoração de...

---

## 🛠️ Tipo de Mudança
<!-- Marque as caixas relevantes substituindo [ ] por [x] -->

- [ ] 🐛 **Bug fix** (Correção de um problema que não quebra funcionalidades existentes)
- [ ] ✨ **Nova Feature** (Adição de funcionalidade sem quebrar retrocompatibilidade)
- [ ] 💥 **Breaking Change** (Mudança que quebra funcionalidades existentes ou altera contratos da API)
- [ ] ♻️ **Refatoração** (Melhoria de código sem alteração de comportamento)
- [ ] 📦 **Chore/Dependências** (Atualização de pacotes, configurações de build, etc.)
- [ ] 📝 **Documentação** (Atualização de README, Spec, etc.)

---

## ✅ Check-list de Qualidade (MostraAí Stack)
<!-- Verifique se você cumpriu os requisitos do projeto antes de solicitar review -->

**Backend (NestJS / Postgres)**
- [ ] A mudança no banco de dados tem uma Migration gerada e testada.
- [ ] Adicionei/Atualizei os decorators do Swagger (`@ApiProperty`, `@ApiResponse`) nos DTOs modificados.
- [ ] As regras de Multi-tenancy (isolamento por loja) foram respeitadas.

**Frontend (React / React Native)**
- [ ] Rodei o comando do **Kubb** para sincronizar os hooks/tipagens com o novo Swagger (se houve mudança na API).
- [ ] A estilização utilizou os tokens padrão do **Stitches** (sem CSS inline desnecessário).
- [ ] O componente está responsivo e performático (sem re-renders excessivos).

---

## 📸 Evidências Visuais (Frontend / Mobile)
<!-- Se houver mudanças visuais, adicione screenshots ou pequenos vídeos (GIFs) comparando o "Antes" e o "Depois". Se não houver, pode apagar esta seção. -->

| 📱 Antes | 📱 Depois |
| :---: | :---: |
| *(Cole sua imagem aqui)* | *(Cole sua imagem aqui)* |

---

## 🔗 Referências e Issues
<!-- Link para a task no Jira/Trello/GitHub Issues ou para documentos relevantes -->
- **Issue/Task:** #000
- **Link do Design (Figma):** [Link]

---

## ⚠️ Notas para o Revisor
<!-- Existe algo específico que o revisor deve prestar atenção? (ex: "Foque na lógica da linha X", "A migration demora um pouco", etc.) -->
[Adicione notas aqui, se necessário...]