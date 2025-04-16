export interface OrderMessage {
  ACTION: number;
  CCSEQ: number;
  DELAYNS: number;
  FSYM: string;
  M: string;
  P: number;
  Q: number;
  REPORTEDNS: number;
  SEQ: number;
  SIDE: number;
  TSYM: string;
  TYPE: string;
}

export interface OrderItemProps {
  order: OrderMessage;
}
