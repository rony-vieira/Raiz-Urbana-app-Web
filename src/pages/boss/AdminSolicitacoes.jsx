
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminSolicitacoes.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://raiz-urbana-back-end.onrender.com";

function AdminSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState("TODAS");
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const carregarSolicitacoes = async () => {
      try {
        setCarregando(true);
        setErro("");

        const token =
          sessionStorage.getItem("token") ||
          localStorage.getItem("token");

        if (!token) {
          setErro("Sua sessão expirou. Faça login novamente.");
          return;
        }

        const resposta = await fetch(`${API_URL}/api/solicitacoes`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (resposta.status === 401) {
          setErro("Sua sessão expirou. Faça login novamente.");
          return;
        }

        if (resposta.status === 403) {
          setErro("Você não tem permissão para visualizar as solicitações.");
          return;
        }

        if (!resposta.ok) {
          throw new Error("Não foi possível carregar as solicitações.");
        }

        const dados = await resposta.json();
        setSolicitacoes(Array.isArray(dados) ? dados : []);
      } catch (error) {
        console.error("Erro ao carregar solicitações:", error);
        setErro(error.message || "Erro ao conectar com o servidor.");
      } finally {
        setCarregando(false);
      }
    };

    carregarSolicitacoes();
  }, []);

  const normalizarStatus = (status) =>
    String(status || "").toUpperCase().trim();

  const traduzirStatus = (status) => {
    switch (normalizarStatus(status)) {
      case "PENDENTE":
        return "Pendente";
      case "EM_ANALISE":
        return "Em análise";
      case "VISITA_AGENDADA":
        return "Visita agendada";
      case "APROVADO":
      case "APROVADA":
        return "Aprovado";
      case "CONCLUIDO":
      case "CONCLUIDA":
        return "Concluído";
      case "RECUSADO":
      case "RECUSADA":
        return "Recusado";
      default:
        return status || "Não informado";
    }
  };

  const classeStatus = (status) => {
    switch (normalizarStatus(status)) {
      case "PENDENTE":
        return "status-pendente";

      case "EM_ANALISE":
      case "VISITA_AGENDADA":
      case "APROVADO":
      case "APROVADA":
        return "status-analise";

      case "CONCLUIDO":
      case "CONCLUIDA":
        return "status-concluido";

      case "RECUSADO":
      case "RECUSADA":
        return "status-recusado";

      default:
        return "";
    }
  };

  const formatarData = (data) => {
    if (!data) return "Não informada";

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
      return data;
    }

    const dataObj = new Date(data);

    if (Number.isNaN(dataObj.getTime())) {
      return "Não informada";
    }

    return dataObj.toLocaleDateString("pt-BR", {
      timeZone: "UTC",
    });
  };

  const totalPendentes = solicitacoes.filter(
    (item) => normalizarStatus(item.status) === "PENDENTE"
  ).length;

  const totalAnalise = solicitacoes.filter((item) =>
    ["EM_ANALISE", "VISITA_AGENDADA"].includes(
      normalizarStatus(item.status)
    )
  ).length;

  const totalConcluidas = solicitacoes.filter((item) =>
    ["CONCLUIDO", "CONCLUIDA"].includes(
      normalizarStatus(item.status)
    )
  ).length;

  const solicitacoesFiltradas = solicitacoes.filter((item) => {
    const status = normalizarStatus(item.status);

    const correspondeStatus =
      filtroStatus === "TODAS" ||
      status === filtroStatus ||
      (filtroStatus === "ANALISE" &&
        ["EM_ANALISE", "VISITA_AGENDADA"].includes(status)) ||
      (filtroStatus === "APROVADAS" &&
        ["APROVADO", "APROVADA"].includes(status)) ||
      (filtroStatus === "CONCLUIDAS" &&
        ["CONCLUIDO", "CONCLUIDA"].includes(status)) ||
      (filtroStatus === "RECUSADAS" &&
        ["RECUSADO", "RECUSADA"].includes(status));

    const termo = busca.toLowerCase().trim();

    const correspondeBusca =
      termo === "" ||
      String(item.protocolo || "").toLowerCase().includes(termo) ||
      String(item.nomeCompleto || "").toLowerCase().includes(termo) ||
      String(item.bairro || "").toLowerCase().includes(termo) ||
      String(item.ruaAvenida || "").toLowerCase().includes(termo);

    return correspondeStatus && correspondeBusca;
  });

  return (
    <main className="admin-solicitacoes-page">
      <div className="admin-solicitacoes-container">
        <div className="admin-solicitacoes-voltar">
          <Link to="/admin">← Voltar ao painel</Link>
        </div>

        <section className="admin-solicitacoes-topo">
          <span className="admin-solicitacoes-label">
            Arborização
          </span>

          <h1>Solicitações de plantio</h1>

          <p>
            Acompanhe as solicitações de plantio realizadas em
            todos os bairros da plataforma.
          </p>
        </section>

        <section className="admin-solicitacoes-resumo">
          <div className="admin-solicitacoes-resumo-card">
            <div className="admin-solicitacoes-resumo-icon">🌱</div>
            <div>
              <strong>{solicitacoes.length}</strong>
              <span>Total</span>
            </div>
          </div>

          <div className="admin-solicitacoes-resumo-card">
            <div className="admin-solicitacoes-resumo-icon">⏳</div>
            <div>
              <strong>{totalPendentes}</strong>
              <span>Pendentes</span>
            </div>
          </div>

          <div className="admin-solicitacoes-resumo-card">
            <div className="admin-solicitacoes-resumo-icon">🔎</div>
            <div>
              <strong>{totalAnalise}</strong>
              <span>Em análise</span>
            </div>
          </div>

          <div className="admin-solicitacoes-resumo-card">
            <div className="admin-solicitacoes-resumo-icon">🌳</div>
            <div>
              <strong>{totalConcluidas}</strong>
              <span>Concluídas</span>
            </div>
          </div>
        </section>

        <section className="admin-solicitacoes-card">
          <div className="admin-solicitacoes-ferramentas">
            <div className="admin-solicitacoes-busca">
              <label htmlFor="buscaSolicitacao">
                Buscar solicitação
              </label>

              <input
                id="buscaSolicitacao"
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Protocolo, usuário, bairro ou rua"
              />
            </div>

            <div className="admin-solicitacoes-filtros">
              <button
                type="button"
                className={filtroStatus === "TODAS" ? "ativo" : ""}
                onClick={() => setFiltroStatus("TODAS")}
              >
                Todas
              </button>

              <button
                type="button"
                className={filtroStatus === "PENDENTE" ? "ativo" : ""}
                onClick={() => setFiltroStatus("PENDENTE")}
              >
                Pendentes
              </button>

              <button
                type="button"
                className={filtroStatus === "ANALISE" ? "ativo" : ""}
                onClick={() => setFiltroStatus("ANALISE")}
              >
                Em análise
              </button>

              <button
                type="button"
                className={filtroStatus === "APROVADAS" ? "ativo" : ""}
                onClick={() => setFiltroStatus("APROVADAS")}
              >
                Aprovadas
              </button>

              <button
                type="button"
                className={filtroStatus === "CONCLUIDAS" ? "ativo" : ""}
                onClick={() => setFiltroStatus("CONCLUIDAS")}
              >
                Concluídas
              </button>

              <button
                type="button"
                className={filtroStatus === "RECUSADAS" ? "ativo" : ""}
                onClick={() => setFiltroStatus("RECUSADAS")}
              >
                Recusadas
              </button>
            </div>
          </div>

          <div className="admin-solicitacoes-lista">
            {carregando && (
              <div className="admin-solicitacoes-vazio">
                Carregando solicitações...
              </div>
            )}

            {!carregando && erro && (
              <div className="admin-solicitacoes-vazio">
                {erro}
              </div>
            )}

            {!carregando &&
              !erro &&
              solicitacoesFiltradas.length === 0 && (
                <div className="admin-solicitacoes-vazio">
                  Nenhuma solicitação encontrada.
                </div>
              )}

            {!carregando &&
              !erro &&
              solicitacoesFiltradas.map((item) => (
                <article
                  key={item.id}
                  className="admin-solicitacao-item"
                >
                  <div className="admin-solicitacao-principal">
                    <div className="admin-solicitacao-icon">🌱</div>

                    <div>
                      <span>Protocolo</span>
                      <h3>{item.protocolo || "Não informado"}</h3>
                      <p>
                        {item.nomeCompleto || "Usuário não informado"}
                      </p>
                    </div>
                  </div>

                  <div className="admin-solicitacao-dado">
                    <span>Bairro</span>
                    <strong>{item.bairro || "Não informado"}</strong>
                  </div>

                  <div className="admin-solicitacao-dado">
                    <span>Local</span>
                    <strong>{item.ruaAvenida || "Não informado"}</strong>
                  </div>

                  <div className="admin-solicitacao-dado">
                    <span>Data</span>
                    <strong>{formatarData(item.dataSolicitacao)}</strong>
                  </div>

                  <div className="admin-solicitacao-final">
                    <span
                      className={`admin-solicitacao-status ${classeStatus(
                        item.status
                      )}`}
                    >
                      {traduzirStatus(item.status)}
                    </span>

                    <Link
                      to={`/admin/solicitacoes/${item.id}`}
                      className="admin-solicitacao-visualizar"
                    >
                      Visualizar
                    </Link>
                  </div>
                </article>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default AdminSolicitacoes;
