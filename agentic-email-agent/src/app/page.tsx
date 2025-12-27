'use client';

import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState } from "react";

type EmailContext = "professionnel" | "personnel";

interface FormData {
  context: EmailContext;
  senderName: string;
  recipientName: string;
  subject: string;
  emailBody: string;
  desiredOutcome: string;
  additionalNotes: string;
  userSignature: string;
}

interface GeneratedEmail {
  reply: string;
  subjectSuggestion: string;
  analysis: {
    sentiment: "positif" | "neutre" | "préoccupé";
    sentimentScore: number;
    keywords: string[];
    questions: string[];
    urgency: "élevée" | "modérée" | "faible";
  };
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    context: "professionnel",
    senderName: "",
    recipientName: "",
    subject: "",
    emailBody: "",
    desiredOutcome: "",
    additionalNotes: "",
    userSignature: "",
  });

  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const disableSubmit = useMemo(() => {
    return formData.emailBody.trim().length < 10 || loading;
  }, [formData.emailBody, loading]);

  const handleChange =
    (field: keyof FormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setGeneratedEmail(null);
    setLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Erreur inconnue");
      }

      const data = (await response.json()) as GeneratedEmail;
      setGeneratedEmail(data);
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Impossible de générer la réponse pour le moment.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedEmail) return;
    try {
      await navigator.clipboard.writeText(generatedEmail.reply);
      setFeedback({ type: "success", message: "Réponse copiée dans le presse-papiers." });
      setTimeout(() => setFeedback(null), 2000);
    } catch {
      setFeedback({
        type: "error",
        message: "Impossible de copier la réponse, merci de copier manuellement.",
      });
    }
  };

  return (
    <main className="page">
      <section className="hero">
        <div>
          <h1>Assistant de réponses e-mail bienveillantes</h1>
          <p>
            Saisissez un message reçu et obtenez une réponse équilibrée et intelligente,
            adaptée à vos échanges professionnels ou personnels.
          </p>
        </div>
      </section>

      <div className="layout">
        <form className="panel" onSubmit={handleSubmit}>
          <h2>Configurer la réponse</h2>

          <div className="field">
            <label htmlFor="context">Contexte du mail</label>
            <select id="context" value={formData.context} onChange={handleChange("context")}>
              <option value="professionnel">Professionnel</option>
              <option value="personnel">Personnel</option>
            </select>
          </div>

          <div className="grid">
            <div className="field">
              <label htmlFor="senderName">Nom de l&apos;expéditeur</label>
              <input
                id="senderName"
                type="text"
                value={formData.senderName}
                onChange={handleChange("senderName")}
                placeholder="Ex. Marie Dupont"
              />
            </div>
            <div className="field">
              <label htmlFor="recipientName">À qui répondez-vous ?</label>
              <input
                id="recipientName"
                type="text"
                value={formData.recipientName}
                onChange={handleChange("recipientName")}
                placeholder="Ex. Paul"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="subject">Sujet d&apos;origine (optionnel)</label>
            <input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={handleChange("subject")}
              placeholder="Sujet du mail reçu"
            />
          </div>

          <div className="field">
            <label htmlFor="emailBody">Contenu du message reçu</label>
            <textarea
              id="emailBody"
              value={formData.emailBody}
              onChange={handleChange("emailBody")}
              placeholder="Collez ici le message que vous avez reçu..."
              rows={10}
              required
            />
            <small>
              Ajoutez autant de contexte que nécessaire, au moins 10 caractères sont requis.
            </small>
          </div>

          <div className="field">
            <label htmlFor="desiredOutcome">Résultat souhaité (optionnel)</label>
            <input
              id="desiredOutcome"
              type="text"
              value={formData.desiredOutcome}
              onChange={handleChange("desiredOutcome")}
              placeholder="Ex. proposer un rendez-vous la semaine prochaine"
            />
          </div>

          <div className="field">
            <label htmlFor="additionalNotes">Notes internes (optionnel)</label>
            <input
              id="additionalNotes"
              type="text"
              value={formData.additionalNotes}
              onChange={handleChange("additionalNotes")}
              placeholder="Ex. rappeler que le dossier avance"
            />
          </div>

          <div className="field">
            <label htmlFor="userSignature">Signature (optionnel)</label>
            <input
              id="userSignature"
              type="text"
              value={formData.userSignature}
              onChange={handleChange("userSignature")}
              placeholder="Ex. Bien cordialement, Jean"
            />
          </div>

          <button type="submit" disabled={disableSubmit}>
            {loading ? "Génération en cours..." : "Générer la réponse"}
          </button>

          {feedback && (
            <p className={`feedback ${feedback.type === "success" ? "ok" : "ko"}`}>
              {feedback.message}
            </p>
          )}
        </form>

        <aside className="panel preview">
          <h2>Réponse proposée</h2>
          {generatedEmail ? (
            <>
              <div className="subject">
                <span>Sujet suggéré</span>
                <strong>{generatedEmail.subjectSuggestion}</strong>
              </div>

              <div className="analysis">
                <div>
                  <span>Sentiment</span>
                  <strong>{generatedEmail.analysis.sentiment}</strong>
                </div>
                <div>
                  <span>Urgence perçue</span>
                  <strong>{generatedEmail.analysis.urgency}</strong>
                </div>
                <div>
                  <span>Score</span>
                  <strong>{generatedEmail.analysis.sentimentScore}</strong>
                </div>
              </div>

              {generatedEmail.analysis.keywords.length > 0 && (
                <div className="tokens">
                  {generatedEmail.analysis.keywords.map((keyword) => (
                    <span key={keyword} className="token">
                      {keyword}
                    </span>
                  ))}
                </div>
              )}

              <textarea readOnly value={generatedEmail.reply} rows={18} />

              <button type="button" onClick={handleCopy} className="secondary">
                Copier la réponse
              </button>

              {generatedEmail.analysis.questions.length > 0 && (
                <div className="questions">
                  <h3>Questions détectées</h3>
                  <ul>
                    {generatedEmail.analysis.questions.map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="placeholder">
              La réponse s&apos;affichera ici après la génération. Fournissez le message reçu pour
              lancer l&apos;analyse.
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
