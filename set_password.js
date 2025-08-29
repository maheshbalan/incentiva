const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function setPassword() {
  try {
    const email = 'isabel.torres@goodyear.mx';
    const password = 'exatatech';
    
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Update the user
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });
    
    console.log(`✅ Password set successfully for ${updatedUser.email}`);
    console.log(`   Name: ${updatedUser.firstName} ${updatedUser.lastName}`);
    console.log(`   Role: ${updatedUser.role}`);
    
  } catch (error) {
    console.error('❌ Error setting password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setPassword();
