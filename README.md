# ReTech – Full Stack E-Commerce Platform

**Rethink Tech. Choose ReTech.**

ReTech is a full-stack e-commerce web application for buying refurbished electronics, including laptops, smartphones, tablets, and accessories. The platform aims to make technology more affordable while encouraging sustainable consumption through device reuse.

Built with **Angular, Spring Boot, and MySQL**, ReTech provides a responsive shopping experience for customers and a dedicated administration portal for managing products, orders, and inventory.

## Features

### Customer Module
- Customer registration, login, and logout
- Browse refurbished electronic products
- Search, filter, and sort products
- View product descriptions, condition grades, and warranty details
- Compare up to three products
- Add products to wishlist
- Shopping cart with quantity management
- Checkout with delivery information
- Cash on Delivery and simulated online payment
- Order history and order status tracking

### Admin Module
- Secure administrator login
- Dashboard with product, order, and sales statistics
- Add, update, and delete products
- Manage product pricing, stock, images, and warranty
- View and manage customer orders
- Update order status
- Inventory analytics and low-stock monitoring

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Angular, TypeScript, HTML, CSS |
| Backend | Java, Spring Boot |
| Security | Spring Security, BCrypt |
| Database | MySQL |
| ORM | Spring Data JPA, Hibernate |
| API | RESTful Web Services |
| Build Tools | Maven, Angular CLI, npm |
| Development Tools | VS Code, MySQL Workbench, Git, GitHub |

## Project Structure

```text
ReTech/
├── retech-frontend/             # Angular application
├── retech-backend/
│   └── retech-backend/          # Spring Boot application
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

Install the following:

- Java 21
- Node.js and npm
- Angular CLI
- MySQL Server
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/roshansah-ai/ReTech.git
cd ReTech
```

### 2. Configure the Database

Create a MySQL database:

```sql
CREATE DATABASE retech_db;
```

Create `application.properties` inside:

`retech-backend/retech-backend/src/main/resources/`

Example configuration:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/retech_db
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

server.port=8080
```

Set `DB_USERNAME` and `DB_PASSWORD` as environment variables with your local MySQL credentials.

**Security:** The actual `application.properties` is excluded from Git to prevent database credentials from being published.

### 3. Start the Spring Boot Backend

```bash
cd retech-backend/retech-backend
./mvnw spring-boot:run
```

On Windows Command Prompt, use `mvnw.cmd spring-boot:run`.

Backend URL: `http://localhost:8080`

### 4. Start the Angular Frontend

Open a second terminal in the repository root:

```bash
cd retech-frontend
npm install
npx ng serve --port 4300
```

Frontend URL: `http://localhost:4300`

## API Overview

| Endpoint | Purpose |
|---|---|
| `/api/products` | Product operations |
| `/api/auth/register` | Customer registration |
| `/api/auth/login` | Customer login |
| `/api/auth/logout` | Customer logout |
| `/api/auth/me` | Current customer information |
| `/api/orders` | Order operations |
| `/api/orders/history` | Customer order history |
| `/api/admin/orders` | Administrator order management |
| `/api/admin/dashboard` | Administrator dashboard data |

HTTP methods and access permissions depend on the operation.

## Database

The application uses the `retech_db` MySQL database with the following core tables:

- `customers`
- `products`
- `orders`
- `order_items`

Spring Data JPA and Hibernate are used for persistence and entity relationships.

## Security

- Role-based access for customers and administrators
- Password hashing using BCrypt
- Spring Security authorization
- Protected administrator functionality
- Sensitive configuration excluded from version control

Administrator credentials must be configured securely in the backend environment.

## Order Workflow

Orders progress through the following statuses:

`PLACED → CONFIRMED → SHIPPED → DELIVERED`

Orders may also be marked `CANCELLED`.

Online payment is simulated for demonstration purposes. No real payment gateway is integrated.

## Future Enhancements

- Real payment gateway integration
- Email and SMS notifications
- Product reviews and ratings
- Advanced product recommendations
- Shipment tracking integration
- Cloud deployment
- Additional reporting and analytics

## Project Purpose

ReTech was developed as a full-stack academic software project to demonstrate frontend development, backend REST API implementation, relational database integration, authentication, authorization, and e-commerce workflow management.

## Author

**Roshan Sah**

GitHub: [roshansah-ai](https://github.com/roshansah-ai)

## License

This project is intended for educational and demonstration purposes. No open-source license has been specified.
