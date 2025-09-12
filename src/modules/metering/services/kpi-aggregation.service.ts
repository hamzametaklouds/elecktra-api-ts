import { Injectable } from '@nestjs/common';
import { ValueType } from '../enums/value-type.enum';

@Injectable()
export class KpiAggregationService {
  /**
   * Convert value based on value type
   * @param value Raw value
   * @param fromType Source value type
   * @param toType Target value type
   * @returns Converted value
   */
  convertValue(value: number, fromType: ValueType, toType: ValueType): number {
    if (fromType === toType) return value;

    // Time conversions
    if (this.isTimeType(fromType) && this.isTimeType(toType)) {
      return this.convertTime(value, fromType, toType);
    }

    // Percentage conversions
    if (fromType === ValueType.PERCENTAGE || toType === ValueType.PERCENTAGE) {
      return this.convertPercentage(value, fromType, toType);
    }

    return value;
  }

  /**
   * Check if value type is a time unit
   * @param type Value type to check
   * @returns boolean indicating if type is time unit
   */
  private isTimeType(type: ValueType): boolean {
    return [ValueType.SECONDS, ValueType.MINUTES, ValueType.HOURS].includes(type);
  }

  /**
   * Convert time between different units
   * @param value Time value
   * @param fromType Source time unit
   * @param toType Target time unit
   * @returns Converted time value
   */
  private convertTime(value: number, fromType: ValueType, toType: ValueType): number {
    // Convert to seconds first
    let seconds = value;
    if (fromType === ValueType.MINUTES) {
      seconds = value * 60;
    } else if (fromType === ValueType.HOURS) {
      seconds = value * 3600;
    }

    // Convert from seconds to target unit
    if (toType === ValueType.SECONDS) {
      return seconds;
    } else if (toType === ValueType.MINUTES) {
      return seconds / 60;
    } else if (toType === ValueType.HOURS) {
      return seconds / 3600;
    }

    return value;
  }

  /**
   * Convert between percentage and raw values
   * @param value Value to convert
   * @param fromType Source type
   * @param toType Target type
   * @returns Converted value
   */
  private convertPercentage(value: number, fromType: ValueType, toType: ValueType): number {
    if (fromType === ValueType.PERCENTAGE && toType === ValueType.INT) {
      return value / 100;
    } else if (fromType === ValueType.INT && toType === ValueType.PERCENTAGE) {
      return value * 100;
    }
    return value;
  }

  /**
   * Format value for display based on type
   * @param value Raw value
   * @param type Value type
   * @returns Formatted value string
   */
  formatValue(value: number, type: ValueType): string {
    switch (type) {
      case ValueType.PERCENTAGE:
        return `${value}%`;
      case ValueType.SECONDS:
        return `${value}s`;
      case ValueType.MINUTES:
        return `${value}m`;
      case ValueType.HOURS:
        return `${value}h`;
      case ValueType.INT:
      default:
        return value.toString();
    }
  }

  /**
   * Aggregate multiple values of the same type
   * @param values Array of values to aggregate
   * @param type Value type
   * @param method Aggregation method (sum, avg, min, max)
   * @returns Aggregated value
   */
  aggregate(values: number[], type: ValueType, method: 'sum' | 'avg' | 'min' | 'max' = 'sum'): number {
    if (!values.length) return 0;

    switch (method) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'avg':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      default:
        return values.reduce((a, b) => a + b, 0);
    }
  }
}
