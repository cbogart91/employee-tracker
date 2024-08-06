INSERT INTO department (name)
VALUES  ('Information Technology'),
        ('Human Resources'),
        ('Customer Service'),
        ('Maintenance');

INSERT INTO role (title, salary, department_id)
VALUES  ('Manager', 150000, 1),
        ('Team Leader', 100000, 2),
        ('Sales', 80000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES  ('Derek', 'Schultz', 1, 1),
        ('Bob', 'Dylan', 2, null),
        ('Alex', 'Smith', 1, null),
        ('John', 'Bush', 1, null);
