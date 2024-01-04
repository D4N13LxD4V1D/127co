import mysql from "mysql2/promise";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

let pool: mysql.Pool | null;

export class Database {
  static async get() {
	if (pool) return pool.getConnection();
    pool = mysql.createPool({
      host: "localhost",
      user: "root",
      password: "",
      database: "cs127",
    });
    return pool!.getConnection();
  }
}

const select = async (table: string, options: any = {}) => {
	const attributes = options.attributes || ['*'];
	const where = options.where
		? `WHERE ${Object.keys(options.where)
				.map((attribute: any) => `${attribute} = '${options.where[attribute]}'`)
				.join(' AND ')}`
		: '';
	const query = `SELECT ${attributes.join(', ')} FROM ${table} ${where};`;
	return await pool!.execute<RowDataPacket[]>(query);
}

const insert = async (table: string, data: any) => {
	const attributes = Object.keys(data);
	const values = attributes.map((attribute: any) => `'${data[attribute]}'`);
	const query = `INSERT INTO ${table} (${attributes.join(', ')}) VALUES (${values.join(', ')});`;
	return await pool!.execute<ResultSetHeader>(query);
}

const update = async (table: string, data: any, options: any = {}) => {
	const attributes = Object.keys(data);
	const values = attributes.map((attribute: any) => `${attribute} = '${data[attribute]}'`);
	const where = options.where
		? `WHERE ${Object.keys(options.where)
				.map((attribute: any) => `${attribute} = '${options.where[attribute]}'`)
				.join(' AND ')}`
		: '';
	const query = `UPDATE ${table} SET ${values.join(', ')} ${where};`;
	return await pool!.execute<ResultSetHeader>(query);
}

const remove = async (table: string, options: any = {}) => {
	const where = options.where
		? `WHERE ${Object.keys(options.where)
				.map((attribute: any) => `${attribute} = '${options.where[attribute]}'`)
				.join(' AND ')}`
		: '';
	const query = `DELETE FROM ${table} ${where};`;
	return await pool!.execute<ResultSetHeader>(query);
}

class ORM {
	[key: string]: any;
	constructor() {
		if (!pool) Database.get();
		pool!.execute<RowDataPacket[]>('SHOW TABLES').then(async ([rows]) => {
			Object.values(rows).map((row: RowDataPacket) => {
				const table = row[`Tables_in_cs127`];
				this[table] = {
					select: select.bind(null, table),
					insert: insert.bind(null, table),
					update: update.bind(null, table),
					remove: remove.bind(null, table),
				};
			});
		});
	}
}

export default new ORM();