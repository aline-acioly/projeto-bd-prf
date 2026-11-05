-- =====================================================================
-- Dados fictícios para desenvolvimento e para praticar consultas.
-- =====================================================================

INSERT INTO PESSOA (cpf, nome, data_nasc, sexo, telefone) VALUES
 ('10000000001', 'Ana Beatriz Lima',      '1958-03-14', 'F', '81990000001'),
 ('10000000002', 'Carlos Eduardo Souza',  '1947-11-02', 'M', '81990000002'),
 ('10000000003', 'Maria do Carmo Alves',  '1963-07-21', 'F', '81990000003'),
 ('10000000004', 'José Ferreira',         '1970-01-30', 'M', '81990000004'),
 ('20000000001', 'Dra. Paula Menezes',    '1985-05-10', 'F', '81990000011'),
 ('20000000002', 'Dr. Rafael Cavalcanti', '1979-09-03', 'M', '81990000012'),
 ('30000000001', 'Lucas Andrade',         '2002-02-17', 'M', '81990000021'),
 ('30000000002', 'Beatriz Santos',        '2003-08-25', 'F', '81990000022');

INSERT INTO PACIENTE (cpf) VALUES
 ('10000000001'), ('10000000002'), ('10000000003'), ('10000000004');

INSERT INTO PROFISSIONAL_SAUDE (cpf, conselho, numero_registro, especialidade) VALUES
 ('20000000001', 'CRF', '12345', 'Farmácia clínica'),
 ('20000000002', 'CRF', '67890', 'Geriatria');

INSERT INTO ESTAGIARIO (cpf, instituicao_ensino, curso) VALUES
 ('30000000001', 'UFPE', 'Farmácia'),
 ('30000000002', 'UFPE', 'Farmácia');

INSERT INTO CONTATOS_EMERGENCIA (cpf_paciente, nome, telefone, relacao) VALUES
 ('10000000001', 'Pedro Lima',   '81980000001', 'Filho'),
 ('10000000001', 'Rita Lima',    '81980000002', 'Irmã'),
 ('10000000002', 'Helena Souza', '81980000003', 'Esposa'),
 ('10000000003', 'Joana Alves',  '81980000004', 'Filha');

-- Catálogo
INSERT INTO MEDICAMENTO (nome, forma_farmaceutica) VALUES
 ('Losartana',    'comprimido'),   -- 1
 ('Metformina',   'comprimido'),   -- 2
 ('Sinvastatina', 'comprimido'),   -- 3
 ('AAS',          'comprimido'),   -- 4
 ('Omeprazol',    'cápsula'),      -- 5
 ('Insulina NPH', 'solução'),      -- 6
 ('Enalapril',    'comprimido');   -- 7

-- Quem usa o quê, e como (atributos do relacionamento USA)
INSERT INTO USO_MEDICAMENTO (cpf_paciente, id_medicamento, dose, via_administracao, frequencia_uso) VALUES
 ('10000000001', 1, '50 mg',  'oral',       '1x ao dia'),
 ('10000000001', 2, '850 mg', 'oral',       '2x ao dia'),
 ('10000000002', 3, '20 mg',  'oral',       '1x à noite'),
 ('10000000002', 4, '100 mg', 'oral',       '1x ao dia'),
 ('10000000002', 5, '20 mg',  'oral',       'em jejum'),
 ('10000000003', 6, '10 UI',  'subcutânea', '2x ao dia'),
 ('10000000004', 7, '10 mg',  'oral',       '2x ao dia'),
 ('10000000003', 2, '500 mg', 'oral',       '1x ao dia');   -- Metformina também, com outra dose

INSERT INTO OPCAO_NESC (categoria, subtipo, descricao) VALUES
 ('Necessidade', 'outro',        'Medicamento desnecessário'),           -- 1
 ('Efetividade', 'quantitativo', 'Dose insuficiente'),                   -- 2
 ('Efetividade', 'qualitativo',  'Medicamento inadequado à condição'),   -- 3
 ('Segurança',   'quantitativo', 'Dose excessiva'),                      -- 4
 ('Segurança',   'qualitativo',  'Reação adversa'),                      -- 5
 ('Cumprimento', 'outro',        'Não adesão ao tratamento');            -- 6

-- Consultas iniciais (as de retorno entram depois, porque dependem das avaliações)
INSERT INTO CONSULTA (data_agendada, tipo, cpf_paciente, cpf_atendente) VALUES
 ('2026-09-01', 'inicial', '10000000001', '20000000001'),  -- 1 profissional
 ('2026-09-03', 'inicial', '10000000002', '30000000001'),  -- 2 estagiário
 ('2026-09-10', 'inicial', '10000000003', '30000000002'),  -- 3 estagiário
 ('2026-11-20', 'inicial', '10000000004', '20000000001');  -- 4 ainda não aconteceu (sem avaliação)

INSERT INTO AVALIACAO (id_consulta, data_realizacao, cpf_supervisor) VALUES
 (1, '2026-09-01', NULL),            -- 1
 (2, '2026-09-03', '20000000001'),   -- 2
 (3, '2026-09-10', '20000000002');   -- 3

-- Retornos (ORIGINA)
INSERT INTO CONSULTA (data_agendada, tipo, cpf_paciente, cpf_atendente, id_avaliacao_origem) VALUES
 ('2026-10-01', 'retorno', '10000000001', '20000000002', 1),  -- 5
 ('2026-10-05', 'retorno', '10000000002', '30000000001', 2),  -- 6
 ('2026-11-10', 'retorno', '10000000003', '20000000002', 3);  -- 7 ainda não aconteceu

INSERT INTO AVALIACAO (id_consulta, data_realizacao, cpf_supervisor) VALUES
 (5, '2026-10-01', NULL),            -- 4
 (6, '2026-10-05', '20000000002');   -- 5

INSERT INTO SUSPEITA (data_registro, id_avaliacao, cpf_paciente, id_medicamento, id_opcao_nesc) VALUES
 ('2026-09-01', 1, '10000000001', 2, 2),   -- 1
 ('2026-09-03', 2, '10000000002', 4, 5),   -- 2
 ('2026-09-03', 2, '10000000002', 5, 1),   -- 3
 ('2026-09-10', 3, '10000000003', 6, 6),   -- 4
 ('2026-10-01', 4, '10000000001', 1, 4),   -- 5
 ('2026-10-05', 5, '10000000002', 3, 6);   -- 6

INSERT INTO INTERVENCAO (tipo, descricao, id_suspeita) VALUES
 ('encaminhamento',               'Encaminhada ao endocrinologista para ajuste', 1),
 ('orientação sobre medicamento', 'Tomar AAS após as refeições',                2),
 ('encaminhamento',               'Avaliar suspensão do omeprazol com médico',   3),
 ('orientação sobre doença',      'Explicação sobre controle glicêmico',         4),
 ('medidas não farmacológicas',   'Caminhada 30 min, 5x por semana',             4),
 ('orientação sobre medicamento', 'Uso de porta-comprimidos semanal',            6);
