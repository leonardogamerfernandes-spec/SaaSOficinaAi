import { Response } from "express";
import { prisma } from "../../shared/prisma";
import { AuthenticatedRequest } from "../../shared/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API if key is available
const geminiKey = process.env.GEMINI_API_KEY;
let ai: any = null;
if (geminiKey) {
  try {
    ai = new GoogleGenerativeAI(geminiKey);
  } catch (err) {
    console.error("Failed to initialize Gemini API Client:", err);
  }
}

export async function listServiceOrders(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const orders = await prisma.serviceOrder.findMany({
      where: { tenantId },
      include: {
        customer: true,
        vehicle: true,
        createdBy: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(orders);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getServiceOrder(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { id } = req.params;

    const order = await prisma.serviceOrder.findFirst({
      where: { id, tenantId },
      include: {
        customer: true,
        vehicle: true,
        createdBy: {
          select: { id: true, name: true, role: true },
        },
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Service Order not found" });
    }

    return res.json(order);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createServiceOrder(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.id;
    if (!tenantId || !userId) return res.status(400).json({ error: "Context missing" });

    const { customerId, vehicleId, notes, discount } = req.body;
    if (!customerId || !vehicleId) {
      return res.status(400).json({ error: "Customer and Vehicle are required" });
    }

    // Verify relations
    const customer = await prisma.customer.findFirst({ where: { id: customerId, tenantId } });
    const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, tenantId } });

    if (!customer || !vehicle) {
      return res.status(400).json({ error: "Invalid customer or vehicle mapping" });
    }

    const order = await prisma.serviceOrder.create({
      data: {
        tenantId,
        customerId,
        vehicleId,
        createdById: userId,
        status: "DRAFT_BUDGET",
        notes,
        discount: discount ? Number(discount) : 0,
        totalPrice: 0,
      },
    });

    return res.status(201).json(order);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateServiceOrder(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { id } = req.params;
    const { status, notes, discount } = req.body;

    const order = await prisma.serviceOrder.findFirst({ where: { id, tenantId } });
    if (!order) return res.status(404).json({ error: "Service Order not found" });

    const data: any = {};
    if (status) {
      data.status = status;
      if (status === "BUDGET_APPROVED" && order.status === "DRAFT_BUDGET") {
        data.approvedAt = new Date();
      }
      if (status === "COMPLETED") {
        data.completedAt = new Date();
      }
    }
    if (notes !== undefined) data.notes = notes;
    if (discount !== undefined) {
      data.discount = Number(discount);
    }

    const updated = await prisma.serviceOrder.update({
      where: { id },
      data,
    });

    // Recalculate total price in case discount changed
    await updateOrderTotal(id);

    const finalOrder = await prisma.serviceOrder.findUnique({
      where: { id },
      include: { items: true },
    });

    return res.json(finalOrder);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function addServiceItem(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { id } = req.params;
    const { description, quantity, unitPrice, type } = req.body;

    if (!description || !quantity || !unitPrice || !type) {
      return res.status(400).json({ error: "Missing item details" });
    }

    const order = await prisma.serviceOrder.findFirst({ where: { id, tenantId } });
    if (!order) return res.status(404).json({ error: "Service Order not found" });

    const qty = Number(quantity);
    const price = Number(unitPrice);
    const item = await prisma.serviceItem.create({
      data: {
        serviceOrderId: id,
        description,
        quantity: qty,
        unitPrice: price,
        totalPrice: qty * price,
        type, // "PART" or "LABOR"
      },
    });

    await updateOrderTotal(id);

    return res.status(201).json(item);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function removeServiceItem(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { id, itemId } = req.params;

    const order = await prisma.serviceOrder.findFirst({ where: { id, tenantId } });
    if (!order) return res.status(404).json({ error: "Service Order not found" });

    const item = await prisma.serviceItem.findFirst({
      where: { id: itemId, serviceOrderId: id },
    });

    if (!item) return res.status(404).json({ error: "Service item not found" });

    await prisma.serviceItem.delete({ where: { id: itemId } });
    await updateOrderTotal(id);

    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function aiAnalyzeServiceOrder(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { id } = req.params;

    const order = await prisma.serviceOrder.findFirst({
      where: { id, tenantId },
      include: { vehicle: true },
    });

    if (!order) return res.status(404).json({ error: "Service Order not found" });

    const symptoms = order.notes || "Nenhum sintoma fornecido.";
    const vehicleInfo = `${order.vehicle.brand} ${order.vehicle.model} (${order.vehicle.year})`;

    let diagnosticResponse = "";

    if (ai) {
      try {
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Você é um mecânico especialista de IA na plataforma OficinaAI.
Sua tarefa é analisar os sintomas relatados de um veículo e fornecer:
1. Um diagnóstico técnico provável da falha.
2. Uma lista sugerida de peças e serviços necessários para o conserto (mão de obra).

Informações do Veículo: ${vehicleInfo}
Sintomas Relatados: ${symptoms}

Escreva uma resposta clara, objetiva e estruturada em português. Adicione uma introdução amigável e depois duas seções bem definidas:
### Diagnóstico Técnico Provável
### Lista de Peças e Mão de Obra Recomendadas`;

        const result = await model.generateContent({ contents: [{ parts: [{ text: prompt }] }] });
        diagnosticResponse = result.response.text();
      } catch (geminiError) {
        console.error("Gemini API call failed, using mock:", geminiError);
        diagnosticResponse = getMockDiagnostic(symptoms, vehicleInfo);
      }
    } else {
      diagnosticResponse = getMockDiagnostic(symptoms, vehicleInfo);
    }

    // Save diagnosis to database
    const updated = await prisma.serviceOrder.update({
      where: { id },
      data: { aiDiagnostic: diagnosticResponse },
    });

    return res.json({ aiDiagnostic: diagnosticResponse, order: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// Helper to update total price of service order
async function updateOrderTotal(serviceOrderId: string) {
  const items = await prisma.serviceItem.findMany({
    where: { serviceOrderId },
  });

  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const order = await prisma.serviceOrder.findUnique({
    where: { id: serviceOrderId },
  });

  if (order) {
    const discount = order.discount || 0;
    const finalPrice = Math.max(0, subtotal - discount);

    await prisma.serviceOrder.update({
      where: { id: serviceOrderId },
      data: { totalPrice: finalPrice },
    });
  }
}

// Mock diagnostic generator in Portuguese
function getMockDiagnostic(symptoms: string, vehicleInfo: string): string {
  const sym = symptoms.toLowerCase();
  let diag = "";
  let items = "";

  if (sym.includes("freio") || sym.includes("pastilha") || sym.includes("breque") || sym.includes("assovio")) {
    diag = `Com base nos sintomas de ruído ou perda de eficiência ao frear no veículo **${vehicleInfo}**, há indícios fortes de desgaste acentuado nas pastilhas de freio dianteiras. O ruído metálico ou assobio geralmente ocorre quando a pastilha atinge o limite do material de fricção ou quando o disco apresenta ranhuras significativas.`;
    items = `*   **Pastilha de Freio Dianteira** (Par) - Peça
*   **Disco de Freio Dianteiro** (Par) - Peça
*   **Substituição de pastilhas e discos dianteiros** - Mão de Obra
*   **Fluido de Freio DOT 4** - Insumo`;
  } else if (sym.includes("barulho") && (sym.includes("suspensão") || sym.includes("buraco") || sym.includes("bater"))) {
    diag = `A queixa de barulhos metálicos ("toc-toc") ao transitar por terrenos irregulares ou buracos no veículo **${vehicleInfo}** é característica de folga nas buchas da bandeja de suspensão dianteira ou desgaste nas bieletas da barra estabilizadora. Também pode ser indicativo de amortecedores que perderam a ação hidráulica.`;
    items = `*   **Bucha da Bandeja Dianteira** (Unidades avulsas ou par de balanças completas) - Peça
*   **Bieleta da Barra Estabilizadora Dianteira** (Par) - Peça
*   **Substituição de componentes da suspensão** - Mão de Obra
*   **Alinhamento e Balanceamento 3D** - Serviço Técnico`;
  } else if (sym.includes("óleo") || sym.includes("vazamento") || sym.includes("pingar") || sym.includes("sujeira")) {
    diag = `Vazamentos de óleo lubrificante no motor do **${vehicleInfo}** geralmente decorrem do ressecamento da junta da tampa de válvulas ou da vedação do filtro/retentor do virabrequim. A baixa do nível de óleo exige reparação imediata para evitar danos internos graves às galerias e bronzinas.`;
    items = `*   **Junta da Tampa de Válvulas** - Peça
*   **Filtro de Óleo do Motor** - Peça
*   **Óleo 5W30 Sintético** (4 a 5 Litros conforme manual) - Peça
*   **Mão de Obra para Troca de Junta e Limpeza de Motor** - Mão de Obra`;
  } else if (sym.includes("aquecendo") || sym.includes("temperatura") || sym.includes("água") || sym.includes("ferver") || sym.includes("radiador")) {
    diag = `O aumento excessivo da temperatura no motor do **${vehicleInfo}** aponta para um defeito crítico no sistema de arrefecimento. As causas mais comuns incluem o travamento fechado da válvula termostática, vazamento nas mangueiras ou no radiador, ou falha no acionamento da ventoinha (eletroventilador). Evite rodar com o veículo para não queimar a junta do cabeçote.`;
    items = `*   **Válvula Termostática Nova** - Peça
*   **Aditivo Concentrado para Arrefecimento** (Aditivo + Água Desmineralizada) - Peça
*   **Bomba d'Água** (Recomendável substituir junto) - Peça
*   **Serviço de limpeza e sangria do arrefecimento** - Mão de Obra`;
  } else {
    diag = `Para os sintomas descritos ("${symptoms}") no veículo **${vehicleInfo}**, recomenda-se realizar uma inspeção técnica presencial detalhada com manômetro e scanner de diagnóstico de injeção eletrônica (OBD2) para verificar se há códigos de falha armazenados na ECU.`;
    items = `*   **Diagnóstico Computadorizado via Scanner OBD2** - Mão de Obra
*   **Revisão Geral Preventiva (Velas, Filtro de Ar e Cabine)** - Mão de Obra`;
  }

  return `### Diagnóstico Técnico Provável (IA OficinaAI)
${diag}

### Lista de Peças e Mão de Obra Recomendadas
${items}

*Nota: Este diagnóstico foi gerado de forma autônoma pela IA com base nas queixas relatadas. Confirme os valores de torque e especificações técnicas de montagem antes do reparo.*`;
}
