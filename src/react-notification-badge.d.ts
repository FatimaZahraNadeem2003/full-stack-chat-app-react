declare module 'react-notification-badge' {
    import { Component } from 'react';
    
    export interface NotificationBadgeProps {
      count: number;
      effect?: any;
      style?: React.CSSProperties;
      className?: string;
    }
    
    export const Effect: {
      SCALE: any;
    };
    
    export default class NotificationBadge extends Component<NotificationBadgeProps> {}
  }