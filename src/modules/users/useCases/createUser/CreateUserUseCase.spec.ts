import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../createUser/ICreateUserDTO"
import { CreateUserError } from "./CreateUserError"



let inMemoryUsersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase

describe("Authenticate user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)

  })

  it("should be able to create a new user", async () =>{
    const user: ICreateUserDTO = {
      name: "User name",
      email: "user@test.com",
      password: "123456"
    };

    const createdUser = await createUserUseCase.execute(user);
    expect(createdUser).toHaveProperty('id')

  })

  it("should not be able to create a new user with email exists", async () => {
    const user: ICreateUserDTO = {
      name: "User name",
      email: "user@test.com",
      password: "123456"
    };

    expect(async () => {
      await createUserUseCase.execute(user);
      await createUserUseCase.execute(user);
    }).rejects.toBeInstanceOf(CreateUserError)
  })

})