import { OperationType, Statement } from "../../entities/Statement";

export interface ICreateStatementDTO {
  user_id: string;
  sender_id?: string;
  description: string;
  amount: number;
  type: OperationType;
}