# Prisma Estudos

App web SaaS moderno para cronograma inteligente de estudos, com frontend funcional e backend MySQL.

## Como abrir

Para testar somente o frontend, abra `index.html` diretamente no navegador.

Para usar com MySQL:

1. Preencha o arquivo `.env` com host, usuario, senha e nome do banco.
2. Rode no MySQL o arquivo `backend/user_subjects.sql` se essa tabela ainda nao existir.
3. Se sua tabela `users` ja existia, rode `backend/migrations/2026-05-10-add-user-access-expiration.sql`.
4. Se sua tabela `study_profiles` ja existia, rode `backend/migrations/2026-05-15-add-profile-onboarding.sql`.
5. Instale as dependencias com `npm install`.
6. Se quiser carregar dados demo no banco, rode `npm run seed`.
7. Inicie o backend com `npm start`.
8. Acesse `http://localhost:3001`.

## Perfis demo

- Estudante: `ana@prismaestudos.local` / `123456`
- Administrador: `admin@prismaestudos.local` / `admin123`

## Funcionalidades implementadas

- Login com backend MySQL e fallback local para desenvolvimento.
- Sidebar responsiva com icones em Dashboard, Cronograma, Materias, Revisoes, Historico, Perfil, Personalizacao e Administracao.
- Cronograma interativo gerado a partir das materias selecionadas, topicos pendentes e ordem cadastrada.
- Timer com escolha de tempo, pausa, continuacao, finalizacao, alerta visual e sons em 50% e no fim.
- Fluxo de conclusao, estudo parcial, continuacao posterior e programacao de revisoes.
- Revisoes pendentes, marcacao como feita e proxima revisao periodica.
- Dashboard com tempo total, hoje, semana, streak, topicos, revisoes, graficos e calendario mensal.
- Materias e topicos base globais, com bloqueio de edicao/exclusao para estudante.
- Materias e topicos proprios do estudante com edicao e exclusao.
- Personalizacao individual de tema, cores, estilo dos cards, banner e densidade.
- Administracao com CRUD de usuarios, catalogo base e progresso geral.
- Administrador pode definir vencimento do login por usuario e acompanhar acessos expirados ou proximos do vencimento.
- Historico com filtro por materia, busca por topico, exportacao CSV e impressao/PDF.

## Backend MySQL

O backend Express em `backend/server.js` conversa com estas tabelas:

- `users`
- `study_profiles`
- `subjects`
- `topics`
- `user_subjects`
- `user_topics`
- `study_sessions`
- `reviews`
- `user_theme_settings`

As credenciais ficam no `.env` e nao devem ser colocadas no frontend.
