import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateStatementUseCase } from './CreateStatementUseCase';

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
    TRANSFER = 'transfer'
  }

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    const { id } = request.user;
    const { user_id } = request.params
    const { amount, description } = request.body;

    let transfers = []
    
    const createStatement = container.resolve(CreateStatementUseCase);
    const splittedPath = request.originalUrl.split('/')
    let type = splittedPath[splittedPath.length - 1] as OperationType;

    if(user_id) {
        
        type = OperationType.TRANSFER

        const receiverStatement = await createStatement.execute({
            user_id: String(user_id),
            type,
            amount,
            description,
            sender_id: String(id)
    })

    transfers.push(receiverStatement)
}


    const statement = await createStatement.execute({
      user_id: id,
      type,
      amount,
      description
    });

    transfers.push(statement)

    return response.status(201).json(transfers);
  }
}
