import { ReactNode, useEffect, useState } from "react";

export function ConfirmModalVariantA(props: ConfirmAndRejectModalProps) {
  const [localReturnRequest, setLocalReturnRequest] = useState<ReturnRequest>(
    props.returnRequest
  );
  const userHasRight = useCurrentUserHasShopRight(props.returnRequest.shopId, [
    "admin",
    "owner",
    "store",
  ]);
  const t = useTranslator();

  const [refundA, setRefundA] = useState(
    Math.round(
      (localReturnRequest.financial_informations.refund.presentmentAmount -
        localReturnRequest.financial_informations.refund.amount) *
        100
    ) / 100
  );

  const [discountA, setDiscountA] = useState(
    Math.round(
      (localReturnRequest.financial_informations.discount.presentmentAmount -
        localReturnRequest.financial_informations.discount.amount) *
        100
    ) / 100
  );

  const [lineItemsToReject, setLineItemsToReject] = useState<{
    [id: string]: {
      quantity: number;
      reason?: string;
      lineItemId: string;
      status: "rejected" | "ok";
    };
  }>({});

  // AJOUT D'UN TEXTE À TRADUIRE
  const [demoText] = useState(t("confirmModalVariantA.demoText"));

  const [bypassStockEnabled, setBypassStockEnabled] = useState<boolean>(false);

  useEffect(() => {
    const newLi: any = {};
    props.itemsToShowToHandle.forEach((li) => {
      if (li.quantity > 0) {
        newLi[li.line_item_id + "-V"] = {
          quantity: userHasRight
            ? getQuantityToHandleMerchant(li, {
                notValidatedByLogistician: !props.workflowLogisticianActivated,
              })
            : getQuantityToHandleLogistician(li),
          reason: "",
          lineItemId: li.line_item_id,
          status: "rejected",
        };
      }
    });
    setLineItemsToReject(newLi);
  }, [
    props.itemsToShowToHandle,
    userHasRight,
    props.workflowLogisticianActivated,
  ]);

  function recalcDiscountAndRefund(rr: ReturnRequest) {
    setRefundA(
      getTotalToRefund(rr, {
        withCharges: true,
        notValidatedByLogistician: !props.workflowLogisticianActivated,
      })
    );
    setDiscountA(
      getTotalDiscountToHandle(rr, {
        withCharges: true,
        withBonus: true,
        notValidatedByLogistician: !props.workflowLogisticianActivated,
      })
    );
  }

  function handleRejectQuantity(
    lineItem: LineItem,
    suffix: string,
    opt: { quantity?: number; reason?: string }
  ) {
    const updated = cloneDeep(lineItemsToReject);
    if (!updated[lineItem.line_item_id + suffix]) {
      updated[lineItem.line_item_id + suffix] = {
        quantity: 0,
        lineItemId: lineItem.line_item_id,
        status: "rejected",
        reason: "",
      };
    }

    if (opt.quantity !== undefined) {
      updated[lineItem.line_item_id + suffix].quantity = opt.quantity;
    }
    if (opt.reason !== undefined) {
      updated[lineItem.line_item_id + suffix].reason = opt.reason;
    }
    if (opt.quantity !== undefined && !Number.isNaN(opt.quantity)) {
      const clonedRR = cloneDeep(localReturnRequest);
      clonedRR.line_items.forEach((li) => {
        if (li.line_item_id == lineItem.line_item_id) {
          const validatedQ =
            updated[lineItem.line_item_id + "-V"]?.quantity || 0;
          const notValQ = ["-R", "-NT", "-NR"].reduce((prev, suf) => {
            return (
              prev +
              (updated[lineItem.line_item_id + suf]
                ? updated[lineItem.line_item_id + suf].quantity
                : 0)
            );
          }, 0);
          li.quantity = validatedQ + notValQ;
          li.logistician_informations = [
            {
              quantity: validatedQ + notValQ,
              status: "ok",
              result: {},
            },
          ];
          if (!li.resolution && li.quantity > 0) {
            li.resolution = "refund";
          }
        }
      });
      setLocalReturnRequest(clonedRR);
      recalcDiscountAndRefund(clonedRR);
    }
    setLineItemsToReject(updated);
  }

  const listToShow = [
    {
      title: "",
      items: props.itemsToShowToHandle,
      hidden: false,
      itemRender: (li: LineItem) => {
        const maxQ = userHasRight
          ? getQuantityToHandleMerchant(li, {
              notValidatedByLogistician: !props.workflowLogisticianActivated,
            })
          : getQuantityToHandleLogistician(li);
        return (
          <RejectArticle
            lineItem={li}
            quantity={
              lineItemsToReject?.[li.line_item_id + "-V"]
                ? lineItemsToReject[li.line_item_id + "-V"].quantity
                : maxQ
            }
            maxQuantity={maxQ}
            onChangeQuantity={(q: number) =>
              handleRejectQuantity(li, "-V", { quantity: q })
            }
            reason={lineItemsToReject?.[li.line_item_id + "-V"]?.reason || ""}
            onChangeReason={(r: string) =>
              handleRejectQuantity(li, "-V", { reason: r })
            }
          />
        );
      },
    },
  ];

  // Autres listes/props etc. (rejetés, notTreated, etc.)
  // ... on reprend la même structure que votre code d’origine

  // TEXTE AJOUTÉ POUR TEST
  const [explanatoryText] = useState(t("confirmModalVariantA.explanatoryText"));

  return (
    <Dialog open={props.open} onOpenChange={(v) => props.setOpen(v)}>
      <DialogContent className={"max-w-2xl"}>
        <DialogHeader>
          <DialogTitle className={"text-2xl"}>
            {t("returnDetail.confirmModal.titleRejectVariantA")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-8">
          <div className="space-y-4">
            {demoText /* Just to use the variable */}
            {explanatoryText /* Just to use the variable */}
            {/* Mêmes rendus que votre composant, boucles sur listToShow, etc. */}
          </div>
          Ce code doit etre translate
        </div>
        <DialogFooter className={"flex flex-row justify-between items-center"}>
          <Button
            onClick={() => {
              props.setOpen(false);
              setLineItemsToReject({});
            }}
            text={"cancelllll"}
          />
          <Button
            onClick={() => {
              // Merge line items
              const merged = {};
              Object.keys(lineItemsToReject).forEach((k) => {
                if (lineItemsToReject[k].quantity > 0) {
                  if (!merged[lineItemsToReject[k].lineItemId]) {
                    merged[lineItemsToReject[k].lineItemId] = cloneDeep(
                      lineItemsToReject[k]
                    );
                  } else {
                    merged[lineItemsToReject[k].lineItemId].quantity +=
                      lineItemsToReject[k].quantity;
                  }
                }
              });
              // Confirmation callback
              props.onConfirm(
                Object.values(merged),
                refundA,
                discountA,
                bypassStockEnabled,
                "", // location
                false // restock
              );
              setLineItemsToReject({});
              props.setOpen(false);
            }}
            text={t("misc.reject")}
          />

          <button>Il est beau bouton non ? </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
