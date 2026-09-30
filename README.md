Credit Card Payment System



A full-stack Credit Card Payment System built using React, Tailwind CSS, Django REST Framework, FastAPI, and MySQL.



Technologies

Frontend: React + Tailwind CSS

Backend: Django REST Framework + FastAPI

Database: MySQL

Authentication: JWT

API Testing: Postman

Features

Authentication

User registration

JWT login

Protected APIs

Passwords stored securely using Django password hashing

Card Management

Add credit/debit cards

View saved cards

Delete cards

Only masked card number and last 4 digits are stored

CVV and full card numbers are not stored

Payments

Payment processing through FastAPI

Simulated payment success/failure

Transaction starts as PENDING

Final status becomes SUCCESS or FAILED

JWT authentication is required

Transactions

View transaction history

Filter transactions by status

Filter by amount/date

Payment reference tracking

Django Admin

Manage users

View cards

View transactions

Daily payment summary

CSV transaction export

Project Structure

credit-card-payment-system/

│

├── backend/

│   ├── django\_app/

│   │   ├── users/

│   │   ├── cards/

│   │   ├── transactions/

│   │   ├── admin\_logs/

│   │   ├── fastapi\_app/

│   │   ├── config/

│   │   └── manage.py

│   └── requirements.txt

│

├── frontend/

│   └── React application

│

├── database/

│

└── README.md

Running the Project

1\. Start Django

cd backend\\django\_app

venv\\Scripts\\activate

python manage.py runserver 127.0.0.1:8000



Django runs at:



http://127.0.0.1:8000/

2\. Start FastAPI



Open another Command Prompt:



cd backend\\django\_app

venv\\Scripts\\activate

uvicorn fastapi\_app.main:app --host 127.0.0.1 --port 8001



FastAPI runs at:



http://127.0.0.1:8001/

3\. Start React



Open another Command Prompt:



cd frontend

npm run dev



The React application will be available at the Vite URL shown in the terminal.



API Endpoints

Method	Endpoint	Purpose

POST	/api/token/	JWT Login

GET	/api/cards/	Get saved cards

POST	/api/cards/	Create card

DELETE	/api/cards/{id}/	Delete card

POST	/api/payments/	Make payment

GET	/api/transactions/	Get transactions

Database



Database: MySQL



Database name:



credit\_card\_db



A MySQL database dump is included with the project submission.



Security

JWT authentication implemented

Protected APIs require authentication

Django securely hashes passwords

Full card numbers are not stored

CVV is not stored

Card ownership is validated

Internal payment-service endpoints use an internal API key

No real payment gateway is used

Testing



The APIs were tested using Postman.



Tested successfully:



Login — 200 OK

Get Cards — 200 OK

Create Card — 201 Created

Make Payment — 200 OK

Get Transactions — 200 OK

Transaction status filtering — 200 OK

Notes



This project uses simulated payment processing for demonstration purposes and does not process real payments.

