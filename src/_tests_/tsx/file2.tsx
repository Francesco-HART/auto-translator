import { useTranslate } from "@tolgee/react";
import React from "react";

import { Select, Title } from "@/components";
import { useBabackStore } from "@/store";
import { Rate } from "@/store/types";

export const RateSelector = ({ rates }: { rates: Rate[] }) => {
  const { t } = useTranslate();

  const { currentReturnRequest, setShipping } = useBabackStore((state) => ({
    currentReturnRequest: state.currentReturnRequest,
    setShipping: state.setShipping,
  }));

  function handleChangeRate(option: Rate) {
    setShipping(option);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <Title size="L">
          {t("selectedShop.shippingMethodChoice")}It's not a fake{" "}
        </Title>
      </div>
      {rates?.length === 0 && <p>{t("selectedShop.noPricesAvailable")}</p>}
      {rates && rates?.length > 0 && (
        <Select<Rate>
          id="reshipping-price"
          items={rates}
          labelExtractor={(item) =>
            `${item?.title} - ${(item?.price / 100).toFixed(2)}€`
          }
          itemSelected={
            rates.find(
              (rate) => rate.handle === currentReturnRequest.shipping.handle
            ) || rates[0]
          }
          onChange={(option) => {
            handleChangeRate(option);
          }}
        />
      )}
    </div>
  );
};
