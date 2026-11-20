
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API_URL from "../../services/api";
import "./AdminGestorDetalhes.css";

function AdminGestorDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [gestor, setGestor] = useState(null);
  const [usuarioAtualId, setUsuarioAtualId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const encerrarSessao = () => {
    sessionStorage.removeItem("usuarioLogado");
    localStorage.removeItem("usuarioLogado");
    sessionStorage.removeItem("token");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const carregarGestor = useCallback(async () => {
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

      const respostaUsuario = await fetch(`${API_URL}/api/usuarios/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (respostaUsuario.status === 401) {
        encerrarSessao();
        return;
      }

      if (!respostaUsuario.ok) {
        throw new Error("Não foi possível validar a conta autenticada.");
      }

      const usuarioAtual = await respostaUsuario.json();
      setUsuarioAtualId(usuarioAtual.id);

      const resposta = await fetch(`${API_URL}/api/usuarios/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (resposta.status === 401) {
        encerrarSessao();
        return;
      }

      if (resposta.status === 403) {
        throw new Error(
          "Você não possui permissão para consultar este gestor."
        );
      }

      if (resposta.status === 404) {
        throw new Error("Gestor não encontrado.");
      }

      if (!resposta.ok) {
        throw new Error("Não foi possível carregar os dados do gestor.");
      }

      const dados = await resposta.json();

      if (String(dados.tipo || "").toUpperCase() !== "GESTOR") {
        throw new Error("Esta conta não está cadastrada como gestor.");
      }

      setGestor(dados);
    } catch (error) {
      console.error("Erro ao carregar gestor:", error);
      setErro(error.message || "Não foi possível carregar o gestor.");
    } finally {
      setCarregando(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    carregarGestor();
  }, [carregarGestor]);

  const removerGestor = async () => {
    if (String(usuarioAtualId) === String(id)) {
      setErro("Você não pode remover seus próprios privilégios nesta tela.");
      return;
    }

    const confirmar = window.confirm(
      "Deseja realmente remover os privilégios de gestor desta conta? Ela voltará a ser um usuário comum."
    );

    if (!confirmar) return;

    try {
      setSalvando(true);
      setErro("");

      const token =
        sessionStorage.getItem("token") ||
        localStorage.getItem("token");

      if (!token) {
        encerrarSessao();
        return;
      }

      const resposta = await fetch(
        `${API_URL}/api/usuarios/${id}/usuario`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (resposta.status === 401) {
        encerrarSessao();
        return;
      }

      if (resposta.status === 403) {
        throw new Error(
          "Você não possui permissão para realizar esta alteração."
        );
      }

      if (!resposta.ok) {
        let mensagem = "Não foi possível remover o gestor.";

        try {
          const dados = await resposta.json();
          mensagem = dados.message || dados.mensagem || mensagem;
        } catch {
          mensagem = "Não foi possível remover o gestor.";
        }

        throw new Error(mensagem);
      }

      navigate("/admin/gestores");
    } catch (error) {
      console.error("Erro ao remover gestor:", error);
      setErro(error.message || "Não foi possível remover o gestor.");
    } finally {
      setSalvando(false);
    }
  };

  const formatarData = (data) => {
    if (!data) return "Não informada";

    const dataValida = new Date(data);

    if (Number.isNaN(dataValida.getTime())) {
      return "Não informada";
    }

    return dataValida.toLocaleDateString("pt-BR");
  };

  if (carregando) {
    return (
      <main className="admin-gestor-detalhes-page">
        <div className="admin-gestor-detalhes-container">
          <p className="admin-gestor-detalhes-mensagem">
            Carregando dados do gestor...
          </p>
        </div>
      </main>
    );
  }

  if (erro && !gestor) {
    return (
      <main className="admin-gestor-detalhes-page">
        <div className="admin-gestor-detalhes-container">
          <div className="admin-gestor-detalhes-voltar">
            <Link to="/admin/gestores">← Voltar aos gestores</Link>
          </div>

          <div className="admin-gestor-detalhes-erro">
            {erro}
          </div>
        </div>
      </main>
    );
  }

  if (!gestor) return null;

  const proprioUsuario =
    String(usuarioAtualId) === String(gestor.id);

  return (
    <main className="admin-gestor-detalhes-page">
      <div className="admin-gestor-detalhes-container">
        <div className="admin-gestor-detalhes-voltar">
          <Link to="/admin/gestores">← Voltar aos gestores</Link>
        </div>

        <section className="admin-gestor-detalhes-topo">
          <span>Administração</span>
          <h1>Detalhes do gestor</h1>
          <p>Consulte as informações da conta e sua área de atuação.</p>
        </section>

        {erro && (
          <div className="admin-gestor-detalhes-erro">
            {erro}
          </div>
        )}

        <section className="admin-gestor-detalhes-card">
          <div className="admin-gestor-detalhes-identificacao">
            <div className="admin-gestor-detalhes-avatar">🛡️</div>
            <div>
              <h2>{gestor.nomeCompleto || "Nome não informado"}</h2>
              <span className="admin-gestor-detalhes-tipo">Gestor</span>
            </div>
          </div>

          <div className="admin-gestor-detalhes-grade">
            <div>
              <span>CPF</span>
              <strong>{gestor.cpf || "Não informado"}</strong>
            </div>

            <div>
              <span>E-mail</span>
              <strong>{gestor.email || "Não informado"}</strong>
            </div>

            <div>
              <span>Telefone</span>
              <strong>{gestor.telefone || "Não informado"}</strong>
            </div>

            <div>
              <span>Bairro de atuação</span>
              <strong>{gestor.bairroAtuacao || "Não informado"}</strong>
            </div>

            <div>
              <span>CEP</span>
              <strong>{gestor.cep || "Não informado"}</strong>
            </div>

            <div>
              <span>Rua</span>
              <strong>{gestor.rua || "Não informado"}</strong>
            </div>

            <div>
              <span>Número</span>
              <strong>{gestor.numero || "Não informado"}</strong>
            </div>

            <div>
              <span>Bairro do endereço</span>
              <strong>{gestor.bairro || "Não informado"}</strong>
            </div>

            <div>
              <span>Cidade</span>
              <strong>{gestor.cidade || "Não informada"}</strong>
            </div>

            <div>
              <span>Estado</span>
              <strong>{gestor.estado || "Não informado"}</strong>
            </div>

            <div>
              <span>Cadastro realizado em</span>
              <strong>{formatarData(gestor.createdAt)}</strong>
            </div>
          </div>

          <div className="admin-gestor-detalhes-acoes">
            <button
              type="button"
              className="admin-gestor-detalhes-remover"
              onClick={removerGestor}
              disabled={salvando || proprioUsuario}
              title={
                proprioUsuario
                  ? "Não é possível remover os próprios privilégios."
                  : ""
              }
            >
              {salvando
                ? "Processando..."
                : proprioUsuario
                  ? "Sua própria conta"
                  : "Remover privilégios de gestor"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AdminGestorDetalhes;
