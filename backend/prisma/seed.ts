import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function main() {
  console.log("Seeding database...");

  // Clean old records
  await prisma.aIChatMessage.deleteMany();
  await prisma.aIChatSession.deleteMany();
  await prisma.serviceItem.deleteMany();
  await prisma.serviceOrder.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // 1. Create Tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: "Oficina do Zeca",
      cnpj: "12.345.678/0001-99",
      phone: "(11) 98765-4321",
      address: "Rua das Oficinas, 123 - São Paulo, SP",
    },
  });

  // 2. Create Admin User
  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: "Zeca Silva",
      email: "zeca@oficina.com",
      passwordHash: hashPassword("123456"), // Default password: 123456
      role: "ADMIN",
    },
  });

  // 3. Create Customers
  const customer1 = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      name: "Leonardo Lima",
      email: "leonardo@email.com",
      phone: "(11) 99999-8888",
      cpfCnpj: "123.456.789-00",
      address: "Av. Paulista, 1000 - São Paulo, SP",
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      name: "Mariana Souza",
      email: "mariana@email.com",
      phone: "(11) 97777-6666",
      cpfCnpj: "987.654.321-11",
      address: "Rua Augusta, 500 - São Paulo, SP",
    },
  });

  // 4. Create Vehicles
  const vehicle1 = await prisma.vehicle.create({
    data: {
      tenantId: tenant.id,
      customerId: customer1.id,
      plate: "BRA2E19",
      brand: "Volkswagen",
      model: "Gol 1.6 MSI",
      year: 2021,
      color: "Branco",
      vin: "9BWZZZ5UG123456",
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      tenantId: tenant.id,
      customerId: customer2.id,
      plate: "OFF8I99",
      brand: "Chevrolet",
      model: "Onix 1.0 Turbo",
      year: 2022,
      color: "Preto",
    },
  });

  // 5. Create Service Orders
  // Order 1: Completed
  const order1 = await prisma.serviceOrder.create({
    data: {
      tenantId: tenant.id,
      customerId: customer1.id,
      vehicleId: vehicle1.id,
      createdById: admin.id,
      status: "COMPLETED",
      notes: "Barulho ao frear e trocar óleo do motor.",
      aiDiagnostic: `### Diagnóstico Técnico Provável (IA OficinaAI)
O ruído ao frear indica desgaste das pastilhas de freio dianteiras.

### Lista de Peças e Mão de Obra Recomendadas
* Pastilhas de freio dianteiras (Par)
* Fluido de freio DOT 4
* Óleo 5W30 Sintético (4L)
* Filtro de óleo`,
      totalPrice: 480.00,
      approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.serviceItem.createMany({
    data: [
      {
        serviceOrderId: order1.id,
        description: "Pastilhas de freio dianteiras (Cobreq)",
        quantity: 1,
        unitPrice: 120.00,
        totalPrice: 120.00,
        type: "PART",
      },
      {
        serviceOrderId: order1.id,
        description: "Óleo 5W30 Sintético Shell Helix (Litro)",
        quantity: 4,
        unitPrice: 45.00,
        totalPrice: 180.00,
        type: "PART",
      },
      {
        serviceOrderId: order1.id,
        description: "Filtro de óleo Fram",
        quantity: 1,
        unitPrice: 30.00,
        totalPrice: 30.00,
        type: "PART",
      },
      {
        serviceOrderId: order1.id,
        description: "Mão de obra troca de óleo e pastilhas",
        quantity: 1,
        unitPrice: 150.00,
        totalPrice: 150.00,
        type: "LABOR",
      },
    ],
  });

  // Order 2: In Progress
  const order2 = await prisma.serviceOrder.create({
    data: {
      tenantId: tenant.id,
      customerId: customer2.id,
      vehicleId: vehicle2.id,
      createdById: admin.id,
      status: "IN_PROGRESS",
      notes: "Barulho seco na suspensão dianteira ao passar em lombadas.",
      aiDiagnostic: `### Diagnóstico Técnico Provável (IA OficinaAI)
Barulho do tipo "toc-toc" seco na suspensão indica provável desgaste das buchas das bandejas dianteiras ou das bieletas estabilizadoras.

### Lista de Peças e Mão de Obra Recomendadas
* Par de bieletas dianteiras
* Buchas da bandeja (Par)
* Mão de obra substituição e alinhamento`,
      totalPrice: 350.00,
      approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.serviceItem.createMany({
    data: [
      {
        serviceOrderId: order2.id,
        description: "Bieletas dianteiras Axios (Par)",
        quantity: 1,
        unitPrice: 110.00,
        totalPrice: 110.00,
        type: "PART",
      },
      {
        serviceOrderId: order2.id,
        description: "Mão de obra suspensão e alinhamento",
        quantity: 1,
        unitPrice: 240.00,
        totalPrice: 240.00,
        type: "LABOR",
      },
    ],
  });

  // Order 3: Draft Budget
  await prisma.serviceOrder.create({
    data: {
      tenantId: tenant.id,
      customerId: customer1.id,
      vehicleId: vehicle1.id,
      createdById: admin.id,
      status: "DRAFT_BUDGET",
      notes: "Motor oscilando em marcha lenta e luz de injeção piscando.",
      totalPrice: 0.0,
    },
  });

  // 6. Create appointments
  await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      customerId: customer1.id,
      vehicleId: vehicle1.id,
      scheduledTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      notes: "Revisão periódica de 60.000 km",
      status: "SCHEDULED",
    },
  });

  // 7. Create AI Chat Session
  const chatSession = await prisma.aIChatSession.create({
    data: {
      userId: admin.id,
      title: "Torque do cabeçote do Onix",
    },
  });

  await prisma.aIChatMessage.createMany({
    data: [
      {
        sessionId: chatSession.id,
        role: "user",
        content: "Qual é o torque dos parafusos do cabeçote do Chevrolet Onix 1.0 Turbo?",
      },
      {
        sessionId: chatSession.id,
        role: "model",
        content: `### Torque de Aperto do Cabeçote - Chevrolet Onix 1.0 Turbo (CSS Prime)

O aperto dos parafusos deve seguir uma ordem espiral interna e ser realizado nas seguintes etapas:

1. **Etapa 1:** 20 Nm (Newton-metros)
2. **Etapa 2:** Angular de 90°
3. **Etapa 3:** Angular de 90°
4. **Etapa 4:** Angular de mais 15°

*Nota: Use parafusos novos, limpe as galerias de óleo e aplique o torque na ordem recomendada para evitar danos permanentes ao bloco de alumínio.*`,
      },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
