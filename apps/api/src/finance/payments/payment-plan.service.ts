import { Injectable, BadRequestException } from '@nestjs/common';
import type {
  PaymentPlanInput,
  PaymentPlanCalculation,
  PaymentScheduleItem,
} from '@betflow/shared';

@Injectable()
export class PaymentPlanService {
  /**
   * Calculates a dynamic real estate payment installment schedule.
   */
  calculatePaymentPlan(input: PaymentPlanInput): PaymentPlanCalculation {
    const {
      unitPrice,
      downPaymentPercent,
      installmentsCount,
      handoverPercent,
      startDate: inputStartDate,
    } = input;

    if (!unitPrice || unitPrice <= 0) {
      throw new BadRequestException('unitPrice must be greater than 0');
    }
    if (downPaymentPercent < 0 || downPaymentPercent > 100) {
      throw new BadRequestException(
        'downPaymentPercent must be between 0 and 100',
      );
    }
    if (handoverPercent < 0 || handoverPercent > 100) {
      throw new BadRequestException(
        'handoverPercent must be between 0 and 100',
      );
    }
    if (downPaymentPercent + handoverPercent > 100) {
      throw new BadRequestException(
        'Combined down payment and handover percent cannot exceed 100%',
      );
    }
    if (installmentsCount < 1) {
      throw new BadRequestException('installmentsCount must be at least 1');
    }

    const remainingPercent = 100 - (downPaymentPercent + handoverPercent);
    const installmentPercent = remainingPercent / installmentsCount;

    const downPaymentAmount = (unitPrice * downPaymentPercent) / 100;
    const handoverAmount = (unitPrice * handoverPercent) / 100;
    const installmentAmount = (unitPrice * installmentPercent) / 100;

    const baseDate = inputStartDate ? new Date(inputStartDate) : new Date();
    const schedule: PaymentScheduleItem[] = [];

    // 1. Down Payment (Booking Fee)
    schedule.push({
      installmentNumber: 1,
      label: `Booking / Down Payment (${downPaymentPercent}%)`,
      dueDate: baseDate.toISOString(),
      amount: Math.round(downPaymentAmount * 100) / 100,
      percentage: downPaymentPercent,
      status: 'PENDING',
    });

    // 2. Construction Milestone Installments
    for (let i = 1; i <= installmentsCount; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + i * 3); // Spaced 3 months apart

      schedule.push({
        installmentNumber: i + 1,
        label: `Milestone Installment #${i} (${installmentPercent.toFixed(1)}%)`,
        dueDate: dueDate.toISOString(),
        amount: Math.round(installmentAmount * 100) / 100,
        percentage: Math.round(installmentPercent * 10) / 10,
        status: 'PENDING',
      });
    }

    // 3. Final Handover Payment
    if (handoverPercent > 0) {
      const handoverDate = new Date(baseDate);
      handoverDate.setMonth(
        handoverDate.getMonth() + (installmentsCount + 1) * 3,
      );

      schedule.push({
        installmentNumber: installmentsCount + 2,
        label: `Handover & Key Delivery (${handoverPercent}%)`,
        dueDate: handoverDate.toISOString(),
        amount: Math.round(handoverAmount * 100) / 100,
        percentage: handoverPercent,
        status: 'PENDING',
      });
    }

    return {
      unitPrice,
      downPaymentAmount: Math.round(downPaymentAmount * 100) / 100,
      handoverAmount: Math.round(handoverAmount * 100) / 100,
      installmentAmount: Math.round(installmentAmount * 100) / 100,
      schedule,
    };
  }
}
