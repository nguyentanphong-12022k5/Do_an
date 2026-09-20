export interface Device {
  id: string;
  name: string;
  ip_address: string;
  type: string;
  snmp_community?: string;
  ssh_user?: string;
  status: 'UP' | 'DOWN' | 'WARNING' | 'UNKNOWN';
  mute_alerts?: boolean;
  last_checked?: Date;
  created_at?: Date;
}
