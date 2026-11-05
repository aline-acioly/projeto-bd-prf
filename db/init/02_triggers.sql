-- =====================================================================
-- Regras que PK/FK/CHECK não garantem sozinhas (no lugar de ASSERTION,
-- que o PostgreSQL não implementa).
-- =====================================================================

-- R1. Especialização DISJUNTA de PESSOA.
CREATE OR REPLACE FUNCTION fn_pessoa_disjunta()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM PACIENTE           WHERE cpf = NEW.cpf)
     OR EXISTS (SELECT 1 FROM PROFISSIONAL_SAUDE WHERE cpf = NEW.cpf)
     OR EXISTS (SELECT 1 FROM ESTAGIARIO         WHERE cpf = NEW.cpf) THEN
    RAISE EXCEPTION 'CPF % já pertence a outra subclasse de PESSOA (especialização disjunta)', NEW.cpf;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_paciente_disjunto     BEFORE INSERT ON PACIENTE
  FOR EACH ROW EXECUTE FUNCTION fn_pessoa_disjunta();
CREATE TRIGGER tg_profissional_disjunto BEFORE INSERT ON PROFISSIONAL_SAUDE
  FOR EACH ROW EXECUTE FUNCTION fn_pessoa_disjunta();
CREATE TRIGGER tg_estagiario_disjunto   BEFORE INSERT ON ESTAGIARIO
  FOR EACH ROW EXECUTE FUNCTION fn_pessoa_disjunta();

-- R2. CONSULTA: atendente é profissional ou estagiário (união) e,
--     se for retorno, é do mesmo paciente da avaliação de origem e
--     agendado a partir da data dela.
CREATE OR REPLACE FUNCTION fn_consulta_valida()
RETURNS TRIGGER AS $$
DECLARE
  pac_origem  TIPO_CPF;
  data_origem DATE;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM PROFISSIONAL_SAUDE WHERE cpf = NEW.cpf_atendente)
     AND NOT EXISTS (SELECT 1 FROM ESTAGIARIO WHERE cpf = NEW.cpf_atendente) THEN
    RAISE EXCEPTION 'cpf_atendente % não é profissional de saúde nem estagiário', NEW.cpf_atendente;
  END IF;

  IF NEW.tipo = 'retorno' THEN
    SELECT C.cpf_paciente, A.data_realizacao INTO pac_origem, data_origem
      FROM AVALIACAO A JOIN CONSULTA C ON C.id_consulta = A.id_consulta
     WHERE A.id_avaliacao = NEW.id_avaliacao_origem;
    IF pac_origem <> NEW.cpf_paciente THEN
      RAISE EXCEPTION 'Retorno é de outro paciente que a avaliação de origem %', NEW.id_avaliacao_origem;
    END IF;
    IF NEW.data_agendada < data_origem THEN
      RAISE EXCEPTION 'Retorno agendado (%) antes da avaliação de origem (%)', NEW.data_agendada, data_origem;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_consulta_valida
  BEFORE INSERT OR UPDATE ON CONSULTA
  FOR EACH ROW EXECUTE FUNCTION fn_consulta_valida();

-- R3. AVALIACAO: RN04 (estagiário exige supervisor; profissional não tem)
--     e a avaliação não pode ser anterior à data agendada da consulta.
CREATE OR REPLACE FUNCTION fn_avaliacao_valida()
RETURNS TRIGGER AS $$
DECLARE
  atendente TIPO_CPF;
  data_cons DATE;
BEGIN
  SELECT cpf_atendente, data_agendada INTO atendente, data_cons
    FROM CONSULTA WHERE id_consulta = NEW.id_consulta;

  IF EXISTS (SELECT 1 FROM ESTAGIARIO WHERE cpf = atendente) AND NEW.cpf_supervisor IS NULL THEN
    RAISE EXCEPTION 'Avaliação conduzida por estagiário exige cpf_supervisor (RN04)';
  END IF;
  IF EXISTS (SELECT 1 FROM PROFISSIONAL_SAUDE WHERE cpf = atendente) AND NEW.cpf_supervisor IS NOT NULL THEN
    RAISE EXCEPTION 'Avaliação conduzida por profissional não tem supervisor (RN04)';
  END IF;
  IF NEW.data_realizacao < data_cons THEN
    RAISE EXCEPTION 'Avaliação (%) anterior à data da consulta (%)', NEW.data_realizacao, data_cons;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_avaliacao_valida
  BEFORE INSERT OR UPDATE ON AVALIACAO
  FOR EACH ROW EXECUTE FUNCTION fn_avaliacao_valida();

-- R4. SUSPEITA: o paciente do uso de medicamento é o mesmo da consulta
--     da avaliação, e a data de registro não é anterior à avaliação.
CREATE OR REPLACE FUNCTION fn_suspeita_valida()
RETURNS TRIGGER AS $$
DECLARE
  pac_avaliacao  TIPO_CPF;
  data_avaliacao DATE;
BEGIN
  SELECT C.cpf_paciente, A.data_realizacao INTO pac_avaliacao, data_avaliacao
    FROM AVALIACAO A JOIN CONSULTA C ON C.id_consulta = A.id_consulta
   WHERE A.id_avaliacao = NEW.id_avaliacao;

  IF pac_avaliacao <> NEW.cpf_paciente THEN
    RAISE EXCEPTION 'A suspeita é de um medicamento de outro paciente (avaliação %)', NEW.id_avaliacao;
  END IF;
  IF NEW.data_registro < data_avaliacao THEN
    RAISE EXCEPTION 'data_registro (%) anterior à avaliação (%)', NEW.data_registro, data_avaliacao;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_suspeita_valida
  BEFORE INSERT OR UPDATE ON SUSPEITA
  FOR EACH ROW EXECUTE FUNCTION fn_suspeita_valida();
