# Curaa

- Curaa is an Hospital Management System where Doctor and Patient have separate interface. 
- Patients are able to see complete diagnosis, prescriptions and medical history.
- Doctors are able to access patient diagnose history and profile, are able to give diagnosis.

### Technologies Used:

- Frontend: Bootstrap (HTML, CSS, JS)
- Backend: NodeJS, ExpressJS, EJS
- Database: MongoDB, Mongoose

## Installation

After downloading the repository to your local system, follow these steps:

1. Navigate to the downloaded repository.
2. Run the command ***npm init*** to install the required node packages
3. Start the MongoDB server by using the command ***mongod*** in a new tab.
4. To run the application, type the command ***node app.js***. This will start the server and create the database for the application named *minorPDB*.

Application will run on port 3000.

Click on the following link after completing the above steps: [http://localhost:3000/](http://localhost:3000/)

To register a patient, navigate to the register route [http://localhost:3000/register](http://localhost:3000/register) and add the patient's username in the email field along with their password. Please note that the email field should contain only numeric characters.

Registered patients can be viewed on the *mongosh* server. To run the *mongosh* server, type the command ***mongosh*** in new tab.


