import { ReturnRequestFlowPage } from "./return-request.flow";

export const ReturnRequestPage = () => {
  // const isConditionMet =
  //   returnItems.length > 0 &&
  //   (currentReturnRequest.currentItem.resolution === "exchange" ||
  //     currentReturnRequest.currentItem.resolution === "exchange-credit");
  //
  // const findVariantImageFromVariantId = () => {
  //   const product = order?.variantByLineItemId[currentReturnRequest.currentItem.baseItem.line_item_id].products.find(
  //     (product: any) => {
  //       return product.variants.find((variant: any) => variant.id == currentReturnRequest.currentItem.newVariantId);
  //     }
  //   );
  //   if (!product) {
  //     return;
  //   }
  //   const variant = product.variants.find(
  //     (variant: any) => variant.id == currentReturnRequest.currentItem.newVariantId
  //   );
  //   if (!variant) {
  //     return;
  //   }
  //   return variant.image;
  // };

  return <ReturnRequestFlowPage />;
};
