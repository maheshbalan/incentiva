import axios from 'axios'
import { logger } from '../utils/logger'
import { TLPMember, TLPPointType, TLPAccrualOffer, TLPArtifact } from '@incentiva/shared'

export interface TLPConfig {
  apiKey: string
  endpointUrl: string
}

export interface TLPArtifactLog {
  id: string
  campaignId: string
  artifactType: 'POINT_TYPE' | 'POINT_ISSUE' | 'ACCRUAL_OFFER' | 'REDEMPTION_OFFER' | 'MEMBER'
  artifactName: string
  apiCall: string
  response: string
  status: 'SUCCESS' | 'FAILED' | 'PENDING'
  createdAt: Date
  errorDetails?: string
}

export class TLPService {
  private config: TLPConfig
  private baseURL: string

  constructor(config: TLPConfig) {
    this.config = config
    this.baseURL = config.endpointUrl
  }

  private async makeTLPRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: any) {
    try {
      const response = await axios({
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data,
        timeout: 30000 // 30 second timeout
      })

      logger.info('TLP API call successful', {
        endpoint,
        method,
        statusCode: response.status,
        responseSize: JSON.stringify(response.data).length
      })

      return response.data
    } catch (error: any) {
      logger.error('TLP API call failed', {
        endpoint,
        method,
        error: error.message,
        statusCode: error.response?.status,
        responseData: error.response?.data
      })

      throw new Error(`TLP API call failed: ${error.message}`)
    }
  }

  /**
   * Create a new point type in TLP
   */
  async createPointType(campaign: any): Promise<TLPArtifactLog> {
    try {
      logger.info('Creating TLP point type', { campaignId: campaign.id, campaignName: campaign.name })

      // First, get the issuer account ID
      const issuerResponse = await this.makeTLPRequest('/api/issuer', 'GET')
      const accountId = issuerResponse.accountId

      if (!accountId) {
        throw new Error('Could not retrieve issuer account ID from TLP API')
      }

      const pointTypeData = {
        name: campaign.campaignPointTypeName || `${campaign.name} Coins`,
        enabled: true,
        description: `Points that are awarded to team players in ${campaign.name} campaign.`,
        rank: 100,
        convert: {},
        options: {
          showZeroBalance: true
        },
        rate: {
          buy: campaign.pointValue || 1,
          sell: campaign.pointValue || 1,
          currencyCode: campaign.campaignCurrency || 'MXN'
        },
        accountId: accountId
      }

      const response = await this.makeTLPRequest('/api/points', 'POST', pointTypeData)

      const artifactLog: TLPArtifactLog = {
        id: `pt_${Date.now()}`,
        campaignId: campaign.id,
        artifactType: 'POINT_TYPE',
        artifactName: campaign.campaignPointTypeName || `${campaign.name} Coins`,
        apiCall: JSON.stringify(pointTypeData, null, 2),
        response: JSON.stringify(response, null, 2),
        status: 'SUCCESS',
        createdAt: new Date()
      }

      logger.info('TLP point type created successfully', {
        campaignId: campaign.id,
        pointTypeId: response.id,
        pointTypeName: response.name
      })

      return artifactLog
    } catch (error: any) {
      logger.error('Failed to create TLP point type', {
        campaignId: campaign.id,
        error: error.message
      })

      const artifactLog: TLPArtifactLog = {
        id: `pt_${Date.now()}`,
        campaignId: campaign.id,
        artifactType: 'POINT_TYPE',
        artifactName: campaign.campaignPointTypeName || `${campaign.name} Coins`,
        apiCall: JSON.stringify({ campaignId: campaign.id, campaignName: campaign.name }, null, 2),
        response: '',
        status: 'FAILED',
        createdAt: new Date(),
        errorDetails: error.message
      }

      return artifactLog
    }
  }

  /**
   * Issue points to the campaign using TLP transactions/issue endpoint
   */
  async issuePoints(campaign: any, pointTypeId: string): Promise<TLPArtifactLog> {
    try {
      logger.info('Issuing points for campaign', { 
        campaignId: campaign.id, 
        campaignName: campaign.name,
        totalPoints: campaign.totalPointsMinted 
      })

      const issueData = {
        pointTypeId: pointTypeId,
        amount: campaign.totalPointsMinted || 0,
        description: `Initial point issuance for ${campaign.name} campaign`,
        metadata: {
          campaignId: campaign.id,
          campaignName: campaign.name,
          issuanceType: 'CAMPAIGN_INITIAL'
        }
      }

      const response = await this.makeTLPRequest('/api/transactions/issue', 'POST', issueData)

      const artifactLog: TLPArtifactLog = {
        id: `issue_${Date.now()}`,
        campaignId: campaign.id,
        artifactType: 'POINT_ISSUE',
        artifactName: `Point Issue - ${campaign.totalPointsMinted} points`,
        apiCall: JSON.stringify(issueData, null, 2),
        response: JSON.stringify(response, null, 2),
        status: 'SUCCESS',
        createdAt: new Date()
      }

      logger.info('Points issued successfully', {
        campaignId: campaign.id,
        pointTypeId: pointTypeId,
        amount: campaign.totalPointsMinted
      })

      return artifactLog
    } catch (error: any) {
      logger.error('Failed to issue points', {
        campaignId: campaign.id,
        error: error.message
      })

      const artifactLog: TLPArtifactLog = {
        id: `issue_${Date.now()}`,
        campaignId: campaign.id,
        artifactType: 'POINT_ISSUE',
        artifactName: `Point Issue - ${campaign.totalPointsMinted} points`,
        apiCall: JSON.stringify({ campaignId: campaign.id, totalPoints: campaign.totalPointsMinted }, null, 2),
        response: '',
        status: 'FAILED',
        createdAt: new Date(),
        errorDetails: error.message
      }

      return artifactLog
    }
  }

  /**
   * Generate TLP artifacts for campaign execution (Step 1)
   */
  async generateTLPArtifacts(campaign: any): Promise<TLPArtifactLog[]> {
    const artifacts: TLPArtifactLog[] = []
    
    try {
      logger.info('Generating TLP artifacts for campaign', {
        campaignId: campaign.id,
        campaignName: campaign.name
      })

      // 1. Create point type
      const pointTypeArtifact = await this.createPointType(campaign)
      artifacts.push(pointTypeArtifact)

      if (pointTypeArtifact.status === 'FAILED') {
        throw new Error('Failed to create point type')
      }

      // 2. Issue campaign points
      const pointTypeId = pointTypeArtifact.response ? JSON.parse(pointTypeArtifact.response).id : null
      if (!pointTypeId) {
        throw new Error('Could not retrieve point type ID from creation response')
      }
      
      const issueArtifact = await this.issuePoints(campaign, pointTypeId)
      artifacts.push(issueArtifact)

      if (issueArtifact.status === 'FAILED') {
        throw new Error('Failed to issue campaign points')
      }

      logger.info('TLP artifacts generated successfully', {
        campaignId: campaign.id,
        totalArtifacts: artifacts.length,
        successfulArtifacts: artifacts.filter(a => a.status === 'SUCCESS').length
      })

      return artifacts
    } catch (error: any) {
      logger.error('Failed to generate TLP artifacts', {
        campaignId: campaign.id,
        error: error.message,
        artifactsCreated: artifacts.length
      })

      return artifacts
    }
  }

  /**
   * Create a new member in TLP
   */
  async createMember(participant: any, campaign: any): Promise<TLPArtifactLog> {
    try {
      logger.info('Creating TLP member', { 
        participantId: participant.id, 
        campaignId: campaign.id 
      })

      const memberData = {
        externalId: participant.id,
        email: participant.email,
        firstName: participant.firstName,
        lastName: participant.lastName,
        status: 'ACTIVE',
        metadata: {
          campaignId: campaign.id,
          campaignName: campaign.name
        }
      }

      const response = await this.makeTLPRequest('/api/members', 'POST', memberData)

      const artifactLog: TLPArtifactLog = {
        id: `mem_${Date.now()}`,
        campaignId: campaign.id,
        artifactType: 'MEMBER',
        artifactName: `${participant.firstName} ${participant.lastName}`,
        apiCall: JSON.stringify(memberData, null, 2),
        response: JSON.stringify(response, null, 2),
        status: 'SUCCESS',
        createdAt: new Date()
      }

      logger.info('TLP member created successfully', {
        participantId: participant.id,
        memberId: response.id,
        artifactLogId: artifactLog.id
      })

      return artifactLog
    } catch (error: any) {
      logger.error('Failed to create TLP member', {
        participantId: participant.id,
        campaignId: campaign.id,
        error: error.message
      })

      const artifactLog: TLPArtifactLog = {
        id: `mem_${Date.now()}`,
        campaignId: campaign.id,
        artifactType: 'MEMBER',
        artifactName: `${participant.firstName} ${participant.lastName}`,
        apiCall: JSON.stringify({ participantId: participant.id, campaignId: campaign.id }, null, 2),
        response: '',
        status: 'FAILED',
        createdAt: new Date(),
        errorDetails: error.message
      }

      return artifactLog
    }
  }

  /**
   * Create accrual offer for individual goal achievement
   */
  async createIndividualGoalAccrualOffer(campaign: any, participant: any, bonusPoints: number): Promise<TLPArtifactLog> {
    try {
      logger.info('Creating individual goal accrual offer', {
        campaignId: campaign.id,
        participantId: participant.id,
        bonusPoints
      })

      const offerData = {
        name: `${campaign.name} Individual Goal Bonus`,
        description: `Bonus points for achieving individual goal in ${campaign.name}`,
        pointTypeId: 'pt_placeholder', // This would come from the created point type
        accrualRules: {
          type: 'INDIVIDUAL_GOAL',
          bonusPoints: bonusPoints,
          conditions: {
            goalType: 'INDIVIDUAL',
            goalAmount: campaign.individualGoal
          }
        },
        status: 'ACTIVE',
        metadata: {
          campaignId: campaign.id,
          participantId: participant.id,
          offerType: 'INDIVIDUAL_GOAL_BONUS'
        }
      }

      const response = await this.makeTLPRequest('/api/accrual-offers', 'POST', offerData)

      const artifactLog: TLPArtifactLog = {
        id: `acc_${Date.now()}`,
        campaignId: campaign.id,
        artifactType: 'ACCRUAL_OFFER',
        artifactName: `${campaign.name} Individual Goal Bonus`,
        apiCall: JSON.stringify(offerData, null, 2),
        response: JSON.stringify(response, null, 2),
        status: 'SUCCESS',
        createdAt: new Date()
      }

      logger.info('Individual goal accrual offer created successfully', {
        campaignId: campaign.id,
        participantId: participant.id,
        offerId: response.id,
        artifactLogId: artifactLog.id
      })

      return artifactLog
    } catch (error: any) {
      logger.error('Failed to create individual goal accrual offer', {
        campaignId: campaign.id,
        participantId: participant.id,
        error: error.message
      })

      const artifactLog: TLPArtifactLog = {
        id: `acc_${Date.now()}`,
        campaignId: campaign.id,
        artifactType: 'ACCRUAL_OFFER',
        artifactName: `${campaign.name} Individual Goal Bonus`,
        apiCall: JSON.stringify({ campaignId: campaign.id, participantId: participant.id, bonusPoints }, null, 2),
        response: '',
        status: 'FAILED',
        createdAt: new Date(),
        errorDetails: error.message
      }

      return artifactLog
    }
  }

  /**
   * Create dynamic accrual offer for transaction-based points
   */
  async createDynamicAccrualOffer(campaign: any, participant: any, transactionAmount: number): Promise<TLPArtifactLog> {
    try {
      const pointsEarned = Math.ceil(transactionAmount / (campaign.amountPerPoint || 1))
      
      logger.info('Creating dynamic accrual offer', {
        campaignId: campaign.id,
        participantId: participant.id,
        transactionAmount,
        pointsEarned
      })

      const offerData = {
        name: `${campaign.name} Dynamic ${participant.firstName} ${Date.now()}`,
        description: `Points earned for transaction of ${campaign.campaignCurrency} ${transactionAmount}`,
        pointTypeId: 'pt_placeholder', // This would come from the created point type
        accrualRules: {
          type: 'TRANSACTION_ACCRUAL',
          pointsEarned: pointsEarned,
          conditions: {
            transactionAmount: transactionAmount,
            amountPerPoint: campaign.amountPerPoint
          }
        },
        status: 'ACTIVE',
        metadata: {
          campaignId: campaign.id,
          participantId: participant.id,
          offerType: 'TRANSACTION_ACCRUAL',
          transactionAmount,
          amountPerPoint: campaign.amountPerPoint
        }
      }

      const response = await this.makeTLPRequest('/api/accrual-offers', 'POST', offerData)

      const artifactLog: TLPArtifactLog = {
        id: `dao_${Date.now()}`,
        campaignId: campaign.id,
        artifactType: 'ACCRUAL_OFFER',
        artifactName: offerData.name,
        apiCall: JSON.stringify(offerData, null, 2),
        response: JSON.stringify(response, null, 2),
        status: 'SUCCESS',
        createdAt: new Date()
      }

      logger.info('Dynamic accrual offer created successfully', {
        campaignId: campaign.id,
        participantId: participant.id,
        offerId: response.id,
        pointsEarned,
        artifactLogId: artifactLog.id
      })

      return artifactLog
    } catch (error: any) {
      logger.error('Failed to create dynamic accrual offer', {
        campaignId: campaign.id,
        participantId: participant.id,
        error: error.message
      })

      const artifactLog: TLPArtifactLog = {
        id: `dao_${Date.now()}`,
        campaignId: campaign.id,
        artifactType: 'ACCRUAL_OFFER',
        artifactName: `${campaign.name} Dynamic ${participant.firstName} ${Date.now()}`,
        apiCall: JSON.stringify({ campaignId: campaign.id, participantId: participant.id, transactionAmount }, null, 2),
        response: '',
        status: 'FAILED',
        createdAt: new Date(),
        errorDetails: error.message
      }

      return artifactLog
    }
  }

  /**
   * Create accrual offer for overall goal achievement
   */
  async createOverallGoalAccrualOffer(campaign: any, participant: any, bonusPoints: number): Promise<TLPArtifactLog> {
    try {
      logger.info('Creating overall goal accrual offer', {
        campaignId: campaign.id,
        participantId: participant.id,
        bonusPoints
      })

      const offerData = {
        name: `${campaign.name} Overall Goal Bonus`,
        description: `Bonus points for achieving overall campaign goal in ${campaign.name}`,
        pointTypeId: 'pt_placeholder', // This would come from the created point type
        accrualRules: {
          type: 'OVERALL_GOAL',
          bonusPoints: bonusPoints,
          conditions: {
            goalType: 'OVERALL',
            goalAmount: campaign.overallGoal
          }
        },
        status: 'ACTIVE',
        metadata: {
          campaignId: campaign.id,
          participantId: participant.id,
          offerType: 'OVERALL_GOAL_BONUS'
        }
      }

      const response = await this.makeTLPRequest('/api/accrual-offers', 'POST', offerData)

      const artifactLog: TLPArtifactLog = {
        id: `acc_${Date.now()}`,
        campaignId: campaign.id,
        artifactType: 'ACCRUAL_OFFER',
        artifactName: `${campaign.name} Overall Goal Bonus`,
        apiCall: JSON.stringify(offerData, null, 2),
        response: JSON.stringify(response, null, 2),
        status: 'SUCCESS',
        createdAt: new Date()
      }

      logger.info('Overall goal accrual offer created successfully', {
        campaignId: campaign.id,
        participantId: participant.id,
        offerId: response.id,
        artifactLogId: artifactLog.id
      })

      return artifactLog
    } catch (error: any) {
      logger.error('Failed to create overall goal accrual offer', {
        campaignId: campaign.id,
        participantId: participant.id,
        error: error.message
      })

      const artifactLog: TLPArtifactLog = {
        id: `acc_${Date.now()}`,
        campaignId: campaign.id,
        artifactType: 'ACCRUAL_OFFER',
        artifactName: `${campaign.name} Overall Goal Bonus`,
        apiCall: JSON.stringify({ campaignId: campaign.id, participantId: participant.id, bonusPoints }, null, 2),
        response: '',
        status: 'FAILED',
        createdAt: new Date(),
        errorDetails: error.message
      }

      return artifactLog
    }
  }

  /**
   * Execute a complete campaign setup in TLP
   */
  async executeCampaignSetup(campaign: any, participants: any[]): Promise<TLPArtifactLog[]> {
    const artifacts: TLPArtifactLog[] = []
    
    try {
      logger.info('Starting campaign TLP setup', {
        campaignId: campaign.id,
        campaignName: campaign.name,
        participantCount: participants.length
      })

      // 1. Create point type
      const pointTypeArtifact = await this.createPointType(campaign)
      artifacts.push(pointTypeArtifact)

      if (pointTypeArtifact.status === 'FAILED') {
        throw new Error('Failed to create point type, aborting campaign setup')
      }

      // 2. Issue campaign points
      const pointTypeId = pointTypeArtifact.response ? JSON.parse(pointTypeArtifact.response).id : null
      if (!pointTypeId) {
        throw new Error('Could not retrieve point type ID from creation response')
      }
      
      const issueArtifact = await this.issuePoints(campaign, pointTypeId)
      artifacts.push(issueArtifact)

      if (issueArtifact.status === 'FAILED') {
        throw new Error('Failed to issue campaign points, aborting campaign setup')
      }

      // 3. Create members for all participants
      for (const participant of participants) {
        const memberArtifact = await this.createMember(participant, campaign)
        artifacts.push(memberArtifact)
      }

      // 4. Create individual goal bonus offers
      if (campaign.individualGoalBonus) {
        for (const participant of participants) {
          const individualOffer = await this.createIndividualGoalAccrualOffer(
            campaign, 
            participant, 
            campaign.individualGoalBonus
          )
          artifacts.push(individualOffer)
        }
      }

      // 5. Create overall goal bonus offers
      if (campaign.overallGoalBonus) {
        for (const participant of participants) {
          const overallOffer = await this.createOverallGoalAccrualOffer(
            campaign, 
            participant, 
            campaign.overallGoalBonus
          )
          artifacts.push(overallOffer)
        }
      }

      logger.info('Campaign TLP setup completed successfully', {
        campaignId: campaign.id,
        totalArtifacts: artifacts.length,
        successfulArtifacts: artifacts.filter(a => a.status === 'SUCCESS').length
      })

      return artifacts
    } catch (error: any) {
      logger.error('Campaign TLP setup failed', {
        campaignId: campaign.id,
        error: error.message,
        artifactsCreated: artifacts.length
      })

      return artifacts
    }
  }
}

export default TLPService 