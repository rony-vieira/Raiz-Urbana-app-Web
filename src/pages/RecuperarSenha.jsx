
import { useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../services/api";
import "./RecuperarSenha.css";

function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setErro(true);
      setMensagem("Informe seu e-mail.");
      return;
    }

    try {
      setCarregando(true);
      setMensagem("");
      setErro(false);

      const response = await fetch(
        `${API_URL}/api/auth/recuperar-senha`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
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
          "Não foi possível solicitar a recuperação."
        );
      }

      setMensagem(
        resposta?.mensagem ||
        "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha."
      );

      setEmail("");
    } catch (error) {
      console.error("Erro ao solicitar recuperação:", error);

      setErro(true);
      setMensagem(
        error.message ||
        "Não foi possível conectar ao servidor. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className="recuperar-page">
      <div className="recuperar-container">
        <div className="recuperar-card">
          <div className="recuperar-icon">
            🔐
          </div>

          <span className="recuperar-label">
            Recuperação de acesso
          </span>

          <h1>Esqueceu sua senha?</h1>

          <p className="recuperar-descricao">
            Informe o e-mail cadastrado na sua conta para receber
            as instruções de recuperação de senha.
          </p>

          <form
            className="recuperar-form"
            onSubmit={handleSubmit}
          >
            <div className="recuperar-field">
              <label htmlFor="email">
                E-mail
              </label>

              <input
                type="email"
                id="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={carregando}
              />
            </div>

            {mensagem && (
              <p
                className={`recuperar-feedback ${erro ? "erro" : "sucesso"}`}
                role="status"
              >
                {mensagem}
              </p>
            )}

            <button
              type="submit"
              className="recuperar-submit"
              disabled={carregando}
            >
              {carregando
                ? "Enviando..."
                : "Enviar instruções"}
            </button>
          </form>

          <div className="recuperar-voltar">
            <Link to="/login">
              ← Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default RecuperarSenha;
