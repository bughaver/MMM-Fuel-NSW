import { Config, FuelStation } from '../../Types';
import { ValidationResult } from '../BackendTypes';
import { BackendRepository } from './Repository/BackendRepository';
import { ConfigValidationUtils } from './Util/ConfigValidationUtils';

export class BackendService {
  constructor(private backendRepository: BackendRepository) {}

  async validateConfig(config: Config): Promise<ValidationResult> {
    try {
      const referenceData = await this.backendRepository.getReferenceData();
      return await ConfigValidationUtils.validateConfigWithReferenceData(config, referenceData);
    } catch (error) {
      return {
        isValid: false,
        errors: [`API validation failed: ${error}`],
      };
    }
  }

  async getFuelStations(config: Config): Promise<FuelStation[]> {
    const validationResult = await this.validateConfig(config);
    if (!validationResult.isValid) {
      throw new Error(`Configuration validation failed: ${validationResult.errors.join(', ')}`);
    }

    return await this.backendRepository.getFuelStations(config);
  }
}
