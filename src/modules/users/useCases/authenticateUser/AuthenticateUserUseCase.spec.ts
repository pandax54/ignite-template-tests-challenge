import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../createUser/ICreateUserDTO"
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError"



let authenticateUserUseCase: AuthenticateUserUseCase
let inMemoryUsersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase

describe("Authenticate user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    )
  })

  it("should be able to authenticate an user", async () =>{
    const user: ICreateUserDTO = {
      name: "User name",
      email: "user@test.com",
      password: "123456"
    };

    await createUserUseCase.execute(user);

    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(result).toHaveProperty("token");

  })

  it("should not be able to authenticate an nonexistent user", () => {
    expect( async () => {
      const result = await authenticateUserUseCase.execute({
        email: "fakeEmail",
        password: "fakePassword",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it("should not be able to authenticate with incorrect password", async () => {
    const user: ICreateUserDTO = {
      name: "User name",
      email: "user@test.com",
      password: "123456"
    };

    await createUserUseCase.execute(user);

    expect( async () => {
      await authenticateUserUseCase.execute({
        email: user.email,
        password: "fakePassword",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})