import { Response } from "express";
import { prisma } from "../../shared/prisma";
import { AuthenticatedRequest } from "../../shared/auth";
import { sanitizeError } from "../../shared/errorHandler";

/**
 * Creates a Mercado Pago payment preference (checkout session).
 * POST /api/payments/checkout
 */
export async function createCheckout(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { plan } = req.body;
    if (!plan || !["PRO", "ENTERPRISE"].includes(plan)) {
      return res.status(400).json({ error: "Plano inválido para checkout." });
    }

    const price = plan === "PRO" ? 79.0 : 149.0;
    const title = `OficinaAI SaaS - Assinatura Plano ${plan}`;

    // Get the frontend origin from environment variables or default to localhost:3000
    const frontendOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";

    const mpAccessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!mpAccessToken) {
      // If no Mercado Pago token is set, simulate a successful redirect immediately (mock/test mode)
      console.log(`[MOCK PAYMENT] Simulating Mercado Pago preference creation for ${plan}`);
      return res.json({
        id: "mock-pref-id",
        init_point: `${frontendOrigin}/dashboard?payment=success&mock_upgrade=${plan}`,
      });
    }

    // Call Mercado Pago API
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${mpAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            title,
            quantity: 1,
            unit_price: price,
            currency_id: "BRL",
          },
        ],
        back_urls: {
          success: `${frontendOrigin}/dashboard?payment=success`,
          failure: `${frontendOrigin}/dashboard?payment=failure`,
          pending: `${frontendOrigin}/dashboard?payment=pending`,
        },
        auto_return: "approved",
        external_reference: `${tenantId}:${plan}`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Mercado Pago Preference Error:", errorData);
      throw new Error("Erro ao criar preferência de pagamento no Mercado Pago");
    }

    const data: any = await response.json();
    return res.json({
      id: data.id,
      init_point: data.init_point,
    });
  } catch (error: any) {
    return res.status(500).json({ error: sanitizeError(error) });
  }
}

/**
 * Receives webhook notification from Mercado Pago on payment success.
 * POST /api/payments/webhook
 */
export async function handleWebhook(req: any, res: Response) {
  try {
    const { action, data, type } = req.body;

    // Mercado Pago payment notifications can be 'payment' type
    if (type === "payment" || action === "payment.created" || req.query.topic === "payment") {
      const paymentId = data?.id || req.query.id;
      if (!paymentId) {
        return res.status(200).send("No payment ID found in webhook payload");
      }

      const mpAccessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      if (!mpAccessToken) {
        return res.status(200).send("Mercado Pago Access Token not configured");
      }

      // Fetch payment details from Mercado Pago to verify
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          "Authorization": `Bearer ${mpAccessToken}`,
        },
      });

      if (!paymentResponse.ok) {
        console.error(`Failed to fetch payment info from Mercado Pago for paymentId: ${paymentId}`);
        return res.status(200).send("Payment verification failed");
      }

      const paymentData: any = await paymentResponse.json();

      // Check if payment is approved
      if (paymentData.status === "approved") {
        const externalReference = paymentData.external_reference; // format: "tenantId:plan"
        if (externalReference && externalReference.includes(":")) {
          const [tenantId, plan] = externalReference.split(":");

          let maxUsers = 1;
          if (plan === "PRO") maxUsers = 3;
          if (plan === "ENTERPRISE") maxUsers = 999;

          // Update tenant plan expiration (e.g. 30 days from now)
          const planExpiresAt = new Date();
          planExpiresAt.setDate(planExpiresAt.getDate() + 30);

          await prisma.tenant.update({
            where: { id: tenantId },
            data: {
              plan,
              maxUsers,
              planExpiresAt,
            },
          });

          console.log(`[PAYMENT APPROVED] Tenant ${tenantId} upgraded to ${plan} until ${planExpiresAt}`);
        }
      }
    }

    // Always respond 200/201 to Mercado Pago webhook
    return res.status(200).send("Webhook received");
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return res.status(200).send("Webhook processed with error details logged");
  }
}
