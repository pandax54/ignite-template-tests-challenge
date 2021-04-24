import { hash } from "bcryptjs";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";

let connection: Connection;

describe("Create Statement", () => {
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

  // DEPOSIT
  it("should be able to create an deposit", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@finapi.com", password: "admin" });

    const user_id = responseToken.body.user.id;
    const { token } = responseToken.body;

    const deposit = {
      amount: 100,
      description: "deposit test",
    };

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty("id");
    expect(response.body.user_id).toEqual(user_id);
    expect(response.status).toBe(201);
  });

  it("should not be able to create an deposit with invalid token", async () => {
    const token = "fakeToken";

    const deposit = {
      amount: 100,
      description: "deposit test",
    };

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body.message).toEqual("JWT invalid token!");
    expect(response.status).toBe(401);
  });

  it("should not be able to create an deposit with missing token", async () => {
    const deposit = {
      amount: 100,
      description: "deposit test",
    };

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({
        Authorization: ``,
      });

    expect(response.body.message).toEqual("JWT token is missing!");
    expect(response.status).toBe(401);
  });

  it("should not be able to create an deposit without authorization", async () => {
    const deposit = {
      amount: 100,
      description: "deposit test",
    };

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit);

    expect(response.status).toBe(401);
  });

  it("should not be able to create an deposit without amount", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@finapi.com", password: "admin" });

    const { token } = responseToken.body;

    const deposit = {
      description: "deposit test",
    };

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(500);
  });

  it("should not be able to create an deposit without description", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@finapi.com", password: "admin" });

    const { token } = responseToken.body;

    const deposit = {
      amount: 100,
    };

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(500);
  });

  it("should not be able to create an deposit without amount and without description - Not Send Object", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@finapi.com", password: "admin" });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(500);
  });

  it("should not be able to create an deposit without amount and without description - Send Empty Object", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@finapi.com", password: "admin" });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({})
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(500);
  });

  // WITHDRAW
  it("should be able to create an withdraw", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@finapi.com", password: "admin" });

      const { token } = responseToken.body;
      const user_id = responseToken.body.user.id;

      const deposit = {
        amount: 100,
        description: "deposit test",
      };

      const withdraw = {
        amount: 100,
        description: "withdraw test",
      };

      await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({
        Authorization: `Bearer ${token}`,
      });

      const response = await request(app)
        .post("/api/v1/statements/withdraw")
        .send(withdraw)
        .set({
        Authorization: `Bearer ${token}`,
        });

      expect(response.body).toHaveProperty("id");
      expect(response.body.user_id).toEqual(user_id);
      expect(response.status).toBe(201)
    });

    it("should not be able to create an withdraw with invalid token", async () => {
      const responseToken = await request(app)
        .post("/api/v1/sessions")
        .send({ email: "admin@finapi.com", password: "admin" });
  
      let { token } = responseToken.body;
  
      // Remove o primeiro caractere para adulterar o token
      token = token.replace(/^./, "");
  
      const withdraw = {
        amount: 100,
        description: "withdraw test",
      };
  
      const response = await request(app)
        .post("/api/v1/statements/withdraw")
        .send(withdraw)
        .set({
          Authorization: `Bearer ${token}`,
        });
  
      expect(response.body.message).toEqual("JWT invalid token!");
      expect(response.status).toBe(401);
    });

    it("should not be able to create an withdraw with missing token", async () => {
      const withdraw = {
        amount: 100,
        description: "withdraw test",
      };
  
      const response = await request(app)
        .post("/api/v1/statements/withdraw")
        .send(withdraw)
        .set({
          Authorization: ``,
        });
  
      expect(response.body.message).toEqual("JWT token is missing!");
      expect(response.status).toBe(401);
    });

    it("should not be able to create an withdraw without authorization", async () => {
      const withdraw = {
        amount: 100,
        description: "withdraw test",
      };
  
      const response = await request(app)
        .post("/api/v1/statements/withdraw")
        .send(withdraw);
  
      expect(response.body.message).toEqual("JWT token is missing!");
      expect(response.status).toBe(401);
    });

    it("should not be able to create an withdraw without amount", async () => {
      const responseToken = await request(app)
        .post("/api/v1/sessions")
        .send({ email: "admin@finapi.com", password: "admin" });
  
      const { token } = responseToken.body;
  
      const withdraw = {
        description: "withdraw test",
      };
  
      const response = await request(app)
        .post("/api/v1/statements/withdraw")
        .send(withdraw)
        .set({
          Authorization: `Bearer ${token}`,
        });
  
      expect(response.status).toBe(500);
    });

    it("should not be able to create an withdraw without description", async () => {
      const responseToken = await request(app)
        .post("/api/v1/sessions")
        .send({ email: "admin@finapi.com", password: "admin" });
  
      const { token } = responseToken.body;
  
      const deposit = {
        amount: 200,
        description: "deposit test",
      };
  
      await request(app)
        .post("/api/v1/statements/deposit")
        .send(deposit)
        .set({
          Authorization: `Bearer ${token}`,
        });
  
      const withdraw = {
        amount: 100,
      };
  
      const response = await request(app)
        .post("/api/v1/statements/withdraw")
        .send(withdraw)
        .set({
          Authorization: `Bearer ${token}`,
        });
  
      expect(response.status).toBe(500);
    });
    
  it("should not be able to create an withdraw without amount and without description - Not Send Object", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@finapi.com", password: "admin" });

    const { token } = responseToken.body;

    const deposit = {
      amount: 200,
      description: "deposit test",
    };

    await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(500);
  });

  it("should not be able to create an withdraw without amount and without description - Send Empty Object", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@finapi.com", password: "admin" });

    const { token } = responseToken.body;

    const deposit = {
      amount: 200,
      description: "deposit test",
    };

    await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({})
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(500);
  });

  it("should not be able to create a withdraw if the balance is insufficient", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@finapi.com", password: "admin" });

    const { token } = responseToken.body;

    const withdraw = {
      amount: 100,
      description: "withdraw test",
    };

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send(withdraw)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body.message).toEqual("Insufficient funds");
    expect(response.status).toBe(400);
  });

});
