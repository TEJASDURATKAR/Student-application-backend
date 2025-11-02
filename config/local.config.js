export const config = {
	host: "http://localhost",
	port: 8000,
	baseUrl: "",
	db: {
		host: "localhost",
		port: 3306,
		username: "postgres",
		database: "student-protal002",
		password: "12061206"
	}
};
config.baseUrl = `${config.host}:${config.port}/`;
