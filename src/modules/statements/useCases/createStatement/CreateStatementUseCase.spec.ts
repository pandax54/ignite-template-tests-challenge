import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { OperationType } from '@modules/statements/entities/Statement'
import { ICreateUserDTO } from "@modules/users/useCases/createUser/ICreateUserDTO";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { AppError } from "@shared/errors/AppError";
import { CreateStatementError } from "./CreateStatementError";


let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase

async function createFakeUser(username: string, email: string) {
  const user: ICreateUserDTO = {
    name: username,
    email: email,
    password: "123456"
  };

  const userCreated = await createUserUseCase.execute(user);

  return userCreated
}


describe("Create Statements", () => {
  
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should not be able to create statement of type deposit", async () => {

    const user = await createFakeUser("brunosito", "brunosito@email.com")
    const response = await createStatementUseCase.execute({
      user_id: user.id as string, 
      type: OperationType.DEPOSIT, 
      amount: 100, 
      description: "Empréstimo" 
    })

    expect(response).toHaveProperty('id')
    expect(response.type).toEqual('deposit')
    expect(response.amount).toEqual(100)

  });

  it("should not be able to create statement of an user non existent", async () => {
    const statement = {
      user_id: "fakeUser", 
      type: OperationType.DEPOSIT, 
      amount: 100, 
      description: "Empréstimo" 
    }

    expect(async () => {
      await createStatementUseCase.execute(statement)
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it("should be able to create statement of type withdraw", async () => {

    const user = await createFakeUser("brunosito", "brunosito@email.com")
    
    await createStatementUseCase.execute({
      user_id: user.id as string, 
      type: OperationType.DEPOSIT, 
      amount: 100, 
      description: "Empréstimo" 
    })
    
    const response = await createStatementUseCase.execute({
      user_id: user.id as string, 
      type: OperationType.WITHDRAW, 
      amount: 50, 
      description: "Pizza" 
    })

    expect(response).toHaveProperty('id')
    expect(response.type).toEqual('withdraw')
    expect(response.amount).toEqual(50)

  });

  it("should not be able to make an withdraw type statement if the withdraw is greater than the balance", async () => {

    const user = await createFakeUser("brunosito", "brunosito@email.com")
    
    await createStatementUseCase.execute({
      user_id: user.id as string, 
      type: OperationType.DEPOSIT, 
      amount: 100, 
      description: "Empréstimo" 
    })
  

    expect(async () => {
      await createStatementUseCase.execute({
        user_id: user.id as string, 
        type: OperationType.WITHDRAW, 
        amount: 150, 
        description: "Pizza" 
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)

  });
});
