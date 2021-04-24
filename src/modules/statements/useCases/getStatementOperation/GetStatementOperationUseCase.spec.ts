import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { OperationType } from '@modules/statements/entities/Statement'
import { ICreateUserDTO } from "@modules/users/useCases/createUser/ICreateUserDTO";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { AppError } from "@shared/errors/AppError";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";


let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase
let createStatementUseCase: CreateStatementUseCase
let getStatementOperationUseCase: GetStatementOperationUseCase
async function createFakeUser(username: string, email: string) {
  const user: ICreateUserDTO = {
    name: username,
    email: email,
    password: "123456"
  };

  const userCreated = await createUserUseCase.execute(user);

  return userCreated
}

describe("Get Operation details", () => {
  
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    )
  });

  it("should be able to list statement of an user", async () => {

    const user = await createFakeUser("brunosito", "brunosito@email.com")
    
    const statement = await createStatementUseCase.execute({
      user_id: user.id as string, 
      type: OperationType.DEPOSIT, 
      amount: 100, 
      description: "Empréstimo" 
    })

    const result = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id
    })

    expect(result).toHaveProperty('id')
    expect(result.type).toEqual('deposit')
    expect(result.amount).toEqual(100)

  });

  it("should be able to list statement of an user", async () => {

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "fakeUser",
        statement_id: "fakeStatement"
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)

  });

  it("should not be able to list a non existent statement", async () => {

    const user = await createFakeUser("brunosito", "brunosito@email.com")

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: user.id,
        statement_id: "fakeStatement"
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)

  });

});
