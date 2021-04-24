import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { OperationType } from '@modules/statements/entities/Statement'
import { ICreateUserDTO } from "@modules/users/useCases/createUser/ICreateUserDTO";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { AppError } from "@shared/errors/AppError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";


let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase
let createStatementUseCase: CreateStatementUseCase

async function createFakeUser(username: string, email: string) {
  const user: ICreateUserDTO = {
    name: username,
    email: email,
    password: "123456"
  };

  const userCreated = await createUserUseCase.execute(user);

  return userCreated
}

describe("Get Balance", () => {
  
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
  });

  it("should be able to get the balance from an user", async () => {

    const user = await createFakeUser("brunosito", "brunosito@email.com")
    
    await createStatementUseCase.execute({
      user_id: user.id as string, 
      type: OperationType.DEPOSIT, 
      amount: 100, 
      description: "Empréstimo" 
    })

    await createStatementUseCase.execute({
      user_id: user.id as string, 
      type: OperationType.WITHDRAW, 
      amount: 50, 
      description: "Pizza" 
    })
    const response = await getBalanceUseCase.execute({
      user_id: user.id as string, 
    })

    expect(response.balance).toEqual(50)
    expect(response.statement.length).toEqual(2)

  });

  it("should not be able to get the balance from a not register user", async () => {

    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "fakeUser", 
      })
    }).rejects.toBeInstanceOf(GetBalanceError)

  });
});
