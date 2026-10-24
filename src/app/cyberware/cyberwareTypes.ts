import {
  CYBERWARE_MAX_SLOTS,
  CyberWareSlot,
} from '../../data/cyberwareSlots';

export enum CyberWareTypes {
  frontal = 'frontal_cortex',
  arms = 'arms',
  default = 'default',
  operatingSystem = 'operating_system',
  face = 'face',
  skeleton = 'skeleton',
  hands = 'hands',
  nervousSystem = 'nervous_system',
  circulatorySystem = 'circulatory_system',
  legs = 'legs',
  integumentarySystem = 'integumentary_system',
}

export const maximumSlots = {
  ...CYBERWARE_MAX_SLOTS,
  default: 1,
};

export { CyberWareSlot };
