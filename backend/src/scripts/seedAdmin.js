import 'dotenv/config';
import { connectDB } from '../config/db.config.js';
import { User } from '../models/User.model.js';
import { Role } from '../models/Role.model.js';
import { Permission } from '../models/Permission.model.js';
import { hashPassword } from '../utils/auth.utils.js';

const seedData = async () => {
  try {
    await connectDB(process.env.DB_URI);
    console.log('Database connected.');

    const permissionsToSeed = [
      { name: 'user:create', description: 'Create new users', resource: 'user', action: 'create' },
      { name: 'user:read', description: 'Read user profiles', resource: 'user', action: 'read' },
      { name: 'user:update', description: 'Update any user profile', resource: 'user', action: 'update' },
      { name: 'user:delete', description: 'Delete users', resource: 'user', action: 'delete' },
      { name: 'user:read_self', description: 'Read own user profile', resource: 'user', action: 'read' },
      { name: 'user:update_self', description: 'Update own user profile', resource: 'user', action: 'update' },

      { name: 'role:create', description: 'Create new roles', resource: 'role', action: 'create' },
      { name: 'role:read', description: 'Read roles', resource: 'role', action: 'read' },
      { name: 'role:update', description: 'Update roles', resource: 'role', action: 'update' },
      { name: 'role:delete', description: 'Delete roles', resource: 'role', action: 'delete' },

      { name: 'permission:create', description: 'Create new permissions', resource: 'permission', action: 'create' },
      { name: 'permission:read', description: 'Read permissions', resource: 'permission', action: 'read' },
      { name: 'permission:update', description: 'Update permissions', resource: 'permission', action: 'update' },
      { name: 'permission:delete', description: 'Delete permissions', resource: 'permission', action: 'delete' },
    ];

    const allPermissions = {};
    for (const p of permissionsToSeed) {
      let permission = await Permission.findOne({ name: p.name });
      if (!permission) {
        permission = new Permission(p);
        await permission.save();
        console.log(`Permission created: ${p.name}`);
      }
      allPermissions[p.name] = permission._id;
    }

    const rolesToSeed = [
      { name: 'Admin', description: 'Administrator with full access' },
      { name: 'Manager', description: 'Managerial role with user oversight' },
      { name: 'Employee', description: 'Standard employee role' },
      { name: 'User', description: 'Basic user role for general access' }
    ];

    const seededRoles = {};
    for (const r of rolesToSeed) {
      let role = await Role.findOne({ name: r.name });
      if (!role) {
        role = new Role(r);
        await role.save();
        console.log(`Role created: ${r.name}`);
      }
      seededRoles[r.name] = role;
    }

    if (seededRoles['Admin']) {
      seededRoles['Admin'].permissions = Object.values(allPermissions);
      await seededRoles['Admin'].save();
      console.log('Admin role permissions updated.');
    }

    if (seededRoles['Manager']) {
      seededRoles['Manager'].permissions = [
        allPermissions['user:read'],
        allPermissions['user:update'],
        allPermissions['role:read'],
        allPermissions['permission:read']
      ].filter(Boolean);
      await seededRoles['Manager'].save();
      console.log('Manager role permissions updated.');
    }

    if (seededRoles['Employee']) {
      seededRoles['Employee'].permissions = [
        allPermissions['user:read_self'],
        allPermissions['user:update_self'],
        allPermissions['role:read'],
        allPermissions['permission:read']
      ].filter(Boolean);
      await seededRoles['Employee'].save();
      console.log('Employee role permissions updated.');
    }

    if (seededRoles['User']) {
      seededRoles['User'].permissions = [
        allPermissions['user:read_self'],
        allPermissions['user:update_self']
      ].filter(Boolean);
      await seededRoles['User'].save();
      console.log('User role permissions updated.');
    }


    const adminEmail = process.env.ADMIN_GMAIL || 'admin@example.com';
    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      const hashedPassword = await hashPassword(process.env.ADMIN_PASS || 'adminpassword');
      adminUser = new User({
        name: process.env.ADMIN_NAME || 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: seededRoles['Admin']._id,
        isActive: true
      });
      await adminUser.save();
      console.log('Admin user created successfully.');
    } else {
      console.log('Admin user already exists.');
    }

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    console.log('Seeding process finished.');
    process.exit(0);
  }
};

seedData();