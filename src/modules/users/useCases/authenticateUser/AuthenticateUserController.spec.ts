import { hash } from "bcryptjs";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";

let connection: Connection;

describe("Authenticate Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
        VALUES('${id}', 'admin', 'admin@finapi.com', '${password}', 'now()', 'now()')
      `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to return user's informations with token", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@finapi.com", password: "admin" });

    expect(response.body).toHaveProperty("user");
    expect(response.body).toHaveProperty("token");
    expect(response.body.user.email).toEqual("admin@finapi.com");
  });

  it("should not be able to return user's informations with non-existent email", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@finapi.com",
      password: "admin",
    });

    expect(response.body).not.toHaveProperty("user");
    expect(response.body).not.toHaveProperty("token");
    expect(response.body.message).toEqual("Incorrect email or password");
  });

  it("should not be able to return user's informations with wrong password", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@finapi.com",
      password: "falsepassword",
    });

    expect(response.body).not.toHaveProperty("user");
    expect(response.body).not.toHaveProperty("token");
    expect(response.body.message).toEqual("Incorrect email or password");
  });
});