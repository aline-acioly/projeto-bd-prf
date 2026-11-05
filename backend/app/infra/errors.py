import logging
from typing import Mapping, Optional

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import DataError, DBAPIError, IntegrityError, SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)

SQLSTATE_TRIGGER = "P0001"
CODIGO_VALIDACAO = "validacao"
MENSAGEM_GENERICA = "Erro interno do servidor"
# O psycopg2 recusa o texto com \x00 antes de enviá-lo ao banco, com ValueError.
MARCA_ERRO_NUL = "NUL (0x00)"
ORIGENS_DE_CAMPO = {"body", "query", "path", "header", "cookie"}

MENSAGENS_CONSTRAINT = {
    # PKs
    "pessoa_pkey": "Já existe uma pessoa com este CPF",
    "paciente_pkey": "Este CPF já está cadastrado como paciente",
    "profissional_saude_pkey": "Este CPF já está cadastrado como profissional de saúde",
    "estagiario_pkey": "Este CPF já está cadastrado como estagiário",
    "pk_contatos": "Este paciente já tem um contato com este nome",
    "medicamento_pkey": "Já existe um medicamento com este id",
    "pk_uso": "Este paciente já usa este medicamento",
    "consulta_pkey": "Já existe uma consulta com este id",
    "avaliacao_pkey": "Já existe uma avaliação com este id",
    "opcao_nesc_pkey": "Já existe uma opção NESC com este id",
    "suspeita_pkey": "Já existe uma suspeita com este id",
    "intervencao_pkey": "Já existe uma intervenção com este id",
    # FKs: a linha referenciada não existe
    "fk_paciente_pessoa": "Pessoa não encontrada",
    "fk_prof_pessoa": "Pessoa não encontrada",
    "fk_estagiario_pessoa": "Pessoa não encontrada",
    "fk_contatos_paciente": "Paciente não encontrado",
    "fk_uso_paciente": "Paciente não encontrado",
    "fk_uso_medicamento": "Medicamento não encontrado",
    "fk_consulta_paciente": "Paciente não encontrado",
    "fk_consulta_atendente": "Atendente não encontrado",
    "fk_consulta_avaliacao_origem": "Avaliação de origem não encontrada",
    "fk_avaliacao_consulta": "Consulta não encontrada",
    "fk_avaliacao_supervisor": "Supervisor não encontrado entre os profissionais de saúde",
    "fk_suspeita_avaliacao": "Avaliação não encontrada",
    "fk_suspeita_uso": "O paciente não usa este medicamento",
    "fk_suspeita_nesc": "Opção NESC não encontrada",
    "fk_intervencao_suspeita": "Suspeita não encontrada",
    # UNIQUEs
    "uq_prof_registro": "Já existe um profissional com este conselho e número de registro",
    "uq_medicamento": "Já existe um medicamento com este nome e forma farmacêutica",
    "uq_avaliacao_consulta": "Esta consulta já tem avaliação",
    # CHECKs
    "tipo_cpf_check": "CPF deve ter exatamente 11 dígitos",
    "ck_pessoa_sexo": "Sexo deve ser M ou F",
    "ck_pessoa_nasc": "A data de nascimento não pode ser futura",
    "ck_consulta_tipo": "O tipo da consulta deve ser inicial ou retorno",
    "ck_consulta_origem": "Consulta de retorno exige avaliação de origem, e consulta inicial não pode ter",
    "ck_nesc_categoria": "A categoria deve ser Necessidade, Efetividade, Segurança ou Cumprimento",
    "ck_nesc_subtipo": "O subtipo deve ser quantitativo, qualitativo ou outro",
    "ck_intervencao_tipo": (
        "O tipo da intervenção deve ser encaminhamento, prescrição, orientação sobre "
        "medicamento, orientação sobre doença ou medidas não farmacológicas"
    ),
}

# O Postgres usa o mesmo nome de FK nos dois sentidos. Em um DELETE, o erro significa
# que a linha ainda é referenciada, e não que a referência não existe.
MENSAGENS_FK_DELETE = {
    "fk_uso_medicamento": "Este medicamento está em uso por pacientes e não pode ser excluído",
    "fk_consulta_paciente": "Este paciente tem consultas e não pode ser excluído",
    "fk_consulta_atendente": "Esta pessoa atendeu consultas e não pode ser excluída",
    "fk_consulta_avaliacao_origem": "Esta avaliação originou uma consulta de retorno e não pode ser excluída",
    "fk_avaliacao_supervisor": "Este profissional supervisionou avaliações e não pode ser excluído",
    "fk_suspeita_uso": "Este uso de medicamento tem suspeitas registradas e não pode ser excluído",
    "fk_suspeita_nesc": "Esta opção NESC é usada por suspeitas e não pode ser excluída",
}


def _resposta(
    status_code: int,
    erro: str,
    codigo: Optional[str] = None,
    headers: Optional[Mapping[str, str]] = None,
) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"erro": erro, "codigo": codigo},
        headers=headers,
    )


def _erro_interno(request: Request, exc: Exception) -> JSONResponse:
    logger.error(
        "Erro inesperado em %s %s", request.method, request.url.path, exc_info=exc
    )
    return _resposta(500, MENSAGEM_GENERICA)


def _mensagem_principal(orig: BaseException) -> str:
    diag = getattr(orig, "diag", None)
    principal = getattr(diag, "message_primary", None)
    return principal or str(orig).split("\n", 1)[0]


def _mensagem_integridade(exc: IntegrityError) -> str:
    constraint = getattr(getattr(exc.orig, "diag", None), "constraint_name", None)
    eh_delete = (exc.statement or "").lstrip().upper().startswith("DELETE")
    mensagens = MENSAGENS_FK_DELETE if eh_delete else MENSAGENS_CONSTRAINT
    return mensagens.get(constraint) or _mensagem_principal(exc.orig)


def _tratar_erro_banco(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    if isinstance(exc, DBAPIError):
        codigo = getattr(exc.orig, "pgcode", None)
        if isinstance(exc, IntegrityError):
            return _resposta(409, _mensagem_integridade(exc), codigo)
        if codigo == SQLSTATE_TRIGGER:
            return _resposta(400, _mensagem_principal(exc.orig), codigo)
        if isinstance(exc, DataError):
            return _resposta(422, _mensagem_principal(exc.orig), codigo)
    return _erro_interno(request, exc)


def _tratar_value_error(request: Request, exc: ValueError) -> JSONResponse:
    # ValueError é genérico demais: outro erro de programação continua sendo 500.
    if MARCA_ERRO_NUL in str(exc):
        return _resposta(422, str(exc))
    return _erro_interno(request, exc)


def _resumir_erro_validacao(erro: dict) -> str:
    local = erro["loc"][1:] if erro["loc"][0] in ORIGENS_DE_CAMPO else erro["loc"]
    campo = ".".join(str(parte) for parte in local)
    mensagem = erro["msg"].removeprefix("Value error, ")
    return f"{campo}: {mensagem}" if campo else mensagem


def _tratar_validacao(request: Request, exc: RequestValidationError) -> JSONResponse:
    resumo = "; ".join(_resumir_erro_validacao(erro) for erro in exc.errors())
    return _resposta(422, resumo, CODIGO_VALIDACAO)


def _tratar_http(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    return _resposta(
        exc.status_code, str(exc.detail), f"http_{exc.status_code}", exc.headers
    )


def _tratar_excecao(request: Request, exc: Exception) -> JSONResponse:
    # O Starlette registra o traceback e relança a exceção depois de responder.
    return _resposta(500, MENSAGEM_GENERICA)


def registrar_handlers(app: FastAPI) -> None:
    app.add_exception_handler(SQLAlchemyError, _tratar_erro_banco)
    app.add_exception_handler(ValueError, _tratar_value_error)
    app.add_exception_handler(RequestValidationError, _tratar_validacao)
    app.add_exception_handler(StarletteHTTPException, _tratar_http)
    app.add_exception_handler(Exception, _tratar_excecao)
