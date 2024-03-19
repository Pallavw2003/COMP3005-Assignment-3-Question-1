const { Client } = require('pg');
const readline = require('readline');


const db_user = 'postgres';
const db_password = 'postgres';
const db_host = 'localhost';
const db_port = 5432;
const db_database = 'Assignment3';
const connectionString = `postgresql://${db_user}:${db_password}@${db_host}:${db_port}/${db_database}`;

// using the defined connection string to create a new client
const client = new Client({
    connectionString: connectionString,
});

async function connect() {
    try {
        await client.connect();
        console.log(`Connected to the ${db_database} database as user ${db_user}`);
    } catch (err) {
        console.error("Could not connect to the database. Encountered the following error: ", err);
    }
}

// selects all students to the database
async function getAllStudents() {
    try {
        const students = await client.query(
            'SELECT * FROM students;'
        );
        return students.rows;
    } catch (err) {
        console.error("Could not select students from the database. Encountered the following error: ", err);
        return null;
    }
}

// adds a new student to the database
async function addStudent(first_name, last_name, email, enrollment_date) {
    try {
        await client.query(
            'INSERT INTO students (first_name, last_name, email, enrollment_date) VALUES ($1, $2, $3, $4);',
            [first_name, last_name, email, enrollment_date]
        );

        console.log(`Successfully added ${first_name} to the database.`);
    } catch (err) {
        console.error(`Could not add ${first_name} to the database. Encountered the following error: `, err);
    }
}

// update's a student (with the matching student_id)'s email address
async function updateStudentEmail(student_id, new_email) {
    try {
        await client.query(
            'UPDATE students SET email = $1 WHERE student_id = $2',
            [new_email, student_id]
        );
        console.log(`Student #${student_id} email updated in the database!`);
    } catch (err) {
        console.error(`Could not update student #${student_id}'s email in the database. Encountered the following error: `, err);
    }
}

async function deleteStudent(student_id) {
    try {
        await client.query(
            'DELETE FROM students WHERE student_id = $1', [student_id]
        );
        console.log(`Student #${student_id} successfully deleted from the database!`);
    } catch (err) {
        console.error(`Could not delete student #${student_id}'s from the database. Encountered the following error: `, err);
    }
}

async function main() {
    await connect();

    const readLine = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log("Choose your action (by selecting its corresponding number):");
    console.log("1. View all of the students in the DB");
    console.log("2. Add a new student to the DB");
    console.log("3. Update a student's email inside the DB");
    console.log("4. Delete a student inside the DB.");

    await readLine.question("Choose: ", async (choice) => {
        switch(choice) {
            case '1':
                // retrieve and displays all records from the students table
                const students = await getAllStudents();
                console.log("The following are all the students in the database: ")
                console.log(students);

                readLine.close();
                await client.end();

                break;
            case '2':
                // add a new student to the students table in the database
                let first_name;
                let last_name;
                let email;
                let enrollment_date;
                await readLine.question("What's the student's first name? ", async (answer) => { 
                    first_name = answer;

                    await readLine.question("What's the student's last name? ", async (answer) => {
                        last_name = answer; 
                        
                        await readLine.question("What's the student's email? ", async (answer) => {
                            email = answer;

                            await readLine.question("What's the student's enrollement date (in the format YYYY-MM-DD)? ", async (answer) => { 
                                enrollment_date = answer; 

                                await addStudent(first_name, last_name, email, enrollment_date);

                                const students = await getAllStudents();
                                console.log("The following are all the students in the database: ")
                                console.log(students);

                                readLine.close();
                                await client.end();
                            });
                        });
                    });
                });

                break;
            case '3': 
                // update an existing student's email address in the database
                let student_id;
                let new_email;

                await readLine.question("What's the student's student ID? ", async (answer) => { 
                    student_id = answer; 

                    await readLine.question("What's the student's new email? ", async (answer) => { 
                        new_email = answer;
                        
                        await updateStudentEmail(student_id, new_email);
                        
                        const students = await getAllStudents();
                        console.log("The following are all the students in the database: ")
                        console.log(students); 

                        readLine.close();
                        await client.end();
                    });
                });

                break;
            
            case '4':
                // deleting an existing student from the database
                let deleted_student_id;
                await readLine.question("What's the student's student ID? ", async (answer) => { 
                    deleted_student_id = answer; 

                    await deleteStudent(deleted_student_id);
                    const students = await getAllStudents();
                    console.log("The following are all the students in the database: ")
                    console.log(students); 

                    readLine.close();
                    await client.end();
                });
        }
    });
}

main();