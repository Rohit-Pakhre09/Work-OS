import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../models/User.model.js';
import { Role } from '../models/Role.model.js';
import { hashPassword } from '../utils/auth.utils.js';

const seedERP = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('Database connected');

    const roleNames = ['Admin', 'Manager', 'Employee'];
    const rolesMap = {};

    for (const name of roleNames) {
      let role = await Role.findOne({ name });

      if (!role) {
        role = await Role.create({
          name,
          description: `${name} role for ERP system`
        });
        console.log(`${name} role created`);
      }

      rolesMap[name] = role;
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      const hashedPassword = await hashPassword(process.env.ADMIN_PASS);

      adminUser = await User.create({
        name: 'ERP Admin',
        email: adminEmail,
        password: hashedPassword,
        role: rolesMap['Admin']._id,
        isActive: true
      });

      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }

  } catch (error) {
    console.error('Seed error:', error.message);
  } finally {
    console.log('ERP seed completed');
    process.exit(0);
  }
};

seedERP();