import { FC } from "react";
import styles from "./OrderItem.module.scss";
import classNames from "classnames";
import { getAlertRules } from "../../utils/checkAlerts.ts";
import { OrderItemProps } from "../../types/orders-types.ts";

const OrderItem: FC<OrderItemProps> = ({ order }) => {
  const rules = getAlertRules(order);
  const isAlerting = rules.length > 0;
  const isBuy = order.SIDE === 0;
  const formattedPrice = order.P.toFixed(2);
  const formattedQuantity = order.Q.toFixed(6);
  const totalValue = order.P * order.Q;
  const formattedTotal = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(totalValue);
  const pairName = `${order.FSYM}/${order.TSYM}`;
  const timestamp = new Date(order.REPORTEDNS / 1000000).toLocaleTimeString();

  return (
    <div
      className={classNames(styles.orderItem, {
        [styles.buyOrder]: isBuy,
        [styles.sellOrder]: !isBuy,
        [styles.alerting]: isAlerting,
      })}
      data-testid="order-item"
    >
      <div className={styles.orderHeader}>
        <span className={styles.pair} data-testid="pair-name">{pairName}</span>
        {rules.length > 0 && (
          <div className={styles.rules} data-testid="rules">
            {rules.map((rule, index) => (
              <span key={index} className={styles.ruleTag}>{rule}</span>
            ))}
          </div>
        )}
        <span className={styles.exchange} data-testid="exchange">{order.M}</span>
      </div>

      <div className={styles.orderDetails}>
        <div className={styles.info}>
          <span className={styles.label}>Price:</span>
          <span className={styles.priceValue} data-testid="price">{formattedPrice}</span>
        </div>

        <div className={styles.info}>
          <span className={styles.label}>Amount:</span>
          <span className={styles.quantityValue} data-testid="quantity">{formattedQuantity}</span>
        </div>

        <div className={classNames(styles.info, styles.total)}>
          <span className={styles.label}>Total:</span>
          <span className={styles.totalValue} data-testid="total">${formattedTotal}</span>
        </div>
      </div>

      <div className={styles.orderFooter}>
        <span className={styles.sideIndicator} data-testid="side">
          {isBuy ? 'BUY' : 'SELL'}
        </span>
        <span className={styles.timestamp} data-testid="timestamp">{timestamp}</span>
      </div>
    </div>
  );
};

export default OrderItem;
