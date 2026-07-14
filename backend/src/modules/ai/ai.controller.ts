import { Response } from "express";
import { prisma } from "../../shared/prisma";
import { AuthenticatedRequest } from "../../shared/auth";
import { getGeminiModel } from "../../shared/ai";

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

    const model = getGeminiModel();

    if (model) {
      try {
        // Build chat history prompt
        let prompt = "Você é um assistente técnico especialista em mecânica automotiva que ajuda mecânicos em oficinas.\n";
        prompt += "Dê respostas técnicas precisas, detalhadas e úteis em português brasileiro.\n\nHistórico da conversa:\n";
        
        for (const msg of previousMessages) {
          const roleLabel = msg.role === "user" ? "Mecânico" : "Assistente";
          prompt += `${roleLabel}: ${msg.content}\n`;
        }
        
        prompt += "Assistente:";

        const result = await model.generateContent(prompt);
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

export async function findParts(req: AuthenticatedRequest, res: Response) {
  try {
    const { vehicleBrand, vehicleModel, vehicleYear, engineInfo, serviceDescription } = req.body;

    if (!vehicleBrand || !vehicleModel || !vehicleYear || !serviceDescription) {
      return res.status(400).json({ error: "Faltam informações obrigatórias do veículo ou serviço." });
    }

    const vehicleInfo = `${vehicleBrand} ${vehicleModel} (${vehicleYear}) ${engineInfo || ""}`.trim();
    let responseText = "";

    const model = getGeminiModel();

    if (model) {
      try {
        const prompt = `Você é um consultor de peças automotivas especialista no mercado brasileiro.

O mecânico precisa saber quais peças são necessárias para o seguinte serviço:

Veículo: ${vehicleBrand} ${vehicleModel} (${vehicleYear})
Motor: ${engineInfo || "não informado"}
Serviço desejado: ${serviceDescription}

Responda em português brasileiro de forma muito clara e estruturada com:
### Peças Necessárias
Liste cada peça com:
- Nome comercial exato da peça
- Marcas recomendadas (ex: Bosch, Cofap, Monroe, Nakata, Sabó, Gates, Contitech)
- Faixa de preço aproximada no mercado brasileiro (2024-2026)
- Quantidade recomendada

### Ferramentas Especiais
Liste ferramentas especiais de sincronismo ou montagem necessárias (se houver).

### Tempo Estimado de Mão de Obra
Dê uma estimativa realista em horas.

### Dicas Técnicas de Montagem
Cuidados e torques específicos de montagem importantes para o veículo.`;

        const result = await model.generateContent(prompt);
        responseText = result.response.text();
      } catch (geminiError) {
        console.error("Gemini Parts Finder failed, using mock:", geminiError);
        responseText = getMockPartsResponse(vehicleInfo, serviceDescription);
      }
    } else {
      responseText = getMockPartsResponse(vehicleInfo, serviceDescription);
    }

    return res.json({ result: responseText });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

function getMockPartsResponse(vehicleInfo: string, serviceDescription: string): string {
  const desc = serviceDescription.toLowerCase();

  if (desc.includes("correia") || desc.includes("dentada") || desc.includes("sincronismo")) {
    return `### Peças Necessárias para Troca de Correia em **${vehicleInfo}**

*   **Kit de Correia Dentada e Tensor**
    *   *Marcas recomendadas:* Gates, Contitech, Dayco
    *   *Preço aproximado:* R$ 180,00 - R$ 350,00
    *   *Quantidade:* 1 Kit
*   **Correia de Acessórios (Alternador/Direção)**
    *   *Marcas recomendadas:* Gates, Contitech
    *   *Preço aproximado:* R$ 45,00 - R$ 90,00
    *   *Quantidade:* 1 unidade
*   **Bomba d'Água** (Recomendável trocar junto em motores como EA111/EA211/Ecotec)
    *   *Marcas recomendadas:* Urba, Schadek, Indisa
    *   *Preço aproximado:* R$ 120,00 - R$ 250,00
    *   *Quantidade:* 1 unidade
*   **Aditivo de Radiador Concentrado** (Fluido novo após desmontagem)
    *   *Marcas recomendadas:* Paraflu, Tirreno, Radiex
    *   *Preço aproximado:* R$ 30,00 (cada litro)
    *   *Quantidade:* 2 a 3 litros

### Ferramentas Especiais
*   Ferramenta de travamento/sincronismo dos comandos de válvula do motor correspondente (necessário pino de fase ou régua de sincronismo).

### Tempo Estimado de Mão de Obra
*   **2.5 a 4.0 horas**, dependendo do acesso e espaço no cofre do motor.

### Dicas Técnicas de Montagem
1.  **Limpeza absoluta:** Remova resíduos de poeira ou vazamentos de óleo nos retentores antes de instalar a nova correia. O óleo destrói a borracha rapidamente.
2.  **Tensionamento correto:** Siga a marcação do tensor automático para não deixar a correia nem frouxa (risco de pular dente) nem esticada demais (causa zunido e desgaste precoce dos rolamentos).
3.  **Giro manual:** Após tensionar, dê duas voltas completas no virabrequim manualmente para confirmar se o sincronismo está perfeito e não há contato de válvulas com pistões.`;
  }

  if (desc.includes("embreagem") || desc.includes("platô") || desc.includes("disco")) {
    return `### Peças Necessárias para Troca de Embreagem em **${vehicleInfo}**

*   **Kit de Embreagem Completo (Platô, Disco e Rolamento/Atuador)**
    *   *Marcas recomendadas:* LUK, Sachs, Valeo
    *   *Preço aproximado:* R$ 450,00 - R$ 950,00 (variando se usa atuador hidráulico integrado)
    *   *Quantidade:* 1 Kit
*   **Atuador Hidráulico de Embreagem** (Se externo/não incluso no kit)
    *   *Marcas recomendadas:* TRW, FTE, LUK
    *   *Preço aproximado:* R$ 150,00 - R$ 300,00
    *   *Quantidade:* 1 unidade
*   **Óleo de Câmbio Manual** (Recomendado completar ou substituir o óleo antigo escoado)
    *   *Marcas recomendadas:* Petronas Tutela, Motul, Original Montadora
    *   *Preço aproximado:* R$ 60,00 - R$ 120,00 por litro
    *   *Quantidade:* 2 Litros

### Ferramentas Especiais
*   Centralizador de disco de embreagem.
*   Cavalete ou suporte de apoio para sustentação do motor.

### Tempo Estimado de Mão de Obra
*   **3.5 a 5.0 horas** (requer remoção total do quadro de suspensão em alguns veículos).

### Dicas Técnicas de Montagem
1.  **Retentores:** Inspecione o retentor do volante do motor (virabrequim traseiro) e o retentor do eixo piloto do câmbio. Se houver melado de óleo, troque-os agora para não contaminar a embreagem nova.
2.  **Retífica do Volante:** Sempre passe uma lixa grossa ou mande o volante para retífica para remover áreas espelhadas e garantir perfeito acoplamento da embreagem, evitando trepidações.
3.  **Sangria:** Se o atuador for hidráulico, faça a sangria completa do sistema de embreagem usando fluido DOT 4 novo até retirar todo o ar.`;
  }

  if (desc.includes("freio") || desc.includes("disco") || desc.includes("pastilha")) {
    return `### Peças Necessárias para Revisão de Freio em **${vehicleInfo}**

*   **Pastilhas de Freio Dianteiras**
    *   *Marcas recomendadas:* Cobreq, Fras-le, Jurid, Bosch
    *   *Preço aproximado:* R$ 90,00 - R$ 180,00
    *   *Quantidade:* 1 Jogo (4 pastilhas)
*   **Discos de Freio Dianteiros (Par)**
    *   *Marcas recomendadas:* Fremax, TRW, Hipper Freios
    *   *Preço aproximado:* R$ 160,00 - R$ 320,00
    *   *Quantidade:* 1 Par (ventilado ou sólido)
*   **Fluido de Freio DOT 4 ou DOT 5.1**
    *   *Marcas recomendadas:* Varga, Bosch, Pentosin
    *   *Preço aproximado:* R$ 25,00 - R$ 50,00 por frasco
    *   *Quantidade:* 2 Frascos (500ml cada)
*   **Limpa Freios Aerossol** (Para higienização e remoção de resíduos)
    *   *Marcas recomendadas:* Wurth, Radiex, Koube
    *   *Preço aproximado:* R$ 25,00
    *   *Quantidade:* 1 lata

### Ferramentas Especiais
*   Ferramenta de recuo do êmbolo da pinça de freio traseira (se o serviço envolver os freios traseiros com freio de mão integrado).

### Tempo Estimado de Mão de Obra
*   **1.0 a 2.0 horas** para o eixo dianteiro completo.

### Dicas Técnicas de Montagem
1.  **Limpeza do Cubo:** Limpe perfeitamente a face do cubo de roda com escova de aço antes de montar o disco novo. Qualquer sujeira milimétrica causará empenamento e vibração no pedal ao frear (pulsação).
2.  **Lubrificação de Pinos:** Limpe e lubrifique os pinos guias da pinça com graxa específica de silicone (alta temperatura). Pinos travados causam desgaste irregular das pastilhas e freio preso.
3.  **Assentamento:** Oriente o cliente a evitar freadas bruscas nos primeiros 200 km para permitir o correto assentamento térmico e mecânico entre a pastilha e o disco novo.`;
  }

  // General Fallback
  return `### Peças Recomendadas para **${serviceDescription}** em **${vehicleInfo}**

*   **Filtros (Ar, Óleo, Combustível, Cabine)**
    *   *Marcas recomendadas:* Mann Filter, Fram, Tecfil
    *   *Preço aproximado:* R$ 25,00 - R$ 75,00
    *   *Quantidade:* Conforme necessidade da revisão
*   **Componentes de Vedação (Juntas/Anéis)**
    *   *Marcas recomendadas:* Sabó, Taranto
    *   *Preço aproximado:* R$ 40,00 - R$ 120,00
    *   *Quantidade:* 1 jogo

### Ferramentas Especiais
*   Scanner OBD2 para leitura de parâmetros e reset de alertas após manutenção.

### Tempo Estimado de Mão de Obra
*   **1.5 a 3.0 horas** sugeridas para a inspeção e execução padrão.

### Dicas Técnicas de Montagem
1.  Consulte sempre o manual do fabricante do veículo para verificar o torque específico dos parafusos.
2.  Faça o check-out visual de todas as mangueiras e conexões elétricas adjacentes antes da entrega ao proprietário.`;
}
