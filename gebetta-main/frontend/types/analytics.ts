export enum Period {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year'
}

export interface AnalyticsData {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  orderTrends: Array<{
    date: string;
    count: number;
  }>;
  popularItems: Array<{
    name: string;
    orders: number;
  }>;
  customerBreakdown: Array<{
    label: string;
    value: number;
  }>;
}

export interface ChartConfig {
  backgroundGradientFrom: string;
  backgroundGradientTo: string;
  decimalPlaces: number;
  color: (opacity: number) => string;
  labelColor: (opacity: number) => string;
  style: {
    borderRadius: number;
  };
  propsForDots?: {
    r: string;
    strokeWidth: string;
    stroke: string;
  };
  propsForBackgroundLines?: {
    strokeWidth: string;
    stroke: string;
  };
  yAxisLabel: string;
  yAxisSuffix: string;
}
