// Mock payment processing system
interface PaymentDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  amount: number;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

// Test card numbers that will be accepted
const TEST_CARDS = {
  VALID: '4242424242424242',
  DECLINED: '4000000000000002',
  INSUFFICIENT_FUNDS: '4000000000009995',
};

export function processMockPayment(details: PaymentDetails): Promise<PaymentResult> {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Basic validation
      if (!details.cardNumber || !details.expiryDate || !details.cvv) {
        resolve({
          success: false,
          error: 'Missing required payment information',
        });
        return;
      }

      // Test different scenarios based on card number
      switch (details.cardNumber) {
        case TEST_CARDS.VALID:
          resolve({
            success: true,
            transactionId: `mock_${Date.now()}`,
          });
          break;
        case TEST_CARDS.DECLINED:
          resolve({
            success: false,
            error: 'Card declined',
          });
          break;
        case TEST_CARDS.INSUFFICIENT_FUNDS:
          resolve({
            success: false,
            error: 'Insufficient funds',
          });
          break;
        default:
          // Accept any card number that passes Luhn algorithm for testing
          if (isValidCardNumber(details.cardNumber)) {
            resolve({
              success: true,
              transactionId: `mock_${Date.now()}`,
            });
          } else {
            resolve({
              success: false,
              error: 'Invalid card number',
            });
          }
      }
    }, 1000); // Simulate 1 second processing time
  });
}

// Luhn algorithm for card number validation
function isValidCardNumber(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  
  if (digits.length !== 16) return false;
  
  let sum = 0;
  let isEven = false;
  
  // Loop through values starting from the rightmost digit
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

// Mock refund processing
export function processMockRefund(transactionId: string, amount: number): Promise<PaymentResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!transactionId.startsWith('mock_')) {
        resolve({
          success: false,
          error: 'Invalid transaction ID',
        });
        return;
      }

      resolve({
        success: true,
        transactionId: `refund_${Date.now()}`,
      });
    }, 1000);
  });
}

// Export test card numbers for easy testing
export const TEST_CARD_NUMBERS = TEST_CARDS;