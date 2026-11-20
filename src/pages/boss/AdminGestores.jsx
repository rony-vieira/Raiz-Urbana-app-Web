
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../../services/api";
import "./AdminGestores.css";

function AdminGestores() {
  const navigate = useNavigate();

  const [busca, setBusca] = useState("");
  const [gestores, setGestores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;

    async function carregarGestores() {
      try {
        setCarregando(true);
        setErro("");

        const token =
          sessionStorage.getItem("token") ||
          localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const resposta = await fetch(`${API_URL}/api/usuarios`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (resposta.status === 401) {
          sessionStorage.removeItem("usuarioLogado");
          localStorage.removeItem("usuarioLogado");
          sessionStorage.removeItem("token");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (resposta.status === 403) {
          throw new Error(
            "Você não possui permissão para visualizar os gestores."
          );
        }

        if (!resposta.ok) {
          throw new Error("Não foi possível carregar os gestores.");
        }

        const dados = await resposta.json();

        if (!ativo) return;

        const lista = Array.isArray(dados) ? dados : [];

        setGestores(
          lista.filter(
            (usuario) =>
              String(usuario.tipo || "").toUpperCase() === "GESTOR"
          )
        );
      } catch (error) {
        if (!ativo) return;

        console.error("Erro ao carregar gestores:", error);
        setErro(error.message || "Não foi possível carregar os gestores.");
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarGestores();

    return () => {
      ativo = false;
    };
  }, [navigate, tentativa]);

  const gestoresFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return gestores;

    return gestores.filter((gestor) => {
      const campos = [
        gestor.nomeCompleto,
        gestor.cpf,
        gestor.email,
        gestor.bairroAtuacao,
        gestor.telefone,
      ];

      return campos.some((campo) =>
        String(campo || "").toLowerCase().includes(termo)
      );
    });
  }, [busca, gestores]);

  return (
    <main className="admin-gestores-page">
      <div className="admin-gestores-container">
        <div className="admin-gestores-voltar">
          <Link to="/admin">← Voltar ao painel</Link>
        </div>

        <section className="admin-gestores-topo">
          <span className="admin-gestores-label">Administração</span>
          <h1>Gestores</h1>
          <p>
            Consulte os gestores cadastrados e acompanhe seus bairros de atuação.
          </p>
        </section>

        {carregando ? (
          <section className="admin-gestores-card">
            <div className="admin-gestores-mensagem">
              Carregando gestores...
            </div>
          </section>
        ) : erro ? (
          <section className="admin-gestores-card">
            <div className="admin-gestores-erro">
              <strong>Não foi possível carregar os gestores.</strong>
              <p>{erro}</p>
              <button
                type="button"
                onClick={() => setTentativa((atual) => atual + 1)}
              >
                Tentar novamente
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="admin-gestores-resumo">
              <div className="admin-gestores-resumo-card">
                <div className="admin-gestores-resumo-icon">🛡️</div>
                <div>
                  <strong>{gestores.length}</strong>
                  <span>Gestores cadastrados</span>
                </div>
              </div>
            </section>

            <section className="admin-gestores-card">
              <div className="admin-gestores-ferramentas">
                <div>
                  <h2>Gestores cadastrados</h2>
                  <p>Pesquise e consulte os dados dos gestores.</p>
                </div>

                <div className="admin-gestores-busca">
                  <label htmlFor="buscaGestor">Buscar gestor</label>
                  <input
                    id="buscaGestor"
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Nome, CPF, e-mail ou bairro"
                  />
                </div>
              </div>

              <div className="admin-gestores-lista">
                {gestoresFiltrados.length === 0 && (
                  <div className="admin-gestores-vazio">
                    {gestores.length === 0
                      ? "Nenhum gestor cadastrado."
                      : "Nenhum gestor encontrado para essa pesquisa."}
                  </div>
                )}

                {gestoresFiltrados.map((gestor) => (
                  <article
                    className="admin-gestor-item"
                    key={gestor.id}
                  >
                    <div className="admin-gestor-principal">
                      <div className="admin-gestor-avatar">🛡️</div>
                      <div>
                        <h3>
                          {gestor.nomeCompleto || "Nome não informado"}
                        </h3>
                        <p>{gestor.email || "E-mail não informado"}</p>
                      </div>
                    </div>

                    <div className="admin-gestor-dado">
                      <span>CPF</span>
                      <strong>{gestor.cpf || "Não informado"}</strong>
                    </div>

                    <div className="admin-gestor-dado">
                      <span>Telefone</span>
                      <strong>{gestor.telefone || "Não informado"}</strong>
                    </div>

                    <div className="admin-gestor-dado">
                      <span>Bairro de atuação</span>
                      <strong>
                        {gestor.bairroAtuacao || "Não informado"}
                      </strong>
                    </div>

                    <div className="admin-gestor-acoes">
                      <Link
                        to={`/admin/gestores/${gestor.id}`}
                        className="admin-gestor-visualizar"
                      >
                        Visualizar
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default AdminGestores;
