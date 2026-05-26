# Gestor Escolar de Educação Especial - DL 54/2018

## Funcionalidades Principais

### Autenticação e Gestão de Utilizadores
- [x] Sistema de autenticação OAuth com Manus
- [x] Gestão de papéis (admin, professor, técnico)
- [ ] Criação, edição e desativação de contas de utilizador (interface)
- [ ] Atribuição de papéis aos utilizadores (interface)

### Gestão de Alunos
- [x] Registo completo de alunos com todos os campos obrigatórios
- [x] Associação de alunos a escolas
- [x] Registo de turma, nível de ensino e necessidades especiais
- [x] Acomodações de avaliação por aluno
- [x] Pesquisa e filtros avançados de alunos
- [ ] Edição e desativação de registos de alunos (interface)

### Gestão de Medidas DL 54/2018
- [x] Registo de medidas Universais, Seletivas e Adicionais (backend)
- [x] Associação de medidas a alunos (backend)
- [x] Datas de início e fim de medidas (backend)
- [x] Notas e observações sobre medidas (backend)
- [ ] Visualização de histórico de medidas por aluno (interface)

### Gestão de Escolas
- [x] Configuração das 6 escolas do agrupamento (backend)
- [x] Ativação/desativação de escolas (backend)
- [ ] Visualização de estatísticas por escola (interface)

### Dashboard e Estatísticas
- [ ] Dashboard com indicadores principais
- [ ] Filtros por escola, nível de ensino e tipo de medida
- [ ] Gráficos de distribuição de medidas
- [ ] Contadores de alunos por escola e nível
- [ ] Indicadores de medidas ativas

### Relatórios
- [ ] Geração de relatórios por escola
- [ ] Geração de relatórios por turma
- [ ] Geração de relatórios por tipo de medida
- [ ] Filtros por período letivo
- [ ] Exportação em PDF
- [ ] Integração com IA para síntese de medidas
- [ ] Formatação adequada para reuniões de EMAEI
- [ ] Conformidade com requisitos legais DL 54/2018

### Auditoria
- [x] Registo de todas as alterações (audit log)
- [x] Rastreabilidade completa de ações
- [ ] Visualização do histórico de alterações (interface)
- [x] Identificação do utilizador que realizou cada ação

### Interface e Design
- [x] Design visual com estética técnica (CAD-like)
- [x] Fundo azul royal escuro com grelha subtil
- [x] Desenhos técnicos a linha branca (bordas e molduras)
- [x] Tipografia negrita, sem serifas, a branco
- [x] Interface totalmente em português europeu
- [x] Design responsivo para diferentes dispositivos
- [x] Navegação intuitiva e profissional

### Banco de Dados
- [x] Tabela de perfis de utilizadores (users)
- [x] Tabela de escolas
- [x] Tabela de alunos
- [x] Tabela de medidas
- [x] Tabela de associação aluno-medidas
- [x] Tabela de audit log
- [x] Índices para otimização de queries
- [ ] Row-level security (RLS) em todas as tabelas (futura melhoria)

### Testes
- [ ] Testes unitários para procedimentos críticos
- [ ] Testes de autenticação
- [ ] Testes de autorização e RLS
- [ ] Testes de geração de relatórios

## Progresso

Total de tarefas: 15/60 (25% concluído)

### Concluído
- [x] Esquema de base de dados com todas as tabelas (users, schools, students, measures, student_measures, audit_log, reports)
- [x] Migração SQL e criação das tabelas na base de dados
- [x] Helpers de base de dados (db.ts) com funções CRUD
- [x] Procedimentos tRPC para gestão de alunos, escolas, medidas e auditoria
- [x] Autenticação e autorização com papéis (admin, professor, técnico)
- [x] Interface inicial (Home.tsx) com design técnico CAD-like
- [x] Página de gestão de alunos com filtros e formulário de criação
- [x] Rotas principais da aplicação
- [x] Design visual com fundo azul royal e grelha técnica
- [x] Tipografia negrita, sem serifas, a branco
- [x] Integração de ícones (lucide-react)
- [x] Formulários com validação (react-hook-form + zod)
- [x] Diálogos para criação de registos
- [x] Notificações (sonner)
- [x] Rastreabilidade com audit log automático
