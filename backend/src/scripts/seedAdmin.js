import dotenv from "dotenv";
import mongoose from 'mongoose';
import { User } from '../models/User.model.js';
import { Role } from '../models/Role.model.js';
import { hashPassword } from '../utils/auth.utils.js';

dotenv.config({path: ".env"});
dotenv.config({path: ".env.local"});

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
    const adminPassword = process.env.ADMIN_PASS;

    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASS must be set in environment variables');
    }

    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      const hashedPassword = await hashPassword(adminPassword);

      const lastEmployee = await User.findOne({}, { employeeId: 1 }, { sort: { createdAt: -1 } });
      let newIdNumber = 1;
      if (lastEmployee && lastEmployee.employeeId && lastEmployee.employeeId.startsWith('EMP')) {
        const lastIdNumber = parseInt(lastEmployee.employeeId.replace('EMP', ''), 10);
        if (!isNaN(lastIdNumber)) {
          newIdNumber = lastIdNumber + 1;
        }
      }
      const employeeId = `EMP${String(newIdNumber).padStart(5, '0')}`;

      adminUser = await User.create({
        employeeId,
        firstName: 'ERP',
        lastName: 'Admin',
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