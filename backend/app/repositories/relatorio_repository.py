"""Relatórios em SQL puro (text() do SQLAlchemy), para mostrar as consultas da disciplina.

O texto de cada constante é o que roda no banco e o que a API devolve no campo "sql".
"""
from textwrap import dedent

from sqlalchemy import text
from sqlalchemy.orm import Session


def _sql(texto: str) -> str:
    return dedent(texto).strip()


# JOIN para o atendente e LEFT JOIN para o que pode ainda não existir
# (consulta sem avaliação, avaliação sem suspeita).
HISTORICO_PACIENTE = _sql("""
    SELECT c.id_consulta, c.data_agendada, c.tipo,
           atendente.nome   AS atendente,
           a.id_avaliacao, a.data_realizacao,
           s.id_suspeita,
           m.nome           AS medicamento,
           n.categoria      AS categoria_nesc,
           n.descricao      AS problema
      FROM consulta c
      JOIN pessoa atendente  ON atendente.cpf = c.cpf_atendente
      LEFT JOIN avaliacao a  ON a.id_consulta = c.id_consulta
      LEFT JOIN suspeita s   ON s.id_avaliacao = a.id_avaliacao
      LEFT JOIN medicamento m ON m.id_medicamento = s.id_medicamento
      LEFT JOIN opcao_nesc n ON n.id_opcao_nesc = s.id_opcao_nesc
     WHERE c.cpf_paciente = :cpf
     ORDER BY c.data_agendada, c.id_consulta, s.id_suspeita
""")

# LEFT JOIN a partir de OPCAO_NESC: categoria sem suspeita aparece com 0.
SUSPEITAS_POR_CATEGORIA = _sql("""
    SELECT n.categoria, COUNT(s.id_suspeita) AS total
      FROM opcao_nesc n
      LEFT JOIN suspeita s ON s.id_opcao_nesc = n.id_opcao_nesc
     GROUP BY n.categoria
     ORDER BY total DESC, n.categoria
""")

PACIENTES_SEM_AVALIACAO = _sql("""
    SELECT p.cpf, pe.nome, pe.telefone,
           (SELECT COUNT(*) FROM consulta c WHERE c.cpf_paciente = p.cpf) AS total_consultas
      FROM paciente p
      JOIN pessoa pe ON pe.cpf = p.cpf
     WHERE NOT EXISTS (
           SELECT 1
             FROM consulta c
             JOIN avaliacao a ON a.id_consulta = c.id_consulta
            WHERE c.cpf_paciente = p.cpf)
     ORDER BY pe.nome
""")

RETORNOS_PENDENTES = _sql("""
    SELECT c.id_consulta, c.data_agendada,
           paciente.nome  AS paciente,
           atendente.nome AS atendente,
           c.id_avaliacao_origem
      FROM consulta c
      JOIN pessoa paciente  ON paciente.cpf = c.cpf_paciente
      JOIN pessoa atendente ON atendente.cpf = c.cpf_atendente
     WHERE c.tipo = 'retorno'
       AND NOT EXISTS (SELECT 1 FROM avaliacao a WHERE a.id_consulta = c.id_consulta)
     ORDER BY c.data_agendada
""")

# PESSOA aparece com três aliases: o paciente, o estagiário e o supervisor.
AVALIACOES_ESTAGIARIOS = _sql("""
    SELECT a.id_avaliacao, a.data_realizacao,
           paciente.nome   AS paciente,
           estagiario.nome AS estagiario,
           supervisor.nome AS supervisor
      FROM avaliacao a
      JOIN consulta c            ON c.id_consulta = a.id_consulta
      JOIN estagiario e          ON e.cpf = c.cpf_atendente
      JOIN pessoa estagiario     ON estagiario.cpf = e.cpf
      JOIN pessoa supervisor     ON supervisor.cpf = a.cpf_supervisor
      JOIN pessoa paciente       ON paciente.cpf = c.cpf_paciente
     ORDER BY a.data_realizacao, a.id_avaliacao
""")

# Empates aparecem todos: >= ALL compara com a contagem de cada medicamento.
MEDICAMENTOS_MAIS_SUSPEITAS = _sql("""
    SELECT m.id_medicamento, m.nome, m.forma_farmaceutica,
           COUNT(*) AS total_suspeitas
      FROM medicamento m
      JOIN suspeita s ON s.id_medicamento = m.id_medicamento
     GROUP BY m.id_medicamento, m.nome, m.forma_farmaceutica
    HAVING COUNT(*) >= ALL (SELECT COUNT(*)
                              FROM suspeita
                             GROUP BY id_medicamento)
     ORDER BY m.nome
""")

PACIENTES_POLIFARMACIA = _sql("""
    SELECT p.cpf, pe.nome,
           COUNT(*) AS total_medicamentos,
           STRING_AGG(m.nome, ', ' ORDER BY m.nome) AS medicamentos
      FROM paciente p
      JOIN pessoa pe          ON pe.cpf = p.cpf
      JOIN uso_medicamento u  ON u.cpf_paciente = p.cpf
      JOIN medicamento m      ON m.id_medicamento = u.id_medicamento
     GROUP BY p.cpf, pe.nome
    HAVING COUNT(*) > 1
     ORDER BY total_medicamentos DESC, pe.nome
""")

INTERVENCOES_POR_TIPO = _sql("""
    SELECT i.tipo, COUNT(*) AS total
      FROM intervencao i
     GROUP BY i.tipo
     ORDER BY total DESC, i.tipo
""")


# Contagens da página Início, num único SELECT com subconsultas escalares.
RESUMO = _sql("""
    SELECT (SELECT COUNT(*) FROM paciente) AS pacientes,
           (SELECT COUNT(*)
              FROM consulta c
             WHERE NOT EXISTS (SELECT 1 FROM avaliacao a WHERE a.id_consulta = c.id_consulta)
           ) AS consultas_sem_avaliacao,
           (SELECT COUNT(*)
              FROM consulta c
             WHERE c.tipo = 'retorno'
               AND NOT EXISTS (SELECT 1 FROM avaliacao a WHERE a.id_consulta = c.id_consulta)
           ) AS retornos_pendentes,
           (SELECT COUNT(*) FROM suspeita) AS suspeitas
""")

# Consultas ainda sem avaliação, por data; o papel do atendente vem de qual subclasse existe.
PROXIMOS_ATENDIMENTOS = _sql("""
    SELECT c.id_consulta, c.data_agendada, c.tipo,
           paciente.nome  AS paciente,
           atendente.nome AS atendente,
           CASE WHEN EXISTS (SELECT 1 FROM estagiario e WHERE e.cpf = c.cpf_atendente)
                THEN 'estagiario' ELSE 'profissional' END AS papel_atendente
      FROM consulta c
      JOIN pessoa paciente  ON paciente.cpf = c.cpf_paciente
      JOIN pessoa atendente ON atendente.cpf = c.cpf_atendente
     WHERE NOT EXISTS (SELECT 1 FROM avaliacao a WHERE a.id_consulta = c.id_consulta)
     ORDER BY c.data_agendada, c.id_consulta
""")


class RelatorioRepository:
    def __init__(self, db: Session):
        self.db = db

    def _executar(self, sql: str, **params) -> dict:
        linhas = self.db.execute(text(sql), params).mappings().all()
        return {"sql": sql, "linhas": [dict(linha) for linha in linhas]}

    def paciente_existe(self, cpf: str) -> bool:
        return self.db.execute(text("SELECT 1 FROM paciente WHERE cpf = :cpf"), {"cpf": cpf}).first() is not None

    def historico_paciente(self, cpf: str) -> dict:
        return self._executar(HISTORICO_PACIENTE, cpf=cpf)

    def suspeitas_por_categoria(self) -> dict:
        return self._executar(SUSPEITAS_POR_CATEGORIA)

    def pacientes_sem_avaliacao(self) -> dict:
        return self._executar(PACIENTES_SEM_AVALIACAO)

    def retornos_pendentes(self) -> dict:
        return self._executar(RETORNOS_PENDENTES)

    def avaliacoes_estagiarios(self) -> dict:
        return self._executar(AVALIACOES_ESTAGIARIOS)

    def medicamentos_mais_suspeitas(self) -> dict:
        return self._executar(MEDICAMENTOS_MAIS_SUSPEITAS)

    def pacientes_polifarmacia(self) -> dict:
        return self._executar(PACIENTES_POLIFARMACIA)

    def intervencoes_por_tipo(self) -> dict:
        return self._executar(INTERVENCOES_POR_TIPO)

    def resumo(self) -> dict:
        return self._executar(RESUMO)

    def proximos_atendimentos(self) -> dict:
        return self._executar(PROXIMOS_ATENDIMENTOS)
