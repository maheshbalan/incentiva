import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';
import { 
  TLPPointType, 
  TLPOffer, 
  TLPTransaction, 
  TLPMember 
} from '@incentiva/shared';

export class TLPService {
  private client: AxiosInstance;
  private apiKey: string;
  private endpointUrl: string;

  constructor(apiKey?: string, endpointUrl?: string) {
    this.apiKey = apiKey || process.env.TLP_DEFAULT_API_KEY!;
    this.endpointUrl = endpointUrl || process.env.TLP_DEFAULT_ENDPOINT!;
    
    this.client = axios.create({
      baseURL: this.endpointUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('TLP API response', {
          url: response.config.url,
          method: response.config.method,
          status: response.status
        });
        return response;
      },
      (error) => {
        logger.error('TLP API error', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message
        });
        return Promise.reject(error);
      }
    );
  }

  // Point Type Management
  async createPointType(pointType: TLPPointType): Promise<TLPPointType> {
    try {
      const response = await this.client.post('/points', pointType);
      logger.info('Point type created', { pointTypeId: response.data.id });
      return response.data;
    } catch (error) {
      logger.error('Failed to create point type:', error);
      throw new Error('Failed to create point type');
    }
  }

  async updatePointType(id: string, pointType: Partial<TLPPointType>): Promise<TLPPointType> {
    try {
      const response = await this.client.put(`/points/${id}`, pointType);
      logger.info('Point type updated', { pointTypeId: id });
      return response.data;
    } catch (error) {
      logger.error('Failed to update point type:', error);
      throw new Error('Failed to update point type');
    }
  }

  async getPointType(id: string): Promise<TLPPointType> {
    try {
      const response = await this.client.get(`/points/${id}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get point type:', error);
      throw new Error('Failed to get point type');
    }
  }

  async listPointTypes(): Promise<TLPPointType[]> {
    try {
      const response = await this.client.get('/points');
      return response.data;
    } catch (error) {
      logger.error('Failed to list point types:', error);
      throw new Error('Failed to list point types');
    }
  }

  // Offer Management
  async createOffer(offer: TLPOffer): Promise<TLPOffer> {
    try {
      const response = await this.client.post('/offers', offer);
      logger.info('Offer created', { offerId: response.data.id });
      return response.data;
    } catch (error) {
      logger.error('Failed to create offer:', error);
      throw new Error('Failed to create offer');
    }
  }

  async updateOffer(id: string, offer: Partial<TLPOffer>): Promise<TLPOffer> {
    try {
      const response = await this.client.put(`/offers/${id}`, offer);
      logger.info('Offer updated', { offerId: id });
      return response.data;
    } catch (error) {
      logger.error('Failed to update offer:', error);
      throw new Error('Failed to update offer');
    }
  }

  async getOffer(id: string): Promise<TLPOffer> {
    try {
      const response = await this.client.get(`/offers/${id}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get offer:', error);
      throw new Error('Failed to get offer');
    }
  }

  async listOffers(filters?: Record<string, any>): Promise<TLPOffer[]> {
    try {
      const response = await this.client.get('/offers', { params: filters });
      return response.data;
    } catch (error) {
      logger.error('Failed to list offers:', error);
      throw new Error('Failed to list offers');
    }
  }

  async deleteOffer(id: string): Promise<void> {
    try {
      await this.client.delete(`/offers/${id}`);
      logger.info('Offer deleted', { offerId: id });
    } catch (error) {
      logger.error('Failed to delete offer:', error);
      throw new Error('Failed to delete offer');
    }
  }

  // Transaction Management
  async accruePoints(transaction: TLPTransaction): Promise<TLPTransaction> {
    try {
      const response = await this.client.post('/transactions/accrue', transaction);
      logger.info('Points accrued', { 
        memberId: transaction.memberId,
        points: transaction.points,
        transactionId: response.data.id
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to accrue points:', error);
      throw new Error('Failed to accrue points');
    }
  }

  async redeemPoints(transaction: TLPTransaction): Promise<TLPTransaction> {
    try {
      const response = await this.client.post('/transactions/redeem', transaction);
      logger.info('Points redeemed', { 
        memberId: transaction.memberId,
        points: transaction.points,
        transactionId: response.data.id
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to redeem points:', error);
      throw new Error('Failed to redeem points');
    }
  }

  async issuePoints(transaction: TLPTransaction): Promise<TLPTransaction> {
    try {
      const response = await this.client.post('/transactions/issue', transaction);
      logger.info('Points issued', { 
        memberId: transaction.memberId,
        points: transaction.points,
        transactionId: response.data.id
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to issue points:', error);
      throw new Error('Failed to issue points');
    }
  }

  async getTransaction(id: string): Promise<TLPTransaction> {
    try {
      const response = await this.client.get(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get transaction:', error);
      throw new Error('Failed to get transaction');
    }
  }

  async listTransactions(filters?: Record<string, any>): Promise<TLPTransaction[]> {
    try {
      const response = await this.client.get('/transactions', { params: filters });
      return response.data;
    } catch (error) {
      logger.error('Failed to list transactions:', error);
      throw new Error('Failed to list transactions');
    }
  }

  // Member Management
  async createMember(member: TLPMember): Promise<TLPMember> {
    try {
      const response = await this.client.post('/members', member);
      logger.info('Member created', { memberId: response.data.id });
      return response.data;
    } catch (error) {
      logger.error('Failed to create member:', error);
      throw new Error('Failed to create member');
    }
  }

  async updateMember(id: string, member: Partial<TLPMember>): Promise<TLPMember> {
    try {
      const response = await this.client.put(`/members/${id}`, member);
      logger.info('Member updated', { memberId: id });
      return response.data;
    } catch (error) {
      logger.error('Failed to update member:', error);
      throw new Error('Failed to update member');
    }
  }

  async getMember(id: string): Promise<TLPMember> {
    try {
      const response = await this.client.get(`/members/${id}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get member:', error);
      throw new Error('Failed to get member');
    }
  }

  async listMembers(filters?: Record<string, any>): Promise<TLPMember[]> {
    try {
      const response = await this.client.get('/members', { params: filters });
      return response.data;
    } catch (error) {
      logger.error('Failed to list members:', error);
      throw new Error('Failed to list members');
    }
  }

  async getMemberBalance(memberId: string, pointTypeId: string): Promise<number> {
    try {
      const response = await this.client.get(`/members/${memberId}/balance/${pointTypeId}`);
      return response.data.balance || 0;
    } catch (error) {
      logger.error('Failed to get member balance:', error);
      throw new Error('Failed to get member balance');
    }
  }

  // Tier Management
  async createTier(tier: any): Promise<any> {
    try {
      const response = await this.client.post('/tiers', tier);
      logger.info('Tier created', { tierId: response.data.id });
      return response.data;
    } catch (error) {
      logger.error('Failed to create tier:', error);
      throw new Error('Failed to create tier');
    }
  }

  async updateTier(id: string, tier: any): Promise<any> {
    try {
      const response = await this.client.put(`/tiers/${id}`, tier);
      logger.info('Tier updated', { tierId: id });
      return response.data;
    } catch (error) {
      logger.error('Failed to update tier:', error);
      throw new Error('Failed to update tier');
    }
  }

  // Partner and Location Management
  async createPartner(partner: any): Promise<any> {
    try {
      const response = await this.client.post('/partners', partner);
      logger.info('Partner created', { partnerId: response.data.id });
      return response.data;
    } catch (error) {
      logger.error('Failed to create partner:', error);
      throw new Error('Failed to create partner');
    }
  }

  async createLocation(location: any): Promise<any> {
    try {
      const response = await this.client.post('/locations', location);
      logger.info('Location created', { locationId: response.data.id });
      return response.data;
    } catch (error) {
      logger.error('Failed to create location:', error);
      throw new Error('Failed to create location');
    }
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      logger.error('TLP health check failed:', error);
      return false;
    }
  }

  // Campaign-specific methods
  async createCampaignPointType(campaignName: string): Promise<TLPPointType> {
    const pointType: TLPPointType = {
      name: `${campaignName} Campaign Points`,
      description: `Points earned through ${campaignName} campaign`,
      rank: 1,
      enabled: true,
      options: {
        showZeroPointBalance: true
      }
    };

    return this.createPointType(pointType);
  }

  async createAccrualOffer(
    campaignName: string,
    pointTypeId: string,
    points: number,
    minimumSpend: number
  ): Promise<TLPOffer> {
    const offer: TLPOffer = {
      offerType: 'accrual',
      offerSubtype: 'dynamic',
      name: `${campaignName} Goal Achievement`,
      description: `Earn ${points} points for achieving ${campaignName} goals`,
      points,
      pointType: pointTypeId,
      minimumSpend,
      enabled: true,
      online: false,
      location: true
    };

    return this.createOffer(offer);
  }

  async createRedemptionOffer(
    campaignName: string,
    pointTypeId: string,
    prizeName: string,
    prizeDescription: string,
    pointCost: number,
    imageUrl?: string
  ): Promise<TLPOffer> {
    const offer: TLPOffer = {
      offerType: 'redemption',
      offerSubtype: 'product',
      name: prizeName,
      description: prizeDescription,
      points: pointCost,
      pointType: pointTypeId,
      enabled: true,
      imageUrl
    };

    return this.createOffer(offer);
  }

  async allocatePointsToMember(
    memberId: string,
    pointTypeId: string,
    points: number,
    description: string,
    metadata?: Record<string, any>
  ): Promise<TLPTransaction> {
    const transaction: TLPTransaction = {
      memberId,
      pointType: pointTypeId,
      points,
      transactionType: 'accrue',
      description,
      metadata
    };

    return this.accruePoints(transaction);
  }
}

export const tlpService = new TLPService(); 