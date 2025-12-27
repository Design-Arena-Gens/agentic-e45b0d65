import { NextResponse } from "next/server";
import { generateEmailResponse, type EmailContext } from "@/lib/emailAgent";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Requête invalide : données manquantes." },
        { status: 400 }
      );
    }

    const {
      context,
      senderName,
      recipientName,
      subject,
      emailBody,
      desiredOutcome,
      additionalNotes,
      userSignature,
    } = body;

    if (typeof emailBody !== "string" || emailBody.trim().length < 10) {
      return NextResponse.json(
        { error: "Le contenu du mail doit comporter au moins 10 caractères." },
        { status: 400 }
      );
    }

    if (context !== "professionnel" && context !== "personnel") {
      return NextResponse.json(
        { error: "Le contexte doit être 'professionnel' ou 'personnel'." },
        { status: 400 }
      );
    }

    const response = generateEmailResponse({
      context: context as EmailContext,
      senderName: typeof senderName === "string" ? senderName : undefined,
      recipientName: typeof recipientName === "string" ? recipientName : undefined,
      subject: typeof subject === "string" ? subject : undefined,
      emailBody,
      desiredOutcome: typeof desiredOutcome === "string" ? desiredOutcome : undefined,
      additionalNotes: typeof additionalNotes === "string" ? additionalNotes : undefined,
      userSignature: typeof userSignature === "string" ? userSignature : undefined,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erreur lors de la génération du mail :", error);
    return NextResponse.json(
      {
        error: "Une erreur est survenue lors de la génération de la réponse. Merci de réessayer.",
      },
      { status: 500 }
    );
  }
}
