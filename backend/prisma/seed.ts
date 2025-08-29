import { PrismaClient, UserRole, CampaignStatus, RuleType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const adminPassword = await bcrypt.hash('exatatech', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'incentiva-admin@incentiva.me' },
    update: {},
    create: {
      email: 'incentiva-admin@incentiva.me',
      passwordHash: adminPassword,
      firstName: 'Incentiva',
      lastName: 'Admin',
      role: UserRole.ADMIN,
    },
  })

  console.log('✅ Admin user created:', adminUser.email)

  // Create the Premium Line Sales Campaign
  const campaign = await prisma.campaign.upsert({
    where: { name: 'Premium Line Sales Campaign' },
    update: {},
    create: {
      name: 'Premium Line Sales Campaign',
      description: 'Increase sales of Premium Line products through targeted incentives. Individual goal: 50,000 Brazilian Reals in Premium Line sales. Regional goal: 500,000 Brazilian Reals in Premium Line sales.',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      status: CampaignStatus.ACTIVE,
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
  })

  console.log('✅ Campaign created:', campaign.name)

  // Create campaign rules
  const goalRule = await prisma.campaignRule.create({
    data: {
      campaignId: campaign.id,
      ruleType: RuleType.GOAL,
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
  })

  const eligibilityRule = await prisma.campaignRule.create({
    data: {
      campaignId: campaign.id,
      ruleType: RuleType.ELIGIBILITY,
      ruleDefinition: {
        condition: 'Users must be actively employed until the last day of the campaign',
        description: 'Only active employees are eligible for the campaign',
        validationLogic: 'employee_status = "active" AND termination_date IS NULL'
      }
    },
  })

  const prizeRule1 = await prisma.campaignRule.create({
    data: {
      campaignId: campaign.id,
      ruleType: RuleType.PRIZE,
      ruleDefinition: {
        name: 'Vacation to Cabo',
        description: 'Redeem 50,000 points for a vacation to Cabo',
        pointCost: 50000,
        imageUrl: 'https://generated-graphics.incentiva.com/vacation-cabo.png',
        redemptionCode: 'CABO_VACATION_2024'
      }
    },
  })

  const prizeRule2 = await prisma.campaignRule.create({
    data: {
      campaignId: campaign.id,
      ruleType: RuleType.PRIZE,
      ruleDefinition: {
        name: 'Concert Tickets',
        description: 'Redeem 100,000 points for concert tickets',
        pointCost: 100000,
        imageUrl: 'https://generated-graphics.incentiva.com/concert-tickets.png',
        redemptionCode: 'CONCERT_TICKETS_2024'
      }
    },
  })

  console.log('✅ Campaign rules created')

  // Create campaign schema
  const campaignSchema = await prisma.campaignSchema.create({
    data: {
      campaignId: campaign.id,
      schemaDefinition: {
        tables: [
          {
            name: 'orders',
            fields: [
              { name: 'order_id', type: 'uuid', nullable: false },
              { name: 'order_date', type: 'timestamp', nullable: false },
              { name: 'salesperson_id', type: 'uuid', nullable: false },
              { name: 'region_id', type: 'uuid', nullable: false },
              { name: 'order_status', type: 'varchar', nullable: false },
              { name: 'total_amount', type: 'decimal', nullable: false }
            ],
            primaryKey: 'order_id',
            foreignKeys: [
              { field: 'salesperson_id', referencesTable: 'salespersons', referencesField: 'id' },
              { field: 'region_id', referencesTable: 'regions', referencesField: 'id' }
            ]
          },
          {
            name: 'order_line_items',
            fields: [
              { name: 'line_item_id', type: 'uuid', nullable: false },
              { name: 'order_id', type: 'uuid', nullable: false },
              { name: 'product_id', type: 'uuid', nullable: false },
              { name: 'quantity', type: 'integer', nullable: false },
              { name: 'unit_price', type: 'decimal', nullable: false },
              { name: 'line_total', type: 'decimal', nullable: false }
            ],
            primaryKey: 'line_item_id',
            foreignKeys: [
              { field: 'order_id', referencesTable: 'orders', referencesField: 'order_id' },
              { field: 'product_id', referencesTable: 'products', referencesField: 'id' }
            ]
          },
          {
            name: 'products',
            fields: [
              { name: 'id', type: 'uuid', nullable: false },
              { name: 'name', type: 'varchar', nullable: false },
              { name: 'product_line', type: 'varchar', nullable: false },
              { name: 'category', type: 'varchar', nullable: false },
              { name: 'price', type: 'decimal', nullable: false }
            ],
            primaryKey: 'id'
          },
          {
            name: 'salespersons',
            fields: [
              { name: 'id', type: 'uuid', nullable: false },
              { name: 'name', type: 'varchar', nullable: false },
              { name: 'email', type: 'varchar', nullable: false },
              { name: 'region_id', type: 'uuid', nullable: false },
              { name: 'employee_status', type: 'varchar', nullable: false },
              { name: 'termination_date', type: 'date', nullable: true }
            ],
            primaryKey: 'id',
            foreignKeys: [
              { field: 'region_id', referencesTable: 'regions', referencesField: 'id' }
            ]
          },
          {
            name: 'regions',
            fields: [
              { name: 'id', type: 'uuid', nullable: false },
              { name: 'name', type: 'varchar', nullable: false },
              { name: 'country', type: 'varchar', nullable: false }
            ],
            primaryKey: 'id'
          }
        ],
        relationships: [
          {
            fromTable: 'orders',
            fromField: 'salesperson_id',
            toTable: 'salespersons',
            toField: 'id',
            relationshipType: 'many-to-one'
          },
          {
            fromTable: 'orders',
            fromField: 'region_id',
            toTable: 'regions',
            toField: 'id',
            relationshipType: 'many-to-one'
          },
          {
            fromTable: 'order_line_items',
            fromField: 'order_id',
            toTable: 'orders',
            toField: 'order_id',
            relationshipType: 'many-to-one'
          },
          {
            fromTable: 'order_line_items',
            fromField: 'product_id',
            toTable: 'products',
            toField: 'id',
            relationshipType: 'many-to-one'
          }
        ]
      },
      understandingScore: 0.85,
      feedbackText: 'Schema analysis successful. All required tables and relationships identified for Premium Line sales tracking.'
    },
  })

  console.log('✅ Campaign schema created')

  // Create some sample participants
  const participants = [
    {
      email: 'isabel.torres@goodyear.mx',
      firstName: 'Isabel',
      lastName: 'Torres',
      role: UserRole.PARTICIPANT
    },
    {
      email: 'john.sales@company.com',
      firstName: 'John',
      lastName: 'Sales',
      role: UserRole.PARTICIPANT
    },
    {
      email: 'maria.rodriguez@company.com',
      firstName: 'Maria',
      lastName: 'Rodriguez',
      role: UserRole.PARTICIPANT
    },
    {
      email: 'carlos.silva@company.com',
      firstName: 'Carlos',
      lastName: 'Silva',
      role: UserRole.PARTICIPANT
    }
  ]

  for (const participantData of participants) {
    // Use exatatech password for Isabel, password123 for others
    const password = participantData.email === 'isabel.torres@goodyear.mx' ? 'exatatech' : 'password123'
    
    const participant = await prisma.user.upsert({
      where: { email: participantData.email },
      update: {},
      create: {
        email: participantData.email,
        passwordHash: await bcrypt.hash(password, 12),
        firstName: participantData.firstName,
        lastName: participantData.lastName,
        role: participantData.role,
      },
    })

    // Create user campaign participation
    await prisma.userCampaign.upsert({
      where: {
        userId_campaignId: {
          userId: participant.id,
          campaignId: campaign.id
        }
      },
      update: {},
      create: {
        userId: participant.id,
        campaignId: campaign.id,
        currentPoints: Math.floor(Math.random() * 25000) + 5000, // Random points between 5000-30000
        goalProgress: Math.floor(Math.random() * 60) + 20, // Random progress between 20-80%
      },
    })

    console.log(`✅ Participant created: ${participant.email}`)
  }

  // Create some sample campaign executions
  const executions = [
    { salespersonId: 'SP001', pointsAllocated: 5000, goalAchieved: false },
    { salespersonId: 'SP002', pointsAllocated: 12000, goalAchieved: false },
    { salespersonId: 'SP003', pointsAllocated: 8000, goalAchieved: false },
    { salespersonId: 'SP004', pointsAllocated: 25000, goalAchieved: true },
  ]

  for (const executionData of executions) {
    await prisma.campaignExecution.create({
      data: {
        campaignId: campaign.id,
        salespersonId: executionData.salespersonId,
        pointsAllocated: executionData.pointsAllocated,
        goalAchieved: executionData.goalAchieved,
        executionDate: new Date(),
      },
    })
  }

  console.log('✅ Sample campaign executions created')

  console.log('🎉 Database seeding completed successfully!')
  console.log('📝 Login credentials:')
  console.log('   Admin Email: incentiva-admin@incentiva.me')
  console.log('   Admin Password: exatatech')
  console.log('   Isabel Torres Email: isabel.torres@goodyear.mx')
  console.log('   Isabel Torres Password: exatatech')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 