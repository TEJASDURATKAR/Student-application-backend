export const config = {
	host: "http://localhost",
	port: 8000,
	baseUrl: "",
	db: {
		host: "localhost",
		port: 3306,
		username: "",
		database: "",
		password: ""
	  }
  };
config.baseUrl = `${config.host}:${config.port}/`;