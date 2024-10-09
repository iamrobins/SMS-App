import { DataSource } from "typeorm";
import { User } from "../entity/User";

export const dbClient = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: true, // In production, set to false and use migrations
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});
