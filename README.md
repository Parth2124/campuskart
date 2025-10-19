# CampusKart - Campus Marketplace

A comprehensive campus marketplace platform where students can buy, sell, and borrow items like lab coats, textbooks, electronics, and more.

## Features

### 🏠 **Homepage**
- **Header**: CampusKart branding with navigation menu
- **Hero Section**: Welcome message with animated floating icons
- **About Section**: Information about the platform's purpose
- **Call-to-Action**: Browse items and sell something buttons

### 🔍 **Search & Filtering**
- **Search Bar**: Find items by title or description
- **Category Filter**: Books, Electronics, Clothing, Lab Equipment, Sports, Other
- **Mode Filter**: Buy, Borrow, Free
- **Clear Filters**: Reset all filters to default

### 🛍️ **Marketplace**
- **Item Cards**: Display items with images, titles, prices, and descriptions
- **Seller Information**: Name, email, and class of the seller
- **Contact Button**: Direct communication with sellers
- **View Toggle**: Switch between grid and list views

### 👤 **User Authentication**
- **Login/Register**: Secure user authentication system
- **User Profiles**: View personal items and order history
- **Role Management**: Regular users and admin roles

### 📦 **Item Management**
- **Add Items**: Upload items with images, descriptions, and pricing
- **Admin Approval**: Items require admin approval before listing
- **Status Tracking**: Pending, Approved, Rejected statuses

### 🎯 **Admin Panel**
- **Pending Items**: Review and approve/reject new listings
- **User Management**: Monitor user activities
- **Content Moderation**: Ensure quality and appropriate content

### 📱 **Responsive Design**
- **Mobile-First**: Optimized for all device sizes
- **Touch-Friendly**: Mobile navigation and interactions
- **Modern UI**: Clean, intuitive interface with smooth animations

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Styling**: CSS Grid, Flexbox, CSS Variables
- **Icons**: Font Awesome
- **Fonts**: Inter (Google Fonts)

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd campuskart
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Database Setup
1. Create a MySQL database named `campuskart`
2. Update database credentials in `server.js` if needed:
   ```javascript
   const db = mysql.createConnection({
       host: 'localhost',
       user: 'root',
       password: '', // Your MySQL password
       database: 'campuskart'
   });
   ```

### Step 4: Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=campuskart
JWT_SECRET=your_secret_key_here
```

### Step 5: Start the Application
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:3000`

## Default Admin Account

The system automatically creates an admin user:
- **Email**: admin@campuskart.com
- **Password**: admin123

**Important**: Change the default admin password after first login!

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Items
- `GET /api/items` - Get all approved items (with filters)
- `POST /api/items` - Add new item (authenticated)
- `GET /api/user/items` - Get user's items (authenticated)

### Orders
- `POST /api/orders` - Create new order (authenticated)
- `GET /api/user/orders` - Get user's orders (authenticated)

### Admin
- `GET /api/admin/pending-items` - Get pending items (admin only)
- `PUT /api/admin/items/:id/status` - Approve/reject item (admin only)

## Database Schema

### Users Table
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password
- `class` - User's academic class/year
- `role` - User role (user/admin)
- `created_at` - Account creation timestamp

### Items Table
- `id` - Primary key
- `title` - Item title
- `description` - Item description
- `price` - Item price (0 for free items)
- `category` - Item category
- `mode` - Sale mode (buy/borrow/free)
- `image_url` - Item image path
- `seller_id` - Foreign key to users table
- `status` - Approval status (pending/approved/rejected)
- `created_at` - Listing creation timestamp

### Orders Table
- `id` - Primary key
- `item_id` - Foreign key to items table
- `buyer_id` - Foreign key to users table
- `seller_id` - Foreign key to users table
- `status` - Order status (pending/completed/cancelled)
- `created_at` - Order creation timestamp

## Usage Guide

### For Students (Buyers)
1. **Browse Items**: Use search and filters to find what you need
2. **Contact Sellers**: Click "Contact Seller" to message the seller
3. **Place Orders**: Complete transactions through the platform
4. **Track Orders**: Monitor your order history in your profile

### For Students (Sellers)
1. **Create Account**: Register with your campus email
2. **Add Items**: Upload photos and descriptions of items
3. **Set Pricing**: Choose between sale, borrow, or free
4. **Wait for Approval**: Items are reviewed by admin before listing
5. **Manage Listings**: Track item status and respond to inquiries

### For Administrators
1. **Review Items**: Approve or reject new listings
2. **Monitor Users**: Track user activities and listings
3. **Maintain Quality**: Ensure appropriate content and pricing
4. **Support Users**: Help resolve issues and disputes

## Security Features

- **Password Hashing**: Bcrypt encryption for user passwords
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: Restricted file types and sizes
- **SQL Injection Prevention**: Parameterized queries
- **CORS Protection**: Cross-origin resource sharing configuration

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- **Email**: support@campuskart.com
- **Documentation**: Check the code comments and API documentation
- **Issues**: Report bugs and feature requests through GitHub Issues

## Future Enhancements

- **Real-time Chat**: Direct messaging between buyers and sellers
- **Payment Integration**: Secure payment processing
- **Rating System**: User reviews and ratings
- **Mobile App**: Native iOS and Android applications
- **Analytics Dashboard**: Sales and user activity insights
- **Email Notifications**: Automated alerts for orders and messages

---

**CampusKart** - Making campus life easier, one transaction at a time! 🎓🛍️
