import { hash } from "bcryptjs";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";

let connection: Connection;

describe("Get Statement", () => {
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

  beforeEach(async () => {
    await connection.query(`DELETE FROM statements`);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to return a deposit", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@finapi.com", password: "admin" });

    const user_id = responseToken.body.user.id;
    const { token } = responseToken.body;

    const deposit = {
      amount: 100,
      description: "deposit test",
    };

    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({
        Authorization: `Bearer ${token}`,
      });

    const statement_id = responseDeposit.body.id;

    const response = await request(app)
      .get(`/api/v1/statements/${statement_id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty("id");
    expect(response.body.id).toEqual(statement_id);
    expect(response.body.user_id).toEqual(user_id);
    expect(response.body.description).toEqual(deposit.description);
    expect(response.body.amount).toEqual("100.00");
    expect(response.body.type).toEqual("deposit");
    expect(response.status).toBe(200);
  });

  it("should not be able to return a deposit with an incorrect id", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@finapi.com", password: "admin" });

    const { token } = responseToken.body;

    const falseStatementUUID = uuidV4();

    const response = await request(app)
      .get(`/api/v1/statements/${falseStatementUUID}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual("Statement not found");
  });

  it("should not be able to return a deposit without token", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@finapi.com", password: "admin" });

    const { token } = responseToken.body;

    const deposit = {
      amount: 100,
      description: "deposit test",
    };

    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({
        Authorization: `Bearer ${token}`,
      });

    const statement_id = responseDeposit.body.id;

    const response = await request(app).get(
      `/api/v1/statements/${statement_id}`
    );

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("JWT token is missing!");
  });
});