import type { WizardRecommendation } from "./partner-wizard-api";

const num = (v: unknown) => { const n = Number(v); return Number.isFinite(n) && n > 0 ? n : 0; };

/** Package price = selected tool + selected products, no discounts. */
export function calcPackagePrice(rec: WizardRecommendation, selectedTool: string, selectedProducts: string[]) {
  const tool = (rec.recommendedTools ?? []).find((t) => t.name === selectedTool);
  const toolPrice = tool ? num(tool.product?.specialPrice ?? tool.product?.price) : 0;
  const productsPrice = (rec.recommendedProducts ?? [])
    .filter((p) => selectedProducts.includes(`${p.title} (${p.sku})`))
    .reduce((s, p) => s + num(p.specialPrice ?? p.price), 0);
  return { toolPrice, productsPrice, total: toolPrice + productsPrice };
}
