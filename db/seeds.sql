INSERT INTO department (name)
VALUES  ('Information Technology'),
        ('Human Resources'),
        ('Customer Service'),
        ('Maintenance');

INSERT INTO roles (title, salary, department_id)
VALUES  ('Manager', 150000, 1),
        ('Team Leader', 100000, 2),
        ('Sales', 80000, 3);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES  ('Derek', 'Schultz', '1'),
        ('Bob', 'Dylan'),
        ('Alex', 'Smith'),
        ('John', 'Bush');
