import { Response } from "express";
import { prisma } from "../../shared/prisma";
import { AuthenticatedRequest } from "../../shared/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiKey = process.env.GEMINI_API_KEY;
let ai: any = null;
if (geminiKey) {
  try {
    ai = new GoogleGenerativeAI(geminiKey);
  } catch (err) {
    console.error("Gemini failed in chat controller setup:", err);
  }
}

export async function listSessions(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ error: "User context missing" });

    const sessions = await prisma.aIChatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return res.json(sessions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createSession(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ error: "User context missing" });

    const { title } = req.body;

    const session = await prisma.aIChatSession.create({
      data: {
        userId,
        title: title || "Nova conversa com Assistente IA",
      },
    });

    return res.status(201).json(session);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getSession(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ error: "User context missing" });

    const { sessionId } = req.params;

    const session = await prisma.aIChatSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: "Chat session not found" });
    }

    return res.json(session);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function sendMessage(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ error: "User context missing" });

    const { sessionId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    // Verify session
    const session = await prisma.aIChatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      return res.status(404).json({ error: "Chat session not found" });
    }

    // Save user message
    const userMessage = await prisma.aIChatMessage.create({
      data: {
        sessionId,
        role: "user",
        content,
      },
    });

    // Get previous messages to feed context to AI
    const previousMessages = await prisma.aIChatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });

    let assistantResponse = "";

    if (ai) {
      try {
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Build chat history prompt
        let prompt = "Você é um assistente técnico especialista em mecânica automotiva que ajuda mecânicos em oficinas.\n";
        prompt += "Dê respostas técnicas precisas, detalhadas e úteis em português brasileiro.\n\nHistórico da conversa:\n";
        
        for (const msg of previousMessages) {
          const roleLabel = msg.role === "user" ? "Mecânico" : "Assistente";
          prompt += `${roleLabel}: ${msg.content}\n`;
        }
        
        prompt += "Assistente:";

        const result = await model.generateContent({ contents: [{ parts: [{ text: prompt }] }] });
        assistantResponse = result.response.text();
      } catch (geminiError) {
        console.error("Gemini Chat failed, using mock:", geminiError);
        assistantResponse = getMockChatResponse(content);
      }
    } else {
      assistantResponse = getMockChatResponse(content);
    }

    // Save AI response
    const aiMessage = await prisma.aIChatMessage.create({
      data: {
        sessionId,
        role: "model",
        content: assistantResponse,
      },
    });

    // Update session timestamp
    await prisma.aIChatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return res.status(201).json({
      userMessage,
      aiMessage,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// Simple rule-based chatbot for Brazilian mechanics when API key is not active
function getMockChatResponse(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes("torque") || msg.includes("apertar") || msg.includes("libras") || msg.includes("cabeçote")) {
    return `### Especificações Técnicas de Torque (Sugestão Geral)

Para a montagem de motores, os valores de torque de aperto dependem diretamente do motor e fabricante. Aqui está um exemplo padrão de torque para parafusos de cabeçote do **Motor VW EA111 (1.0/1.6)**:

1. **Etapa 1:** 30 Nm (Newton-metros)
2. **Etapa 2:** 50 Nm
3. **Etapa 3:** Angular de 90°
4. **Etapa 4:** Angular de mais 90°

**Dica do Assistente:** Sempre use parafusos de cabeçote novos e lubrifique levemente a rosca. Certifique-se de realizar o aperto na ordem correta (esquema em espiral do centro para as extremidades) para evitar empenamento da peça.`;
  }

  if (msg.includes("lenta") || msg.includes("oscilando") || msg.includes("morrendo") || msg.includes("falhando")) {
    return `### Diagnóstico: Motor com Marcha Lenta Oscilando

Quando a marcha lenta está instável, os principais componentes a serem checados são:

1. **Corpo de Borboleta (TBI):** Sujeira acumulada impede a passagem adequada de ar no repouso da borboleta. Realize a limpeza química com descarbonizante (Car 80) e faça o aprendizado/reset dos parâmetros adaptativos via scanner.
2. **Sensor MAP (Pressão Absoluta):** Leituras incorretas de vácuo do coletor alteram o cálculo de mistura.
3. **Entrada de Ar Falsa:** Verifique rachaduras nas mangueiras de admissão ou falha nos anéis de vedação dos bicos injetores e do coletor.
4. **Sensor de Temperatura do Motor (ECT):** Se o sensor marcar menos que a temperatura real, a injeção injetará excesso de combustível (carro afogado).`;
  }

  if (msg.includes("injeção") || msg.includes("luz") || msg.includes("obd") || msg.includes("scanner")) {
    return `### Protocolo de Diagnóstico de Injeção Eletrônica

Se a luz da injeção no painel está acesa, siga este fluxo de diagnóstico profissional:

1. **Leitura de Código de Falhas (DTC):** Conecte o Scanner OBD2 e verifique o código ativo (ex: *P0300 - Falha de Ignição Múltipla* ou *P0130 - Sensor de Oxigênio*).
2. **Análise Gráfica dos Sensores:** Monitore a voltagem da Sonda Lambda (deve oscilar rapidamente entre 100mV e 900mV em marcha lenta com o motor aquecido).
3. **Pressão da Linha de Combustível:** Utilize um manômetro na linha de combustível. A pressão deve estar geralmente entre 3.0 e 4.2 Bar (dependendo do modelo de injeção direta/indireta).`;
  }

  if (msg.includes("óleo") || msg.includes("viscosidade") || msg.includes("filtro") || msg.includes("troca")) {
    return `### Guia Rápido de Lubrificação Automotiva

A escolha do lubrificante deve sempre seguir o manual da montadora do carro. Seguem as viscosidades recomendadas para os motores mais comuns no mercado nacional:

*   **Chevrolet Flexpower (1.0/1.4/1.8):** Geralmente usa **5W30 Sintético** (API SN ou superior).
*   **Ford Sigma / Duratec:** **5W30** com homologação Ford (WSS-M2C913-C).
*   **Volkswagen MSI / TSI:** **5W40** (especificação VW 508.88 ou VW 502.00).

**Importante:** Nunca misture óleo mineral com sintético. A troca do filtro de óleo deve ser feita **em todas as trocas de óleo** para não contaminar a carga de lubrificante novo.`;
  }

  return `Olá! Sou o assistente de IA da **OficinaAI**. 

Posso te ajudar com esquemas elétricos, torque de cabeçote, tabelas de lubrificantes, diagnósticos de injeção eletrônica e barulhos na suspensão. 

**Como posso auxiliar no diagnóstico técnico ou reparo que você está realizando agora?**`;
}
