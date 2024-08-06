const { prompt } = require('inquirer');
const { Pool } = require('pg');
const cTable = require('console.table');

const pool = new Pool (
    {
        user: 'postgres',
        password: 'pokemon1',
        host: 'localhost',
        database: 'employeetracker_db'
    },
    console.log('Connected to employeetracker_db database.')
);

const choicesArray = [
    "View all departments",
    "View all roles",
    "View all employees",
    "Add a department",
    "Add a role",
    "Add an employee",
    "Update an employee role",
];

prompt([
    {
        type: "list",
        name: "choice",
        message: "Hello, what would you like to do?",
        choices: choicesArray,
      },
    ]).then(( { choice }) => {
        switch (choice) {
            case "View all departments":
                viewTable('SELECT * FROM department');
                break;
            case "View all roles":
                viewTable(`SELECT role.id, title, salary, name AS department 
                    FROM role
                    JOIN department on ROLE.department_id = department.id`);
                break;
            case "View all employees":
                viewAllEmployees();
                break;
            case "Add a department":
                addDepartment();
                break;
            case "Add a role":
                addRole();
                break;
            case "Add an employee":
                addEmployee();
                break;
            case "Update an employee role":
                updateEmployeeRole();
                break;
            default:
                console.log("Goodbye");
        }
    });

    function viewTable(queue) {
        pool.query(queue).then(({ rows }) => {
          console.table(rows);
          pool.end();
        })
        .catch((err) => {
          console.error("Error excusting query", err);
          pool.end();
        });
      }
      
      function viewAllEmployees() {
        viewTable(`
          SELECT e1.id, e1.first_name, e1.last_name, role.title AS title, role.salary, department.name AS department, CONCAT(e2.first_name, ' ', e2.last_name) AS manager
          FROM employee e1 
          JOIN role ON e1.role_id = role.id 
          JOIN department ON role.department_id = department.id
          LEFT JOIN employee e2 ON e1.manager_id = e2.id
        `);
      }
      
      function addDepartment() {
        prompt([
        {
          type: "input",
          name: "input",
          message: "Enter the name of the new department:",
        },
        ]).then(({ input }) => {
          pool.query("INSERT INTO department (name) VALUES ($1)", [input])
            .then((data) => {
              console.log(`Added new department '${input}'`);
              pool.end();
            })
            .catch((err) => {
              console.error("Error when adding department", err);
              pool.end();
            });
        });
      }
      
      async function addRole() {
        const departments = await getDepartments();
        prompt([
          {
            type: "input",
            name: "title",
            message: "Enter the title of new role:",
          },
          {
            type: "input",
            name: "salary",
            message: "Enter the salary of the new role:",
          },
          {
            type: "list",
            name: "department",
            message: "Select the department for new role:",
            choices: departments.map((dept) => dept.name),
          },
        ]).then(({ title, salary, department }) => {
          const findDepartment = departments?.find((dept) => dept.name === department).id;
          pool.query("INSERT INTO role (title, salary, department) VALUES ($1, $2, $3)", [title, salary, findDepartment])
            .then(() => {
              console.log(`Added new role '${title}'`);
              pool.end();
            })
            .catch((err) => {
              console.error("Error when adding new role!", err);
              pool.end();
            });
        });
      };
      
      async function addEmployee() {
        const roles = await getRoles();
        const managers = await getAvailableManagers();
        prompt([
          {
            type: "input",
            name: "first_name",
            message: "Enter the employee's first name:",
          },
          {
            type: "input",
            name: "last_name",
            message: "Enter the employee's last name:",
          },
          {
            type: "list",
            name: "role",
            message: "Select the employee role:",
            choices: roles.map((role) => role.title),
          },
          {
            type: "list",
            name: "manager",
            message: "Select the employee manager:",
            choices: managers.map((manager) => manager.name),
          },
        ]).then(({ first_name, last_name, role, manager}) => {
          const role_id = roles.find((r) => r.title === role).id;
          const manager_id = managers.find((m) => m.name === manager).employee_id;
          pool.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)",
            [first_name, last_name, role_id, manager_id])
          .then((result) => {
            console.log(`Added new employee '${first_name} ${last_name}'`);
            pool.end();
          })
          .catch((err) => {
            console.error("Error when adding new employee!", err);
            pool.end();
          });
        });
      }
      
      async function updateEmployeeRole() {
        const employees = await getEmployees();
        const roles = await getRoles();
        prompt([
          {
            type: "list",
            name: "employee",
            message: "Select the employee to update:",
            choices: employees.map((emp) => `${emp.first_name} ${emp.last_name}`),
          },
          {
            type: "list",
            name: "role",
            message: "Select the new role",
            choices: roles.map((role) => role.title),
          },
        ]).then (({ employee, role}) => {
          const employee_id = employees.find((emp) => `${emp.first_name} ${emp.last_name}` === employee).id;
          const role_id = roles.find((r) => r.title === role).id;
          pool.query("UPDATE employee SET role_id = $1 WHERE id = $2", [role_id, employee_id,])
        })
        .then(() => {
          console.log(`Updated employee '${employees}' role to '${roles}'`);
          pool.end();
        })
        .catch((err) => {
          console.error("Error when updating employees role!", err);
          pool.end();
        });
      }
      
      async function getDepartments() {
        const { rows } = await pool.query("SELECT * FROM department");
        return rows;
      }
      
      async function getRoles() {
        const { rows } = await pool.query("SELECT * FROM role");
        return rows;
      }
      
      async function getEmployees() {
        const { rows } = await pool.query("SELECT * FROM employee");
        return rows;
      }
      
      async function getAvailableManagers() {
        const employees = await getEmployees();
        const managers = employees.map(({ first_name, last_name, id}) => ({
          name: `${first_name} ${last_name}`,
          employee_id: id,
        }));
        managers.unshift({name: "NONE", employee_id: null });
        return managers;
      }