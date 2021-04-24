export default {
  jwt: {
    secret: process.env.JWT_SECRET as string || "secret",
    expiresIn: '1d'
  }
}
