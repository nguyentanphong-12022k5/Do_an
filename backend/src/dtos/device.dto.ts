export interface CreateDeviceDto {
  name: string;
  ipAddress: string;
  type: 'LINUX' | 'PFSENSE' | 'CISCO';
  snmpCommunity?: string;
  sshUser?: string;
}
