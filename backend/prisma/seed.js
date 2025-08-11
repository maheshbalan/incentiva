const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('exatatech', 12);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'incentiva-admin@incentiva.me' },
      update: {},
      create: {
        email: 'incentiva-admin@incentiva.me',
        passwordHash: adminPassword,
        firstName: 'Incentiva',
        lastName: 'Admin',
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user created:', adminUser.email);

    // Create the Premium Line Sales Campaign
    const campaign = await prisma.campaign.upsert({
      where: { name: 'Premium Line Sales Campaign' },
      update: {},
      create: {
        name: 'Premium Line Sales Campaign',
        description: 'Increase sales of Premium Line products through targeted incentives. Individual goal: 50,000 Brazilian Reals in Premium Line sales. Regional goal: 500,000 Brazilian Reals in Premium Line sales.',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'ACTIVE',
        tlpApiKey: 'demo-tlp-api-key',
        tlpEndpointUrl: 'https://exata-customer.pravici.io',
        backendConnectionConfig: {
          host: 'localhost',
          port: 5432,
          database: 'sales_db',
          username: 'sales_user',
          password: 'sales_password'
        },
        createdById: adminUser.id,
      },
    });

    console.log('✅ Campaign created:', campaign.name);

    // Create campaign rules
    const goalRule = await prisma.campaignRule.create({
      data: {
        campaignId: campaign.id,
        ruleType: 'GOAL',
        ruleDefinition: {
          type: 'individual',
          target: 50000,
          currency: 'BRL',
          description: 'Individual goal: 50,000 Brazilian Reals in Premium Line sales',
          calculationLogic: 'SUM(sales_amount) WHERE product_line = "Premium" AND salesperson_id = :salesperson_id'
        },
        generatedCode: `
interface CampaignRules {
  individualGoal: number;
  regionalGoal: number;
  startDate: Date;
  endDate: Date;
  eligibleProductLines: string[];
  excludedOrderStatuses: string[];
}

class PremiumLineCampaign {
  async calculateIndividualPoints(salespersonId: string): Promise<number> {
    // Calculate points based on Premium Line sales
    const sales = await this.getPremiumLineSales(salespersonId);
    const points = Math.floor(sales / 1000) * 100; // 100 points per 1000 BRL
    return Math.min(points, 50000); // Cap at 50,000 points
  }
  
  async calculateRegionalPoints(regionId: string): Promise<number> {
    // Calculate regional points
    const regionalSales = await this.getRegionalPremiumSales(regionId);
    const points = Math.floor(regionalSales / 10000) * 1000; // 1000 points per 10,000 BRL
    return Math.min(points, 100000); // Cap at 100,000 points
  }
}
        `,
        schemaUnderstandingScore: 0.85,
        schemaFeedback: 'Schema analysis successful. Identified sales, products, and regional tables.'
      },
    });

    console.log('✅ Goal rule created');

    const eligibilityRule = await prisma.campaignRule.create({
      data: {
        campaignId: campaign.id,
        ruleType: 'ELIGIBILITY',
        ruleDefinition: {
          condition: 'Users must be actively employed until the last day of the campaign',
          description: 'Only active employees are eligible for the campaign',
          criteria: ['active_employment_status', 'valid_contract']
        },
        generatedCode: `
class EligibilityChecker {
  async checkEligibility(userId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    return user.employmentStatus === 'active' && user.contractValid;
  }
}
        `,
        schemaUnderstandingScore: 0.9,
        schemaFeedback: 'Clear employment and contract validation logic.'
      },
    });

    console.log('✅ Eligibility rule created');

    // Create campaign schema
    const campaignSchema = await prisma.campaignSchema.create({
      data: {
        campaignId: campaign.id,
        schemaDefinition: {
          tables: [
            {
              name: 'sales',
              columns: ['id', 'salesperson_id', 'product_id', 'amount', 'date', 'region_id'],
              relationships: ['products', 'salespeople', 'regions']
            },
            {
              name: 'products',
              columns: ['id', 'name', 'product_line', 'category', 'price'],
              relationships: ['sales']
            },
            {
              name: 'salespeople',
              columns: ['id', 'name', 'region_id', 'employment_status', 'contract_valid'],
              relationships: ['sales', 'regions']
            },
            {
              name: 'regions',
              columns: ['id', 'name', 'country', 'manager_id'],
              relationships: ['sales', 'salespeople']
            }
          ],
          businessRules: [
            'Premium Line products have higher commission rates',
            'Regional managers oversee multiple salespeople',
            'Sales are tracked by product line and region'
          ]
        },
        schemaUnderstandingScore: 0.88,
        schemaFeedback: 'Well-structured sales data model with clear relationships.'
      },
    });

    console.log('✅ Campaign schema created');

    // Create some participant users
    const participantPassword = await bcrypt.hash('password123', 12);
    
    const participant1 = await prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        passwordHash: participantPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'PARTICIPANT',
      },
    });

    const participant2 = await prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        passwordHash: participantPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'PARTICIPANT',
      },
    });

    console.log('✅ Participant users created');

    // Associate users with campaign
    await prisma.userCampaign.create({
      data: {
        userId: participant1.id,
        campaignId: campaign.id,
        enrollmentDate: new Date(),
        status: 'ENROLLED'
      },
    });

    await prisma.userCampaign.create({
      data: {
        userId: participant2.id,
        campaignId: campaign.id,
        enrollmentDate: new Date(),
        status: 'ENROLLED'
      },
    });

    console.log('✅ Users enrolled in campaign');

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });