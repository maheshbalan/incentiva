import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

export interface TLPConfig {
  apiKey: string;
  endpointUrl: string;
  timeout?: number;
}

export interface TLPAccrualRequest {
  pointTypeId: string;
  participantId: string;
  amount: number;
  description: string;
  metadata?: Record<string, any>;
  externalReference?: string;
}

export interface TLPAccrualResponse {
  success: boolean;
  transactionId?: string;
  pointsAccrued?: number;
  errorMessage?: string;
}

export interface TLPPointType {
  id: string;
  name: string;
  description: string;
  value: number;
  currency: string;
}

export interface TLPOffer {
  id: string;
  name: string;
  description: string;
  pointCost: number;
  type: 'product' | 'service' | 'discount';
}

export class TLPIntegrationService {
  private config: TLPConfig;
  private client: AxiosInstance;

  constructor(config: TLPConfig) {
    this.config = config;
    
    this.client = axios.create({
      baseURL: config.endpointUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Add request/response interceptors for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('TLP API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data
        });
        return config;
      },
      (error) => {
        logger.error('TLP API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.debug('TLP API Response:', {
          status: response.status,
          url: response.config.url,
          data: response.data
        });
        return response;
      },
      (error) => {
        logger.error('TLP API Response Error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  }

  async testConnection(): Promise<boolean> {
    try {
      logger.info('Testing TLP API connection');

      const response = await this.client.get('/health');
      
      if (response.status === 200) {
        logger.info('TLP API connection test successful');
        return true;
      } else {
        logger.warn('TLP API connection test returned unexpected status:', response.status);
        return false;
      }
    } catch (error) {
      logger.error('TLP API connection test failed:', error);
      return false;
    }
  }

  async createPointType(pointType: Omit<TLPPointType, 'id'>): Promise<TLPPointType> {
    try {
      logger.info('Creating TLP point type:', { name: pointType.name });

      const response = await this.client.post('/api/point-types', pointType);
      
      if (response.status === 201 || response.status === 200) {
        const createdPointType = response.data;
        logger.info('TLP point type created successfully:', { 
          id: createdPointType.id, 
          name: createdPointType.name 
        });
        return createdPointType;
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      logger.error('Failed to create TLP point type:', error);
      throw error;
    }
  }

  async getPointType(pointTypeId: string): Promise<TLPPointType> {
    try {
      logger.debug('Retrieving TLP point type:', { pointTypeId });

      const response = await this.client.get(`/api/point-types/${pointTypeId}`);
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      logger.error('Failed to retrieve TLP point type:', error);
      throw error;
    }
  }

  async listPointTypes(): Promise<TLPPointType[]> {
    try {
      logger.debug('Retrieving TLP point types list');

      const response = await this.client.get('/api/point-types');
      
      if (response.status === 200) {
        return response.data.pointTypes || response.data || [];
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      logger.error('Failed to retrieve TLP point types list:', error);
      throw error;
    }
  }

  async createAccrual(accrualRequest: TLPAccrualRequest): Promise<TLPAccrualResponse> {
    try {
      logger.info('Creating TLP accrual:', {
        pointTypeId: accrualRequest.pointTypeId,
        participantId: accrualRequest.participantId,
        amount: accrualRequest.amount
      });

      const response = await this.client.post('/api/accruals', accrualRequest);
      
      if (response.status === 201 || response.status === 200) {
        const result = response.data;
        logger.info('TLP accrual created successfully:', {
          transactionId: result.transactionId,
          pointsAccrued: result.pointsAccrued
        });
        
        return {
          success: true,
          transactionId: result.transactionId,
          pointsAccrued: result.pointsAccrued
        };
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      logger.error('Failed to create TLP accrual:', error);
      
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getAccrual(transactionId: string): Promise<any> {
    try {
      logger.debug('Retrieving TLP accrual:', { transactionId });

      const response = await this.client.get(`/api/accruals/${transactionId}`);
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      logger.error('Failed to retrieve TLP accrual:', error);
      throw error;
    }
  }

  async createOffer(offer: Omit<TLPOffer, 'id'>): Promise<TLPOffer> {
    try {
      logger.info('Creating TLP offer:', { name: offer.name });

      const response = await this.client.post('/api/offers', offer);
      
      if (response.status === 201 || response.status === 200) {
        const createdOffer = response.data;
        logger.info('TLP offer created successfully:', { 
          id: createdOffer.id, 
          name: createdOffer.name 
        });
        return createdOffer;
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      logger.error('Failed to create TLP offer:', error);
      throw error;
    }
  }

  async getOffer(offerId: string): Promise<TLPOffer> {
    try {
      logger.debug('Retrieving TLP offer:', { offerId });

      const response = await this.client.get(`/api/offers/${offerId}`);
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      logger.error('Failed to retrieve TLP offer:', error);
      throw error;
    }
  }

  async listOffers(): Promise<TLPOffer[]> {
    try {
      logger.debug('Retrieving TLP offers list');

      const response = await this.client.get('/api/offers');
      
      if (response.status === 200) {
        return response.data.offers || response.data || [];
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      logger.error('Failed to retrieve TLP offers list:', error);
      throw error;
    }
  }

  async createParticipant(participant: {
    externalId: string;
    email: string;
    firstName: string;
    lastName: string;
    metadata?: Record<string, any>;
  }): Promise<{ id: string; externalId: string }> {
    try {
      logger.info('Creating TLP participant:', { externalId: participant.externalId });

      const response = await this.client.post('/api/participants', participant);
      
      if (response.status === 201 || response.status === 200) {
        const createdParticipant = response.data;
        logger.info('TLP participant created successfully:', { 
          id: createdParticipant.id, 
          externalId: createdParticipant.externalId 
        });
        return createdParticipant;
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      logger.error('Failed to create TLP participant:', error);
      throw error;
    }
  }

  async getParticipant(participantId: string): Promise<any> {
    try {
      logger.debug('Retrieving TLP participant:', { participantId });

      const response = await this.client.get(`/api/participants/${participantId}`);
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      logger.error('Failed to retrieve TLP participant:', error);
      throw error;
    }
  }

  async getParticipantBalance(participantId: string, pointTypeId: string): Promise<number> {
    try {
      logger.debug('Retrieving participant balance:', { participantId, pointTypeId });

      const response = await this.client.get(`/api/participants/${participantId}/balance`, {
        params: { pointTypeId }
      });
      
      if (response.status === 200) {
        return response.data.balance || 0;
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      logger.error('Failed to retrieve participant balance:', error);
      throw error;
    }
  }

  async validateConfiguration(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Validate API key
      if (!this.config.apiKey || this.config.apiKey.trim() === '') {
        errors.push('API key is required');
      }

      // Validate endpoint URL
      if (!this.config.endpointUrl || this.config.endpointUrl.trim() === '') {
        errors.push('Endpoint URL is required');
      } else {
        try {
          new URL(this.config.endpointUrl);
        } catch {
          errors.push('Invalid endpoint URL format');
        }
      }

      // Test connection if configuration is valid
      if (errors.length === 0) {
        const connectionTest = await this.testConnection();
        if (!connectionTest) {
          errors.push('Failed to connect to TLP API');
        }
      }

      const isValid = errors.length === 0;

      logger.info('TLP configuration validation completed:', { 
        isValid, 
        errorCount: errors.length 
      });

      return { valid: isValid, errors };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Configuration validation error: ${errorMsg}`);
      
      logger.error('TLP configuration validation failed:', error);
      return { valid: false, errors };
    }
  }
}
