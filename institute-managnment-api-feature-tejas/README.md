# Techo-Secure-App-Backend

## How to Create a New Table and Model

### Prerequisites
- Install the ESLint plugin for VS Code.
- Install Sequelize CLI and Husky by running the following command:
  ```bash
  npm install --save-dev
  npm install --save-dev prettier
  npm install -g sequelize-cli
  npm install eslint husky --save-dev
  npm install eslint-plugin-node@latest --save-dev
  npm install eslint-plugin-node babel-eslint --save-dev
  npm install eslint --save-dev
  ```

### Create New Model

    ```bash
    npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string
    ```

### Create New Migration
     ```bash
     npx sequelize-cli migration:generate --name add-column-to-users
     ```


### Create a new migration table & model at once:
    ```bash
    npx sequelize-cli model:generate --name Product --attributes name:string,price:decimal
    ```

### Alter Table
    ```bash
    npx sequelize-cli migration:generate --name alter-table
    Make sure that your migration file looks like

    'use strict';
        module.exports = {
        up: (queryInterface, Sequelize) => {
            return queryInterface.addColumn('TableName', 'columnName', {
            type: Sequelize.STRING,
            allowNull: false,
            });
        },

        down: (queryInterface, Sequelize) => {
            return queryInterface.removeColumn('TableName', 'columnName');
        },
        };
    ```

### Migrate the table by running the following command. By default, it selects the development environment.
    ```bash
    # Migrate tables locally
    npx sequelize-cli --env local db:migrate

    # Migrate tables in stagging
    npx sequelize-cli --env development db:migrate
    ```

### Create a new seeder by running the following command:

    ```bash
    # For local environment
    NODE_ENV=local npx sequelize-cli db:seed --seed 001-create-admin.js
    ```

### Undo migration by running the following command:

    ```bash
    npx sequelize-cli db:migrate:undo
    ```

### Make sure to add the following line in each migration code:

    ```bash
    const sequelize = require('../config/db.config');
    ```
### Run Seeder with the local environment:

    ```bash
        NODE_ENV=local sequelize db:seed:all
    ```
    npx sequelize-cli db:seed:all

### Create the  migration table:

    ```bash
    npx sequelize-cli migration:generate --name create-<table_name>-table
    ```
### Create a migration table with a model:

    ```bash
    npx sequelize-cli model:generate --name <MoelName> --attributes field_name:string
    ```

### TO Drop Data From DB
    ` SET session_replication_role = replica;
    ` DROP SCHEMA public CASCADE;
    ` CREATE SCHEMA public;

### Events For Web



### Other Command TO Refresh Local DB
npx sequelize-cli --env local db:migrate:undo:all && npx sequelize-cli --env local db:migrate
npx sequelize-cli --env production db:migrate:undo:all && npx sequelize-cli --env production db:migrate

### command to migrate
npx sequelize-cli db:migrate


### ====================================================================================================
### Enum appointments DONE cast failed solution
-- Step 1: Drop the existing ENUM type
DROP TYPE IF EXISTS enum_Appointments_status;

-- Step 2: Create a new ENUM type
CREATE TYPE enum_Appointments_status AS ENUM ('BOOKED', 'CANCELLED', 'RESCHEDULED', 'DONE');

### If third step giving error then follow below steps and repeate this step
-- Step 3: Alter the column to use the new ENUM type 
ALTER TABLE "Appointment" ALTER COLUMN "status" TYPE enum_Appointments_status USING "status"::text::enum_Appointments_status;


### Steps if above third step failed
-- Step 1: Drop the default constraint
ALTER TABLE "Appointment" ALTER COLUMN "status" DROP DEFAULT;

-- Step 2: Alter the column type to temporary string
ALTER TABLE "Appointment" ALTER COLUMN "status" TYPE VARCHAR(255);

-- Step 3: Add a new temporary column with the new ENUM type
ALTER TABLE "Appointment" ADD COLUMN "status_temp" enum_Appointments_status;

-- Step 4: Update the temporary column with the existing values and cast the expression
UPDATE "Appointment" SET "status_temp" = "status"::enum_Appointments_status;

-- Step 5: Drop the existing "status" column
ALTER TABLE "Appointment" DROP COLUMN "status";

-- Step 6: Rename the temporary column to "status"
ALTER TABLE "Appointment" RENAME COLUMN "status_temp" TO "status";

-- Step 7: Add the default value constraint
ALTER TABLE "Appointment" ALTER COLUMN "status" SET DEFAULT 'BOOKED'::enum_Appointments_status;


ALTER TYPE "enum_Appointments_appointment_type" ADD VALUE 'LABTEST' AFTER 'VACCINATION';
