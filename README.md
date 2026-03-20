# Elcardo Helpdesk

Elcardo Helpdesk is a modern, robust ticketing and support system built with Laravel and React. It provides a comprehensive suite of tools for managing customer inquiries, tracking support tickets, enforcing SLA policies, and maintaining a knowledge base.

## Features

- **Role-Based Access Control:** Distinct dashboards and permissions for Users, Admins, and Super Admins.
- **Ticketing System:** Create, manage, assign, and resolve support tickets efficiently.
- **Knowledge Base:** Integrated article management to provide self-help resources for users.
- **SLA Management:** Define and enforce Service Level Agreements to ensure timely communication and resolutions.
- **Modern UI:** Built with React, Tailwind CSS, and Inertia.js for a fast, seamless single-page application experience.

## Tech Stack

- **Backend:** Laravel
- **Frontend:** React, Inertia.js, Tailwind CSS
- **Database:** MySQL / SQLite
- **Authentication:** Laravel Sanctum / Breeze

## Getting Started

1. Clone the repository
2. Install PHP dependencies: `composer install`
3. Install Node dependencies: `npm install`
4. Copy `.env.example` to `.env` and configure your database settings
5. Generate application key: `php artisan key:generate`
6. Run database migrations and seeders: `php artisan migrate --seed`
7. Start the development servers: `php artisan serve` and `npm run dev`

## License

The Elcardo Helpdesk project is proprietary software. All rights reserved.
