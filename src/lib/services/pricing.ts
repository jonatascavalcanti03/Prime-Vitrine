export type MlListingType = "gold_special" | "gold_pro";

export interface PricingCalculationParams {
  costPrice: number;
  profitMarginPercent: number;
  listingType?: MlListingType;
  customFeePercent?: number;
}

export interface PricingCalculationResult {
  costPrice: number;
  finalSalePrice: number;
  mlFeePercent: number;
  mlFeeAmount: number;
  fixedFeeAmount: number;
  netProfit: number;
  roiPercent: number;
}

const ML_DEFAULT_FEES: Record<MlListingType, number> = {
  gold_special: 14, // Anúncio Clássico (14%)
  gold_pro: 19,     // Anúncio Premium (19%)
};

const ML_FIXED_FEE_THRESHOLD = 79.0;
const ML_FIXED_FEE_AMOUNT = 6.0;

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Calcula o preço de venda ideal no Mercado Livre para garantir a margem de lucro
 * desejada sobre o custo após descontar a comissão percentual e eventual taxa fixa.
 */
export function calculateMlPricing(
  params: PricingCalculationParams
): PricingCalculationResult {
  const costPrice = Math.max(0, params.costPrice);
  const profitMarginPercent = Math.max(0, params.profitMarginPercent);
  const listingType: MlListingType = params.listingType ?? "gold_special";

  const mlFeePercent =
    params.customFeePercent !== undefined && params.customFeePercent >= 0
      ? params.customFeePercent
      : ML_DEFAULT_FEES[listingType];

  const feeRate = mlFeePercent / 100;
  if (feeRate >= 1) {
    throw new Error("A taxa do Mercado Livre não pode ser igual ou superior a 100%.");
  }

  // Lucro líquido alvo em R$ sobre o preço de custo
  const desiredNetProfit = costPrice * (profitMarginPercent / 100);
  const targetNetReceipt = costPrice + desiredNetProfit;

  // Cálculo inicial sem taxa fixa
  const priceWithoutFixedFee = targetNetReceipt / (1 - feeRate);

  // Se o preço de venda ficar abaixo de R$ 79,00, o ML cobra R$ 6,00 de taxa fixa
  let fixedFeeAmount = 0;
  let rawFinalSalePrice = priceWithoutFixedFee;

  if (priceWithoutFixedFee < ML_FIXED_FEE_THRESHOLD) {
    fixedFeeAmount = ML_FIXED_FEE_AMOUNT;
    rawFinalSalePrice = (targetNetReceipt + fixedFeeAmount) / (1 - feeRate);
  }

  const finalSalePrice = round2(rawFinalSalePrice);
  const mlFeeAmount = round2(finalSalePrice * feeRate);
  const netProfit = round2(
    finalSalePrice - mlFeeAmount - fixedFeeAmount - costPrice
  );
  const roiPercent =
    costPrice > 0 ? round2((netProfit / costPrice) * 100) : 0;

  return {
    costPrice: round2(costPrice),
    finalSalePrice,
    mlFeePercent: round2(mlFeePercent),
    mlFeeAmount,
    fixedFeeAmount: round2(fixedFeeAmount),
    netProfit,
    roiPercent,
  };
}
