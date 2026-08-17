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
   * Guarantees 100% exact cent allocation by using residual balance allocation
   * on the final milestone schedule item to absorb any floating-point rounding drift.
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

    const round2 = (val: number) => Math.round(val * 100) / 100;

    const downPaymentAmount = round2((unitPrice * downPaymentPercent) / 100);
    const handoverAmount = round2((unitPrice * handoverPercent) / 100);
    const installmentAmount = round2((unitPrice * installmentPercent) / 100);

    const baseDate = inputStartDate ? new Date(inputStartDate) : new Date();
    const schedule: PaymentScheduleItem[] = [];

    // 1. Down Payment (Booking Fee)
    schedule.push({
      installmentNumber: 1,
      label: `Booking / Down Payment (${downPaymentPercent}%)`,
      dueDate: baseDate.toISOString(),
      amount: downPaymentAmount,
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
        amount: installmentAmount,
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
        amount: handoverAmount,
        percentage: handoverPercent,
        status: 'PENDING',
      });
    }

    // Residual Allocation: Sum preceding schedule items and assign the exact remaining balance to the final item
    let allocatedSum = 0;
    for (let i = 0; i < schedule.length - 1; i++) {
      allocatedSum += schedule[i].amount;
    }
    allocatedSum = round2(allocatedSum);

    const lastIndex = schedule.length - 1;
    const exactResidualAmount = round2(unitPrice - allocatedSum);
    schedule[lastIndex].amount = Math.max(0, exactResidualAmount);

    const finalHandoverAmount =
      handoverPercent > 0 ? schedule[lastIndex].amount : handoverAmount;

    return {
      unitPrice: round2(unitPrice),
      downPaymentAmount,
      handoverAmount: finalHandoverAmount,
      installmentAmount,
      schedule,
    };
  }
}
