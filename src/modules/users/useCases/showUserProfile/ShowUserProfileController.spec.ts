import { hash } from "bcryptjs";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";

let connection: Connection;

describe("Create Category Controller", () => {
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

  it("should be able to return the information of an authenticated user", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@finapi.com", password: "admin" });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("email");
    expect(response.body).toHaveProperty("created_at");
    expect(response.body).toHaveProperty("updated_at");
    expect(response.body.email).toEqual("admin@finapi.com");
  });

  it("should not be able to return information for a user with an tampered token", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@finapi.com", password: "admin" });

    let { token } = responseToken.body;

    // Remove o primeiro caractere para adulterar o token
    token = token.replace(/^./, "");

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body.message).toEqual("JWT invalid token!");
    expect(response.status).toBe(401);
  });

  it("should not be able to return information user with invalid token", async () => {
    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer `,
    });

    expect(response.body.message).toEqual("JWT invalid token!");
    expect(response.status).toBe(401);
  });

  it("should not be able to return information user with missing token", async () => {
    const response = await request(app).get("/api/v1/profile").set({
      Authorization: ``,
    });

    expect(response.body.message).toEqual("JWT token is missing!");
    expect(response.status).toBe(401);
  });
});