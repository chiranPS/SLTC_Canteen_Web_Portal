export const OrderTemplates = {
    orderConfirmation: (orderNumber, amount) => `
    <h1>Order Confirmation</h1>
    <p>Thank you for your order!</p>
    <p>Your order number is <strong>${orderNumber}</strong>.</p>
    <p>Total Amount: LKR ${amount}</p>
    <p>We will notify you once your order is ready for pickup.</p>
  `,
    paymentSuccess: (orderNumber, amount) => `
    <h1>Payment Successful</h1>
    <p>We have successfully received your payment of LKR ${amount} for order <strong>${orderNumber}</strong>.</p>
    <p>The kitchen is now preparing your food!</p>
  `,
    foodReady: (orderNumber) => `
    <h1>Your Food is Ready!</h1>
    <p>Great news! Your order <strong>${orderNumber}</strong> is ready for pickup.</p>
    <p>Please proceed to the canteen collection counter and present your QR code.</p>
  `
};
