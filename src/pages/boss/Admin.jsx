
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Admin.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://raiz-urbana-back-end.onrender.com";

function Admin() {
  const navigate = useNavigate();

  const [solicitacoes, setSolicitacoes] = useState([]);
  const [totalGestores, setTotalGestores] = useState(0);
  const [carregandoSolicitacoes, setCarregandoSolicitacoes] =
    useState(true);
  const [carregandoGestores, setCarregandoGestores] = useState(true);

  const [propostas] = useState([
    {
      id: 1,
      empresa: "Empresa Exemplo",
      cnpj: "00.000.000/0001-00",
      tipo: "Apoio a ações ambientais",
      status: "PENDENTE",
    },
  ]);

  useEffect(() => {
    const token =
      sessionStorage.getItem("token") ||
      localStorage.getItem("token");

    if (!token) {
      setCarregandoSolicitacoes(false);
      setCarregandoGestores(false);
      return;
    }

    const carregarSolicitacoes = async () => {
      try {
        const resposta = await fetch(`${API_URL}/api/solicitacoes`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!resposta.ok) {
          throw new Error(
            `Erro ao buscar solicitações: ${resposta.status}`
          );
        }

        const dados = await resposta.json();
        setSolicitacoes(Array.isArray(dados) ? dados : []);
      } catch (error) {
        console.error("Erro ao carregar solicitações:", error);
      } finally {
        setCarregandoSolicitacoes(false);
      }
    };

    const carregarGestores = async () => {
      try {
        const resposta = await fetch(`${API_URL}/api/usuarios`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!resposta.ok) {
          throw new Error(
            `Erro ao buscar usuários: ${resposta.status}`
          );
        }

        const dados = await resposta.json();

        const usuarios = Array.isArray(dados) ? dados : [];

        const gestores = usuarios.filter(
          (usuario) =>
            String(usuario.tipo || "").toUpperCase() === "GESTOR"
        );

        setTotalGestores(gestores.length);
      } catch (error) {
        console.error("Erro ao carregar gestores:", error);
      } finally {
        setCarregandoGestores(false);
      }
    };

    carregarSolicitacoes();
    carregarGestores();
  }, []);

  const sairDaConta = () => {
    sessionStorage.removeItem("usuarioLogado");
    localStorage.removeItem("usuarioLogado");
    sessionStorage.removeItem("token");
    localStorage.removeItem("token");

    window.dispatchEvent(new Event("usuarioLogadoAtualizado"));

    navigate("/login");
  };

  return (
    <main className="admin-page">
      <div className="admin-container">
        <section className="admin-topo">
          <div>
            <span className="admin-label">
              Administração
            </span>

            <h1>Painel BOSS</h1>

            <p>
              Gerencie o Raiz Urbana e acompanhe as principais
              atividades da plataforma.
            </p>
          </div>

          <button
            type="button"
            className="admin-sair"
            onClick={sairDaConta}
          >
            Sair da conta
          </button>
        </section>

        <section className="admin-resumo">
          <div className="admin-resumo-card">
            <div className="admin-resumo-icon">
              🌱
            </div>

            <div>
              <strong>
                {carregandoSolicitacoes ? "..." : solicitacoes.length}
              </strong>
              <span>Solicitações</span>
            </div>
          </div>

          <div className="admin-resumo-card">
            <div className="admin-resumo-icon">
              🔎
            </div>

            <div>
              <strong>{propostas.length}</strong>
              <span>Propostas pendentes</span>
            </div>
          </div>

          <div className="admin-resumo-card">
            <div className="admin-resumo-icon">
              👤
            </div>

            <div>
              <strong>
                {carregandoGestores ? "..." : totalGestores}
              </strong>
              <span>Gestores</span>
            </div>
          </div>

          <div className="admin-resumo-card">
            <div className="admin-resumo-icon">
              🤝
            </div>

            <div>
              <strong>0</strong>
              <span>Empresas parceiras</span>
            </div>
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-header">
            <div>
              <span className="admin-section-label">
                Administração
              </span>

              <h2>Gerenciamento</h2>
            </div>
          </div>

          <div className="admin-menu">
            <Link
              to="/admin/solicitacoes"
              className="admin-menu-card"
            >
              <div className="admin-menu-icon">🌳</div>

              <div>
                <h3>Solicitações de plantio</h3>
                <p>
                  Visualize solicitações de todos os bairros.
                </p>
              </div>

              <span className="admin-menu-seta">→</span>
            </Link>

            <Link
              to="/admin/propostas"
              className="admin-menu-card"
            >
              <div className="admin-menu-icon">🤝</div>

              <div>
                <h3>Propostas de parceria</h3>
                <p>
                  Analise propostas enviadas pelas empresas.
                </p>
              </div>

              <span className="admin-menu-seta">→</span>
            </Link>

            <Link
              to="/admin/usuarios"
              className="admin-menu-card"
            >
              <div className="admin-menu-icon">👥</div>

              <div>
                <h3>Usuários</h3>
                <p>
                  Consulte os usuários cadastrados na plataforma.
                </p>
              </div>

              <span className="admin-menu-seta">→</span>
            </Link>

            <Link
              to="/admin/gestores"
              className="admin-menu-card"
            >
              <div className="admin-menu-icon">🏢</div>

              <div>
                <h3>Gestores</h3>
                <p>
                  Gerencie gestores e seus bairros de atuação.
                </p>
              </div>

              <span className="admin-menu-seta">→</span>
            </Link>

            <Link
              to="/admin/parceiros"
              className="admin-menu-card"
            >
              <div className="admin-menu-icon">🏪</div>

              <div>
                <h3>Empresas parceiras</h3>
                <p>
                  Consulte e gerencie empresas aprovadas.
                </p>
              </div>

              <span className="admin-menu-seta">→</span>
            </Link>

            <Link
              to="/admin/bairros"
              className="admin-menu-card"
            >
              <div className="admin-menu-icon">📍</div>

              <div>
                <h3>Bairros</h3>
                <p>
                  Acompanhe a distribuição dos gestores por bairro.
                </p>
              </div>

              <span className="admin-menu-seta">→</span>
            </Link>
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-header">
            <div>
              <span className="admin-section-label">
                Empresas
              </span>

              <h2>Propostas recentes</h2>
            </div>

            <Link
              to="/admin/propostas"
              className="admin-ver-todas"
            >
              Ver todas →
            </Link>
          </div>

          <div className="admin-propostas">
            {propostas.length === 0 && (
              <div className="admin-vazio">
                Nenhuma proposta aguardando análise.
              </div>
            )}

            {propostas.map((proposta) => (
              <div
                key={proposta.id}
                className="admin-proposta-item"
              >
                <div className="admin-proposta-info">
                  <div className="admin-proposta-icone">
                    🏢
                  </div>

                  <div>
                    <h3>{proposta.empresa}</h3>
                    <p>{proposta.cnpj}</p>
                    <span>{proposta.tipo}</span>
                  </div>
                </div>

                <div className="admin-proposta-acoes">
                  <span className="admin-status-pendente">
                    Aguardando análise
                  </span>

                  <Link
                    to={`/admin/propostas/${proposta.id}`}
                    className="admin-analisar"
                  >
                    Analisar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Admin;
