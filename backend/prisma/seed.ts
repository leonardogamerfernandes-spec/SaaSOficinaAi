import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with OficinaAI SaaS content...");

  // Clean DB
  await prisma.inspectionChecklist.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.serviceWarranty.deleteMany();
  await prisma.serviceReminder.deleteMany();
  await prisma.aIChatMessage.deleteMany();
  await prisma.aIChatSession.deleteMany();
  await prisma.serviceItem.deleteMany();
  await prisma.serviceOrder.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // Create Tenant (PRO plan by default for full experience)
  const tenant = await prisma.tenant.create({
    data: {
      name: "Oficina do Zeca",
      cnpj: "12.345.678/0001-99",
      phone: "(11) 98765-4321",
      address: "Rua das Oficinas, 123 - São Paulo, SP",
      plan: "PRO",
      maxUsers: 3,
    },
  });

  const passwordHash = await bcrypt.hash("123456", 10);
  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: "Zeca Silva",
      email: "zeca@oficina.com",
      passwordHash,
      role: "ADMIN",
    },
  });

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

  // Vehicles with new fields
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
      mileage: 45200,
      engineInfo: "1.6 16V MSI Flex",
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
      mileage: 28500,
      engineInfo: "1.0 12V Ecotec Turbo",
    },
  });

  // Service Order 1 (Completed)
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
      { serviceOrderId: order1.id, description: "Pastilhas de freio dianteiras (Cobreq)", quantity: 1, unitPrice: 120.00, totalPrice: 120.00, type: "PART" },
      { serviceOrderId: order1.id, description: "Óleo 5W30 Sintético Shell Helix (Litro)", quantity: 4, unitPrice: 45.00, totalPrice: 180.00, type: "PART" },
      { serviceOrderId: order1.id, description: "Filtro de óleo Fram", quantity: 1, unitPrice: 30.00, totalPrice: 30.00, type: "PART" },
      { serviceOrderId: order1.id, description: "Mão de obra troca de óleo e pastilhas", quantity: 1, unitPrice: 150.00, totalPrice: 150.00, type: "LABOR" },
    ],
  });

  // Checklist for Order 1
  await prisma.inspectionChecklist.create({
    data: {
      serviceOrderId: order1.id,
      headlightsOk: true,
      taillightsOk: true,
      tiresOk: false, // worn out tires
      brakesOk: false, // bad brakes
      fluidsOk: false, // low oil
      batteryOk: true,
      suspensionOk: true,
      exhaustOk: true,
      acOk: true,
      wiperOk: true,
      mirrorsOk: true,
      bodyDamageNotes: "Risco leve na porta traseira direita",
      mileage: 45200,
      fuelLevel: "HALF",
      notes: "Carro limpo. Banco de couro bem conservado.",
    },
  });

  // Warranty for Order 1
  await prisma.serviceWarranty.create({
    data: {
      serviceOrderId: order1.id,
      warrantyDays: 90,
      expiresAt: new Date(Date.now() + 88 * 24 * 60 * 60 * 1000),
      notes: "Garantia de 90 dias para as pastilhas e serviços efetuados.",
    },
  });

  // Service Order 2 (In Progress)
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
      { serviceOrderId: order2.id, description: "Bieletas dianteiras Axios (Par)", quantity: 1, unitPrice: 110.00, totalPrice: 110.00, type: "PART" },
      { serviceOrderId: order2.id, description: "Mão de obra suspensão e alinhamento", quantity: 1, unitPrice: 240.00, totalPrice: 240.00, type: "LABOR" },
    ],
  });

  await prisma.inspectionChecklist.create({
    data: {
      serviceOrderId: order2.id,
      headlightsOk: true,
      taillightsOk: true,
      tiresOk: true,
      brakesOk: true,
      fluidsOk: true,
      batteryOk: true,
      suspensionOk: false, // bad suspension noise
      exhaustOk: true,
      acOk: true,
      wiperOk: true,
      mirrorsOk: true,
      mileage: 28500,
      fuelLevel: "THREE_QUARTER",
    },
  });

  // Service Order 3 (Draft)
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

  // Inventory Items (Pro feature)
  await prisma.inventoryItem.createMany({
    data: [
      { tenantId: tenant.id, name: "Óleo 5W30 Sintético Shell Helix", brand: "Shell", quantity: 24, minQuantity: 10, unitCost: 32.00, unitPrice: 48.00, category: "LUBRICATION", location: "Prateleira A-1" },
      { tenantId: tenant.id, name: "Pastilha de Freio Cobreq Gol G5/G6", brand: "Cobreq", quantity: 4, minQuantity: 3, unitCost: 75.00, unitPrice: 120.00, category: "BRAKE", location: "Prateleira B-4" },
      { tenantId: tenant.id, name: "Filtro de Óleo Fram Gol/Voyage", brand: "Fram", quantity: 12, minQuantity: 5, unitCost: 15.00, unitPrice: 28.00, category: "FILTERS", location: "Prateleira A-3" },
      { tenantId: tenant.id, name: "Amortecedor Dianteiro Onix Monroe", brand: "Monroe", quantity: 2, minQuantity: 2, unitCost: 280.00, unitPrice: 420.00, category: "SUSPENSION", location: "Corredor C" },
      { tenantId: tenant.id, name: "Bieleta Estabilizadora Axios Onix", brand: "Axios", quantity: 1, minQuantity: 4, unitCost: 35.00, unitPrice: 65.00, category: "SUSPENSION", location: "Prateleira B-2" }, // Low stock!
    ],
  });

  // Service Reminders (Pro feature)
  await prisma.serviceReminder.createMany({
    data: [
      {
        tenantId: tenant.id,
        customerId: customer1.id,
        vehicleId: vehicle1.id,
        type: "OIL_CHANGE",
        description: "Revisão e próxima troca de óleo de 10.000 km recomendada",
        dueDateKm: 55200,
        dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        status: "PENDING",
      },
      {
        tenantId: tenant.id,
        customerId: customer2.id,
        vehicleId: vehicle2.id,
        type: "REVISION",
        description: "Revisão preventiva periódica anual",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "PENDING",
      },
    ],
  });

  // Appointments
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

  const chatSession = await prisma.aIChatSession.create({
    data: { userId: admin.id, title: "Torque do cabeçote do Onix" },
  });

  await prisma.aIChatMessage.createMany({
    data: [
      { sessionId: chatSession.id, role: "user", content: "Qual é o torque dos parafusos do cabeçote do Chevrolet Onix 1.0 Turbo?" },
      { sessionId: chatSession.id, role: "model", content: `### Torque de Aperto do Cabeçote - Chevrolet Onix 1.0 Turbo (CSS Prime)

O aperto dos parafusos deve seguir uma ordem espiral interna e ser realizado nas seguintes etapas:

1. **Etapa 1:** 20 Nm (Newton-metros)
2. **Etapa 2:** Angular de 90°
3. **Etapa 3:** Angular de 90°
4. **Etapa 4:** Angular de mais 15°

*Nota: Use parafusos novos, limpe as galerias de óleo e aplique o torque na ordem recomendada para evitar danos permanentes ao bloco de alumínio.*` },
    ],
  });

  console.log("Database seeded successfully with plans and modules!");
  console.log(`  Tenant: Oficina do Zeca (CNPJ: 12.345.678/0001-99) - Plan: PRO`);
  console.log(`  Admin: zeca@oficina.com / 123456`);
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
