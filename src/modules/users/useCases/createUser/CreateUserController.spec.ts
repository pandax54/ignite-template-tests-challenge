import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;

const user = {
  name: "User Test",
  email: "usertest@finapi.com",
  password: "test123",
};

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create an user", async () => {
    const response = await request(app).post("/api/v1/users").send(user);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({});
  });

  it("should not be able to create an user already registered", async () => {
    const response = await request(app).post("/api/v1/users").send(user);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual("User already exists");
  });
});