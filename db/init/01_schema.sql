-- =====================================================================
-- Sistema de Avaliação PRF — modelagem física (PostgreSQL)
-- Versão 2, após as ressalvas da apresentação:
--   1) CONSULTA é o atendimento (agendado); AVALIACAO é o que é registrado
--      quando a consulta acontece (1:1 com a consulta). Paciente e
--      atendente ficam só na CONSULTA, sem duplicar na AVALIACAO.
--   2) Dose, via e frequência dependem do paciente: USA virou relação
--      M:N com atributos (USO_MEDICAMENTO); MEDICAMENTO virou catálogo.
--   3) Consulta inicial/retorno deixou de ser especialização: coluna
--      tipo + CHECK (retorno exige a avaliação de origem).
-- 12 tabelas. Executado automaticamente pelo container do Postgres.
-- =====================================================================

CREATE DOMAIN TIPO_CPF AS CHAR(11)
  CHECK (VALUE ~ '^[0-9]{11}$');

-- ---------------------------------------------------------------------
-- PESSOA e subclasses (especialização total e disjunta).
-- Uma tabela por subclasse, PK = FK para a superclasse.
-- ---------------------------------------------------------------------
CREATE TABLE PESSOA (
  cpf        TIPO_CPF      PRIMARY KEY,
  nome       VARCHAR(150)  NOT NULL,
  data_nasc  DATE          NOT NULL,
  sexo       CHAR(1)       NOT NULL,
  telefone   VARCHAR(20)   NOT NULL,
  CONSTRAINT ck_pessoa_sexo CHECK (sexo IN ('M', 'F')),
  CONSTRAINT ck_pessoa_nasc CHECK (data_nasc <= CURRENT_DATE)
);

CREATE TABLE PACIENTE (
  cpf TIPO_CPF PRIMARY KEY,
  CONSTRAINT fk_paciente_pessoa FOREIGN KEY (cpf)
    REFERENCES PESSOA(cpf) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE PROFISSIONAL_SAUDE (
  cpf             TIPO_CPF      PRIMARY KEY,
  conselho        VARCHAR(10)   NOT NULL,
  numero_registro VARCHAR(20)   NOT NULL,
  especialidade   VARCHAR(100)  NOT NULL,
  CONSTRAINT uq_prof_registro UNIQUE (conselho, numero_registro),
  CONSTRAINT fk_prof_pessoa FOREIGN KEY (cpf)
    REFERENCES PESSOA(cpf) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE ESTAGIARIO (
  cpf                TIPO_CPF      PRIMARY KEY,
  instituicao_ensino VARCHAR(150)  NOT NULL,
  curso              VARCHAR(100)  NOT NULL,
  CONSTRAINT fk_estagiario_pessoa FOREIGN KEY (cpf)
    REFERENCES PESSOA(cpf) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Entidade fraca: PK = FK do dono + chave parcial.
CREATE TABLE CONTATOS_EMERGENCIA (
  cpf_paciente TIPO_CPF      NOT NULL,
  nome         VARCHAR(150)  NOT NULL,
  telefone     VARCHAR(20)   NOT NULL,
  relacao      VARCHAR(50)   NOT NULL,
  CONSTRAINT pk_contatos PRIMARY KEY (cpf_paciente, nome),
  CONSTRAINT fk_contatos_paciente FOREIGN KEY (cpf_paciente)
    REFERENCES PACIENTE(cpf) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ---------------------------------------------------------------------
-- MEDICAMENTO = catálogo (o que o medicamento é).
-- USO_MEDICAMENTO = relacionamento USA (M:N) com os atributos que
-- dependem do paciente. PK = combinação das FKs (mapeamento M:N).
-- ---------------------------------------------------------------------
CREATE TABLE MEDICAMENTO (
  id_medicamento     SERIAL        PRIMARY KEY,
  nome               VARCHAR(150)  NOT NULL,
  forma_farmaceutica VARCHAR(50)   NOT NULL,
  CONSTRAINT uq_medicamento UNIQUE (nome, forma_farmaceutica)
);

CREATE TABLE USO_MEDICAMENTO (
  cpf_paciente      TIPO_CPF     NOT NULL,
  id_medicamento    INT          NOT NULL,
  dose              VARCHAR(50)  NOT NULL,
  via_administracao VARCHAR(50)  NOT NULL,
  frequencia_uso    VARCHAR(50)  NOT NULL,
  CONSTRAINT pk_uso PRIMARY KEY (cpf_paciente, id_medicamento),
  CONSTRAINT fk_uso_paciente FOREIGN KEY (cpf_paciente)
    REFERENCES PACIENTE(cpf) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_uso_medicamento FOREIGN KEY (id_medicamento)
    REFERENCES MEDICAMENTO(id_medicamento)
);

-- ---------------------------------------------------------------------
-- CONSULTA = atendimento. cpf_atendente vem da união (Profissional U
-- Estagiário): FK para PESSOA + trigger garantindo que não é paciente.
-- tipo substitui a especialização inicial/retorno.
-- ---------------------------------------------------------------------
CREATE TABLE CONSULTA (
  id_consulta         SERIAL       PRIMARY KEY,
  data_agendada       DATE         NOT NULL,
  tipo                VARCHAR(10)  NOT NULL DEFAULT 'inicial',
  cpf_paciente        TIPO_CPF     NOT NULL,
  cpf_atendente       TIPO_CPF     NOT NULL,
  id_avaliacao_origem INT,                         -- só para retorno (FK criada abaixo)
  CONSTRAINT ck_consulta_tipo CHECK (tipo IN ('inicial', 'retorno')),
  CONSTRAINT ck_consulta_origem CHECK (
    (tipo = 'inicial' AND id_avaliacao_origem IS NULL) OR
    (tipo = 'retorno' AND id_avaliacao_origem IS NOT NULL)),
  CONSTRAINT fk_consulta_paciente  FOREIGN KEY (cpf_paciente)
    REFERENCES PACIENTE(cpf) ON UPDATE CASCADE,
  CONSTRAINT fk_consulta_atendente FOREIGN KEY (cpf_atendente)
    REFERENCES PESSOA(cpf) ON UPDATE CASCADE
);

-- AVALIACAO: registrada em uma consulta (1:1 -> UNIQUE na FK).
-- Paciente e atendente são os da consulta.
CREATE TABLE AVALIACAO (
  id_avaliacao    SERIAL    PRIMARY KEY,
  id_consulta     INT       NOT NULL,
  data_realizacao DATE      NOT NULL,
  cpf_supervisor  TIPO_CPF,                        -- obrigatório só se o atendente for estagiário
  CONSTRAINT uq_avaliacao_consulta UNIQUE (id_consulta),
  CONSTRAINT fk_avaliacao_consulta   FOREIGN KEY (id_consulta)
    REFERENCES CONSULTA(id_consulta) ON DELETE CASCADE,
  CONSTRAINT fk_avaliacao_supervisor FOREIGN KEY (cpf_supervisor)
    REFERENCES PROFISSIONAL_SAUDE(cpf) ON UPDATE CASCADE
);

-- ORIGINA: a consulta de retorno aponta para a avaliação que a gerou.
-- (criada depois porque CONSULTA e AVALIACAO se referenciam)
ALTER TABLE CONSULTA ADD CONSTRAINT fk_consulta_avaliacao_origem
  FOREIGN KEY (id_avaliacao_origem) REFERENCES AVALIACAO(id_avaliacao);

CREATE TABLE OPCAO_NESC (
  id_opcao_nesc SERIAL       PRIMARY KEY,
  categoria     VARCHAR(20)  NOT NULL,
  subtipo       VARCHAR(20)  NOT NULL,
  descricao     TEXT         NOT NULL,
  CONSTRAINT ck_nesc_categoria CHECK (categoria IN ('Necessidade', 'Efetividade', 'Segurança', 'Cumprimento')),
  CONSTRAINT ck_nesc_subtipo   CHECK (subtipo   IN ('quantitativo', 'qualitativo', 'outro'))
);

-- SUSPEITA refere-se a um medicamento QUE O PACIENTE USA:
-- FK composta para USO_MEDICAMENTO (garante isso sem trigger).
CREATE TABLE SUSPEITA (
  id_suspeita    SERIAL    PRIMARY KEY,
  data_registro  DATE      NOT NULL,
  id_avaliacao   INT       NOT NULL,
  cpf_paciente   TIPO_CPF  NOT NULL,
  id_medicamento INT       NOT NULL,
  id_opcao_nesc  INT       NOT NULL,
  CONSTRAINT fk_suspeita_avaliacao FOREIGN KEY (id_avaliacao)
    REFERENCES AVALIACAO(id_avaliacao) ON DELETE CASCADE,
  CONSTRAINT fk_suspeita_uso FOREIGN KEY (cpf_paciente, id_medicamento)
    REFERENCES USO_MEDICAMENTO(cpf_paciente, id_medicamento) ON UPDATE CASCADE,
  CONSTRAINT fk_suspeita_nesc FOREIGN KEY (id_opcao_nesc)
    REFERENCES OPCAO_NESC(id_opcao_nesc)
);

CREATE TABLE INTERVENCAO (
  id_intervencao SERIAL       PRIMARY KEY,
  tipo           VARCHAR(40)  NOT NULL,
  descricao      TEXT         NOT NULL,
  id_suspeita    INT          NOT NULL,
  CONSTRAINT ck_intervencao_tipo CHECK (tipo IN ('encaminhamento', 'prescrição',
      'orientação sobre medicamento', 'orientação sobre doença', 'medidas não farmacológicas')),
  CONSTRAINT fk_intervencao_suspeita FOREIGN KEY (id_suspeita)
    REFERENCES SUSPEITA(id_suspeita) ON DELETE CASCADE
);
