
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API_URL from "../services/api";
import "./RedefinirSenha.css";

function RedefinirSenha() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMensagem("");
    setErro(false);

    if (!token) {
      setErro(true);
      setMensagem("Link de recuperação inválido ou incompleto.");
      return;
    }

    if (novaSenha.length < 8) {
      setErro(true);
      setMensagem("A senha deve possuir pelo menos 8 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro(true);
      setMensagem("As senhas não coincidem.");
      return;
    }

    try {
      setCarregando(true);

      const response = await fetch(
        `${API_URL}/api/auth/redefinir-senha`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            novaSenha,
          }),
        }
      );

      let resposta = null;

      try {
        resposta = await response.json();
      } catch {
        resposta = null;
      }

      if (!response.ok) {
        throw new Error(
          resposta?.message ||
          resposta?.mensagem ||
          "Não foi possível redefinir sua senha. O link pode ter expirado."
        );
      }

      setSucesso(true);
      setMensagem(
        resposta?.mensagem || "Senha redefinida com sucesso!"
      );

      setNovaSenha("");
      setConfirmarSenha("");
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);

      setErro(true);
      setMensagem(
        error.message ||
        "Não foi possível conectar ao servidor."
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className="redefinir-page">
      <div className="redefinir-container">
        <div className="redefinir-card">
          <div className="redefinir-icon">
            🔑
          </div>

          <span className="redefinir-label">
            Segurança da conta
          </span>

          <h1>Nova senha</h1>

          <p className="redefinir-descricao">
            Cadastre uma nova senha para acessar sua conta do Raiz Urbana.
          </p>

          {!sucesso ? (
            <form
              className="redefinir-form"
              onSubmit={handleSubmit}
            >
              <div className="redefinir-field">
                <label htmlFor="novaSenha">
                  Nova senha
                </label>

                <input
                  type="password"
                  id="novaSenha"
                  placeholder="Digite sua nova senha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  minLength={8}
                  autoComplete="new-password"
                  required
                  disabled={carregando || !token}
                />
              </div>

              <div className="redefinir-field">
                <label htmlFor="confirmarSenha">
                  Confirmar nova senha
                </label>

                <input
                  type="password"
                  id="confirmarSenha"
                  placeholder="Digite novamente sua senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={carregando || !token}
                />
              </div>

              {mensagem && (
                <p
                  className={`redefinir-feedback ${erro ? "erro" : "sucesso"}`}
                  role="status"
                >
                  {mensagem}
                </p>
              )}

              <button
                type="submit"
                className="redefinir-submit"
                disabled={carregando || !token}
              >
                {carregando
                  ? "Salvando..."
                  : "Redefinir senha"}
              </button>
            </form>
          ) : (
            <p className="redefinir-feedback sucesso" role="status">
              {mensagem}
            </p>
          )}

          {!token && (
            <p className="redefinir-feedback erro" role="alert">
              Link de recuperação inválido ou incompleto. Solicite um novo link.
            </p>
          )}

          <div className="redefinir-voltar">
            <Link to="/login">
              ← Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default RedefinirSenha;
