import { FC, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as ScrollArea from '@radix-ui/react-scroll-area';

import styles from './MonitorPage.module.scss';
import OrderItem from "../../components/OrderItem/OrderItem.tsx";
import { OrderMessage } from "../../types/orders-types.ts";

interface MonitorPageProps {
  orders: OrderMessage[];
  disableVirtualization?: boolean
}

export const MonitorPage: FC<MonitorPageProps> = ({ orders, disableVirtualization = false }) => {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: orders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 140,
    overscan: 10,
  });

  return (
    <ScrollArea.Root className={styles.scrollAreaRoot}>
      <ScrollArea.Viewport ref={parentRef} className={styles.viewport}>
        <div className="container">
          {orders.length === 0 ? (
            <div className={styles.emptyStateMessage}>
              <h3>No orders to display</h3>
              <p>Start the stream to see real-time order data</p>
            </div>
          ) : disableVirtualization ? (
            orders.map((order, i) => (
              <OrderItem key={i} order={order} />
            ))
          ) : (
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const order = orders[virtualRow.index];
                return (
                  <div
                    key={virtualRow.key}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <OrderItem order={order} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical" className={styles.scrollbar}>
        <ScrollArea.Thumb className={styles.thumb} />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner />
    </ScrollArea.Root>
  );
};
