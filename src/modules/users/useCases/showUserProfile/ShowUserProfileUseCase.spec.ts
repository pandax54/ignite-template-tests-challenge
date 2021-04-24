import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../createUser/ICreateUserDTO"
import { ShowUserProfileError } from "./ShowUserProfileError"
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"



let inMemoryUsersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase
let showUserProfileUseCase: ShowUserProfileUseCase
describe("Show user profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository)

  })

  it("should be able to show user profile", async () =>{
    const user: ICreateUserDTO = {
      name: "User name",
      email: "user@test.com",
      password: "123456"
    };

    const createdUser = await createUserUseCase.execute(user);

    const userProfile = await showUserProfileUseCase.execute(createdUser.id)

    expect(userProfile.email).toEqual(createdUser.email)
    expect(userProfile.id).toEqual(createdUser.id)
    expect(userProfile.name).toEqual(createdUser.name)

  })
  it("should not be able to show a user information if non exists user id", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("abc123");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  })
})