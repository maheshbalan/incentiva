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

      const pointTypeData = {
        name: `${campaign.name}_Points`,
        description: `Loyalty points for ${campaign.name} campaign`,
        currency: campaign.campaignCurrency || 'MXN',
        isActive: true,
        metadata: {
          campaignId: campaign.id,
          campaignName: campaign.name,
          amountPerPoint: campaign.amountPerPoint
        }
      }

      const response = await this.makeTLPRequest('/api/point-types', 'POST', pointTypeData)

      const artifactLog: TLPArtifactLog = {
        id: `pt_${Date.now()}`,
        campaignId: campaign.id,
        artifactType: 'POINT_TYPE',
        artifactName: pointTypeData.name,
        apiCall: JSON.stringify(pointTypeData, null, 2),
        response: JSON.stringify(response, null, 2),
        status: 'SUCCESS',
        createdAt: new Date()
      }

      logger.info('TLP point type created successfully', {
        campaignId: campaign.id,
        pointTypeId: response.id,
        artifactLogId: artifactLog.id
      })

      return artifactLog
    } catch (error: any) {
      const artifactLog: TLPArtifactLog = {
        id: `pt_${Date.now()}`,
        campaignId: campaign.id,
        artifactType: 'POINT_TYPE',
        artifactName: `${campaign.name}_Points`,
        apiCall: JSON.stringify({ campaignId: campaign.id, campaignName: campaign.name }, null, 2),
        response: '',
        status: 'FAILED',
        createdAt: new Date(),
        errorDetails: error.message
      }

      logger.error('Failed to create TLP point type', {
        campaignId: campaign.id,
        error: error.message,
        artifactLogId: artifactLog.id
      })

      return artifactLog
    }
  }

  /**
   * Mint points for a campaign
   */
  async mintCampaignPoints(campaign: any, totalPoints: number): Promise<TLPArtifactLog> {
    try {
      logger.info('Minting campaign points', { 
        campaignId: campaign.id, 
        campaignName: campaign.name, 
        totalPoints 
      })

      const mintData = {
        pointTypeName: `${campaign.name}_Points`,
        amount: totalPoints,
        description: `Initial point mint for ${campaign.name} campaign`,
        metadata: {
          campaignId: campaign.id,
          campaignName: campaign.name,
          mintType: 'CAMPAIGN_INITIAL'
        }
      }

      const response = await this.makeTLPRequest('/api/point-issues', 'POST', mintData)

      const artifactLog: TLPArtifactLog = {
        id: `pi_${Date.now()}`,
        campaignId: campaign.id,
        artifactType: 'POINT_ISSUE',
        artifactName: `Mint_${campaign.name}_${totalPoints}pts`,
        apiCall: JSON.stringify(mintData, null, 2),
        response: JSON.stringify(response, null, 2),
        status: 'SUCCESS',
        createdAt: new Date()
      }

      logger.info('Campaign points minted successfully', {
        campaignId: campaign.id,
        pointIssueId: response.id,
        totalPoints,
        artifactLogId: artifactLog.id
      })

      return artifactLog
    } catch (error: any) {
      const artifactLog: TLPArtifactLog = {
        id: `pi_${Date.now()}`,
        campaignId: campaign.id,
        artifactType: 'POINT_ISSUE',
        artifactName: `Mint_${campaign.name}_${totalPoints}pts`,
        apiCall: JSON.stringify({ campaignId: campaign.id, totalPoints }, null, 2),
        response: '',
        status: 'FAILED',
        createdAt: new Date(),
        errorDetails: error.message
      }

      logger.error('Failed to mint campaign points', {
        campaignId: campaign.id,
        error: error.message,
        artifactLogId: artifactLog.id
      })

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
        name: `${campaign.name}_Individual_Goal_${participant.firstName}`,
        description: `Bonus points for achieving individual goal in ${campaign.name}`,
        pointTypeName: `${campaign.name}_Points`,
        points: bonusPoints,
        isActive: true,
        metadata: {
          campaignId: campaign.id,
          participantId: participant.id,
          offerType: 'INDIVIDUAL_GOAL_BONUS'
        }
      }

      const response = await this.makeTLPRequest('/api/accrual-offers', 'POST', offerData)

      const artifactLog: TLPArtifactLog = {
        id: `ao_${Date.now()}`,
        campaignId: campaign.id,
        artifactType: 'ACCRUAL_OFFER',
        artifactName: offerData.name,
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
      const artifactLog: TLPArtifactLog = {
        id: `ao_${Date.now()}`,
        campaignId: campaign.id,
        artifactType: 'ACCRUAL_OFFER',
        artifactName: `${campaign.name}_Individual_Goal_${participant.firstName}`,
        apiCall: JSON.stringify({ campaignId: campaign.id, participantId: participant.id, bonusPoints }, null, 2),
        response: '',
        status: 'FAILED',
        createdAt: new Date(),
        errorDetails: error.message
      }

      logger.error('Failed to create individual goal accrual offer', {
        campaignId: campaign.id,
        participantId: participant.id,
        error: error.message,
        artifactLogId: artifactLog.id
      })

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
        name: `${campaign.name}_Overall_Goal_${participant.firstName}`,
        description: `Bonus points for overall campaign goal achievement in ${campaign.name}`,
        pointTypeName: `${campaign.name}_Points`,
        points: bonusPoints,
        isActive: true,
        metadata: {
          campaignId: campaign.id,
          participantId: participant.id,
          offerType: 'OVERALL_GOAL_BONUS'
        }
      }

      const response = await this.makeTLPRequest('/api/accrual-offers', 'POST', offerData)

      const artifactLog: TLPArtifactLog = {
        id: `ao_${Date.now()}`,
        campaignId: campaign.id,
        artifactType: 'ACCRUAL_OFFER',
        artifactName: offerData.name,
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
      const artifactLog: TLPArtifactLog = {
        id: `ao_${Date.now()}`,
        campaignId: campaign.id,
        artifactType: 'ACCRUAL_OFFER',
        artifactName: `${campaign.name}_Overall_Goal_${participant.firstName}`,
        apiCall: JSON.stringify({ campaignId: campaign.id, participantId: participant.id, bonusPoints }, null, 2),
        response: '',
        status: 'FAILED',
        createdAt: new Date(),
        errorDetails: error.message
      }

      logger.error('Failed to create overall goal accrual offer', {
        campaignId: campaign.id,
        participantId: participant.id,
        error: error.message,
        artifactLogId: artifactLog.id
      })

      return artifactLog
    }
  }

  /**
   * Create TLP member for participant
   */
  async createMember(participant: any, campaign: any): Promise<TLPArtifactLog> {
    try {
      logger.info('Creating TLP member', {
        participantId: participant.id,
        campaignId: campaign.id
      })

      const memberData = {
        email: participant.email,
        firstName: participant.firstName,
        lastName: participant.lastName,
        isActive: true,
        metadata: {
          participantId: participant.id,
          campaignId: campaign.id,
          campaignName: campaign.name
        }
      }

      const response = await this.makeTLPRequest('/api/members', 'POST', memberData)

      const artifactLog: TLPArtifactLog = {
        id: `m_${Date.now()}`,
        campaignId: campaign.id,
        artifactType: 'MEMBER',
        artifactName: `${participant.firstName}_${participant.lastName}`,
        apiCall: JSON.stringify(memberData, null, 2),
        response: JSON.stringify(response, null, 2),
        status: 'SUCCESS',
        createdAt: new Date()
      }

      logger.info('TLP member created successfully', {
        participantId: participant.id,
        campaignId: campaign.id,
        memberId: response.id,
        artifactLogId: artifactLog.id
      })

      return artifactLog
    } catch (error: any) {
      const artifactLog: TLPArtifactLog = {
        id: `m_${Date.now()}`,
        campaignId: campaign.id,
        artifactType: 'MEMBER',
        artifactName: `${participant.firstName}_${participant.lastName}`,
        apiCall: JSON.stringify({ participantId: participant.id, campaignId: campaign.id }, null, 2),
        response: '',
        status: 'FAILED',
        createdAt: new Date(),
        errorDetails: error.message
      }

      logger.error('Failed to create TLP member', {
        participantId: participant.id,
        campaignId: campaign.id,
        error: error.message,
        artifactLogId: artifactLog.id
      })

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
        name: `${campaign.name}_Dynamic_${participant.firstName}_${Date.now()}`,
        description: `Points earned for transaction of ${campaign.campaignCurrency} ${transactionAmount}`,
        pointTypeName: `${campaign.name}_Points`,
        points: pointsEarned,
        isActive: true,
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
      const artifactLog: TLPArtifactLog = {
        id: `dao_${Date.now()}`,
        campaignId: campaign.id,
        artifactType: 'ACCRUAL_OFFER',
        artifactName: `${campaign.name}_Dynamic_${participant.firstName}_${Date.now()}`,
        apiCall: JSON.stringify({ campaignId: campaign.id, participantId: participant.id, transactionAmount }, null, 2),
        response: '',
        status: 'FAILED',
        createdAt: new Date(),
        errorDetails: error.message
      }

      logger.error('Failed to create dynamic accrual offer', {
        campaignId: campaign.id,
        participantId: participant.id,
        error: error.message,
        artifactLogId: artifactLog.id
      })

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

      // 2. Mint campaign points
      const totalPoints = campaign.totalPointsMinted || 1000000 // Default 1M points
      const mintArtifact = await this.mintCampaignPoints(campaign, totalPoints)
      artifacts.push(mintArtifact)

      if (mintArtifact.status === 'FAILED') {
        throw new Error('Failed to mint campaign points, aborting campaign setup')
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