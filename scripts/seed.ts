import mongoose from 'mongoose';
import config from '../config';
import userRegisterModel from '../models/user.registerModel';
import Category from '../models/categoryModel';

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database_URL);
    console.log('Connected to MongoDB');

    // Create super admin user
    const existingSuperAdmin = await userRegisterModel.findOne({ email: 'admin@webhub.com' });
    if (!existingSuperAdmin) {
      const superAdmin = new userRegisterModel({
        fullName: 'Super Admin',
        email: 'admin@webhub.com',
        password: 'admin123456',
        phone: '1234567890',
        role: 'super_admin',
        isActive: true,
      });
      await superAdmin.save();
      console.log('✅ Super admin user created');
    } else {
      console.log('ℹ️ Super admin user already exists');
    }

    // Create default categories
    const categories = [
      {
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        sortOrder: 1,
        children: [
          { name: 'Smartphones', description: 'Mobile phones and accessories', sortOrder: 1 },
          { name: 'Laptops', description: 'Laptop computers and accessories', sortOrder: 2 },
          { name: 'Tablets', description: 'Tablet devices and accessories', sortOrder: 3 },
          { name: 'Audio', description: 'Headphones, speakers, and audio equipment', sortOrder: 4 },
        ]
      },
      {
        name: 'Fashion',
        description: 'Clothing and fashion accessories',
        sortOrder: 2,
        children: [
          { name: 'Men\'s Clothing', description: 'Clothing for men', sortOrder: 1 },
          { name: 'Women\'s Clothing', description: 'Clothing for women', sortOrder: 2 },
          { name: 'Shoes', description: 'Footwear for all', sortOrder: 3 },
          { name: 'Accessories', description: 'Fashion accessories', sortOrder: 4 },
        ]
      },
      {
        name: 'Home & Garden',
        description: 'Home improvement and garden supplies',
        sortOrder: 3,
        children: [
          { name: 'Furniture', description: 'Home and office furniture', sortOrder: 1 },
          { name: 'Kitchen', description: 'Kitchen appliances and utensils', sortOrder: 2 },
          { name: 'Garden', description: 'Garden tools and plants', sortOrder: 3 },
          { name: 'Decor', description: 'Home decoration items', sortOrder: 4 },
        ]
      },
      {
        name: 'Sports & Outdoors',
        description: 'Sports equipment and outdoor gear',
        sortOrder: 4,
        children: [
          { name: 'Fitness', description: 'Fitness equipment and accessories', sortOrder: 1 },
          { name: 'Outdoor', description: 'Camping and outdoor gear', sortOrder: 2 },
          { name: 'Team Sports', description: 'Equipment for team sports', sortOrder: 3 },
          { name: 'Water Sports', description: 'Swimming and water sports gear', sortOrder: 4 },
        ]
      },
      {
        name: 'Books & Media',
        description: 'Books, movies, and digital media',
        sortOrder: 5,
        children: [
          { name: 'Books', description: 'Physical and digital books', sortOrder: 1 },
          { name: 'Movies & TV', description: 'DVDs and streaming content', sortOrder: 2 },
          { name: 'Music', description: 'CDs and digital music', sortOrder: 3 },
          { name: 'Games', description: 'Video games and board games', sortOrder: 4 },
        ]
      },
    ];

    for (const categoryData of categories) {
      const existingCategory = await Category.findOne({ name: categoryData.name });
      if (!existingCategory) {
        const category = new Category({
          name: categoryData.name,
          description: categoryData.description,
          sortOrder: categoryData.sortOrder,
        });
        await category.save();
        console.log(`✅ Created category: ${categoryData.name}`);

        // Create subcategories
        for (const childData of categoryData.children) {
          const existingChild = await Category.findOne({ name: childData.name });
          if (!existingChild) {
            const childCategory = new Category({
              name: childData.name,
              description: childData.description,
              parent: category._id,
              sortOrder: childData.sortOrder,
            });
            await childCategory.save();
            console.log(`  ✅ Created subcategory: ${childData.name}`);
          }
        }
      } else {
        console.log(`ℹ️ Category already exists: ${categoryData.name}`);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Default Login Credentials:');
    console.log('Email: admin@webhub.com');
    console.log('Password: admin123456');
    console.log('Role: Super Admin');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedData();
